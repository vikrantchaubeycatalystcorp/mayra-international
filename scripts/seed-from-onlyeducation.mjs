/**
 * Seed script: Fetch ALL colleges, courses, and exams from OnlyEducation.in Strapi API
 * and insert into our CockroachDB database.
 *
 * Usage: node scripts/seed-from-onlyeducation.mjs
 *
 * Source: https://www.onlyeducation.in
 * API:    https://admin.onlyeducation.co.in/api/
 */

import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

// ── Strapi API config ──────────────────────────────────────────────
const STRAPI_BASE = "https://admin.onlyeducation.co.in";
const STRAPI_TOKEN =
  "9739266bb3e37068ff04ee4ddd928783e584a9d514ea6005e917bea8d6fbdcc12912d87e290417302c6bf2d079c3de0d4db11af97956c6cb5fd2bed0b7fddab643aaf051c99ba4168556530affe53d2d70fbae6124066e6f26532e0465fb4ccf7c84ce8252b61a54fbc2dd53949126811db5dcdf27f86ce231b7946044955208";
const PAGE_SIZE = 100;
const CONCURRENCY = 5; // Parallel API requests

// ── Helpers ────────────────────────────────────────────────────────
function slug(text) {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "")
    .slice(0, 200);
}

async function strapiFetch(path, retries = 3) {
  const url = `${STRAPI_BASE}${path}`;
  for (let attempt = 1; attempt <= retries; attempt++) {
    try {
      const res = await fetch(url, {
        headers: { Authorization: `Bearer ${STRAPI_TOKEN}` },
      });
      if (!res.ok) {
        throw new Error(`Strapi ${res.status}`);
      }
      return res.json();
    } catch (err) {
      if (attempt === retries) throw err;
      await new Promise((r) => setTimeout(r, 1000 * attempt));
    }
  }
}

async function fetchAllPages(endpoint) {
  // First, get page 1 to know total pages
  const sep = endpoint.includes("?") ? "&" : "?";
  const firstUrl = `${endpoint}${sep}pagination[page]=1&pagination[pageSize]=${PAGE_SIZE}`;
  const firstJson = await strapiFetch(firstUrl);
  const pageCount = firstJson.meta?.pagination?.pageCount || 1;
  const total = firstJson.meta?.pagination?.total || 0;
  const all = [...(firstJson.data || [])];
  console.log(`  ${endpoint.split("?")[0]}: ${total} total, ${pageCount} pages`);

  if (pageCount <= 1) return all;

  // Fetch remaining pages in parallel batches
  for (let batchStart = 2; batchStart <= pageCount; batchStart += CONCURRENCY) {
    const promises = [];
    for (let p = batchStart; p < batchStart + CONCURRENCY && p <= pageCount; p++) {
      const url = `${endpoint}${sep}pagination[page]=${p}&pagination[pageSize]=${PAGE_SIZE}`;
      promises.push(strapiFetch(url).then((j) => j.data || []));
    }
    const results = await Promise.all(promises);
    for (const items of results) all.push(...items);
    process.stdout.write(`  ... ${all.length}/${total}\r`);
  }
  console.log(`  Fetched ${all.length}/${total}`);
  return all;
}

// ── Fetch lookup tables ────────────────────────────────────────────
async function fetchLookups() {
  console.log("\n📥 Fetching lookup tables...");

  // Streams (16)
  const streamsRaw = await fetchAllPages("/api/streams");
  const streamMap = {};
  for (const s of streamsRaw) {
    const attrs = s.attributes || s;
    streamMap[s.id] = attrs.stream_name || attrs.title || `Stream-${s.id}`;
  }
  console.log(`  Streams: ${Object.keys(streamMap).length}`);

  // States (35)
  const statesRaw = await fetchAllPages("/api/indian-states");
  const stateMap = {};
  for (const s of statesRaw) {
    const attrs = s.attributes || s;
    stateMap[s.id] = attrs.state_name || attrs.title || `State-${s.id}`;
  }
  console.log(`  States: ${Object.keys(stateMap).length}`);

  // Cities (1232) - fetch with state relation
  const citiesRaw = await fetchAllPages(
    "/api/indian-cities?populate[indian_state][fields][0]=title"
  );
  const cityMap = {};
  for (const c of citiesRaw) {
    const attrs = c.attributes || c;
    const cityName = attrs.title || `City-${c.id}`;
    let stateName = "";
    const stateRel =
      attrs.indian_state?.data?.attributes ||
      attrs.indian_state?.data ||
      attrs.indian_state;
    if (stateRel) {
      stateName =
        stateRel.state_name || stateRel.title || stateMap[stateRel.id] || "";
    }
    cityMap[c.id] = { city: cityName, state: stateName };
  }
  console.log(`  Cities: ${Object.keys(cityMap).length}`);

  return { streamMap, stateMap, cityMap };
}

// ── Fetch & transform universities → colleges ─────────────────────
async function fetchColleges(lookups) {
  console.log("\n📥 Fetching universities (colleges)...");
  const raw = await fetchAllPages(
    "/api/universityyys?populate=indian_city,streams,logo,state"
  );

  console.log(`\n  Total universities fetched: ${raw.length}`);
  const colleges = [];
  const seenSlugs = new Set();

  for (const item of raw) {
    const a = item.attributes || item;

    // Extract city & state
    let city = "";
    let state = "";
    const cityRel = a.indian_city?.data;
    if (cityRel) {
      const cityId = cityRel.id;
      if (lookups.cityMap[cityId]) {
        city = lookups.cityMap[cityId].city;
        state = lookups.cityMap[cityId].state;
      } else {
        city = cityRel.attributes?.title || "";
      }
    }
    // Fallback: state relation
    if (!state) {
      const stateRel = a.state?.data;
      if (stateRel) {
        state =
          stateRel.attributes?.title ||
          lookups.stateMap[stateRel.id] ||
          "";
      }
    }

    // Streams
    const streamIds =
      a.streams?.data?.map((s) => s.id) || a.streams?.map?.((s) => s.id) || [];
    const streams = streamIds
      .map((id) => lookups.streamMap[id])
      .filter(Boolean);

    // Logo
    let logo = "";
    const logoData = a.logo?.data;
    if (logoData) {
      const logoAttrs = logoData.attributes || logoData;
      logo = logoAttrs?.url || "";
    }

    // Fees - use defaults since we're not populating fees1 for speed
    let feesMin = 50000;
    let feesMax = 500000;

    // Accreditation
    const accreditation = a.accreditation
      ? a.accreditation
          .split(/[,&\/]/)
          .map((s) => s.trim())
          .filter(Boolean)
      : [];

    // Highlights - skip facilities populate for speed
    const highlights = [];

    // Type
    const type = a.ownership || "Private";

    // Packages
    let avgPackage = null;
    let topPackage = null;
    if (a.averagePackage) {
      avgPackage =
        typeof a.averagePackage === "number"
          ? a.averagePackage
          : parseInt(String(a.averagePackage).replace(/[^0-9]/g, "")) || null;
    }
    if (a.highestPackage) {
      topPackage =
        typeof a.highestPackage === "number"
          ? a.highestPackage
          : parseInt(String(a.highestPackage).replace(/[^0-9]/g, "")) || null;
    }

    // Unique slug
    let collegeSlug = a.slug || slug(a.title || `college-${item.id}`);
    if (seenSlugs.has(collegeSlug)) {
      collegeSlug = `${collegeSlug}-${item.id}`;
    }
    seenSlugs.add(collegeSlug);

    colleges.push({
      name: (a.title || "").slice(0, 500),
      slug: collegeSlug.slice(0, 500),
      logo,
      city,
      state,
      streams,
      rating: 4.0,
      reviewCount: 0,
      established: 2000,
      type,
      feesMin,
      feesMax,
      avgPackage,
      topPackage,
      accreditation,
      courses: streams, // Use streams as course categories
      description: (a.description || "").slice(0, 5000),
      highlights,
      address: city && state ? `${city}, ${state}` : city || state || "",
      isFeatured: false,
      isActive: true,
      source: "onlyeducation",
      countryCode: "IN",
      countryName: "India",
    });
  }

  return colleges;
}

// ── Fetch & transform courses ─────────────────────────────────────
async function fetchCourses(lookups) {
  console.log("\n📥 Fetching courses...");
  const raw = await fetchAllPages("/api/coursees?populate=streams");

  console.log(`\n  Total courses fetched: ${raw.length}`);
  const courses = [];
  const seenSlugs = new Set();

  for (const item of raw) {
    const a = item.attributes || item;

    // Stream
    const streamData = a.streams?.data || a.streams || [];
    const streamArr = Array.isArray(streamData) ? streamData : [streamData];
    let stream = "General";
    if (streamArr.length > 0) {
      const first = streamArr[0];
      const sid = first?.id || first;
      stream = lookups.streamMap[sid] || first?.attributes?.stream_name || "General";
    }

    // Duration
    const duration = a.average_duration || "3 Years";

    // Fees
    let avgFees = 100000;
    if (a.average_fees) {
      const feesStr = String(a.average_fees);
      // Parse patterns like "25 K-1 L INR", "2-10 Lakh", etc.
      const numbers = feesStr.match(/[\d.]+/g) || [];
      if (numbers.length > 0) {
        let val = parseFloat(numbers[0]);
        if (/l/i.test(feesStr)) val *= 100000;
        else if (/k/i.test(feesStr)) val *= 1000;
        avgFees = Math.round(val) || 100000;
      }
    }

    // Level - infer from title/duration
    let level = "UG";
    const title = (a.title || "").toLowerCase();
    if (
      title.includes("phd") ||
      title.includes("ph.d") ||
      title.includes("doctoral")
    )
      level = "PhD";
    else if (
      title.includes("master") ||
      title.includes("m.tech") ||
      title.includes("mba") ||
      title.includes("m.sc") ||
      title.includes("m.a") ||
      title.includes("mds") ||
      title.includes("m.des") ||
      title.includes("llm") ||
      title.includes("pgdm") ||
      title.includes("pg ") ||
      title.includes("post")
    )
      level = "PG";
    else if (
      title.includes("diploma") ||
      title.includes("certificate")
    )
      level = "Diploma";

    let courseSlug = a.slug || slug(a.title || `course-${item.id}`);
    if (seenSlugs.has(courseSlug)) {
      courseSlug = `${courseSlug}-${item.id}`;
    }
    seenSlugs.add(courseSlug);

    courses.push({
      name: (a.title || "").slice(0, 500),
      slug: courseSlug.slice(0, 500),
      stream,
      level,
      duration,
      description: (a.description || "").slice(0, 5000),
      avgFees,
      isFeatured: false,
      isActive: true,
      source: "onlyeducation",
    });
  }

  return courses;
}

// ── Fetch & transform exams ───────────────────────────────────────
async function fetchExams(lookups) {
  console.log("\n📥 Fetching exams...");
  const raw = await fetchAllPages("/api/exams?populate=streams");

  console.log(`\n  Total exams fetched: ${raw.length}`);
  const exams = [];
  const seenSlugs = new Set();

  for (const item of raw) {
    const a = item.attributes || item;

    // Streams
    const streamData = a.streams?.data || a.streams || [];
    const streamArr = Array.isArray(streamData) ? streamData : [streamData];
    const streams = streamArr
      .map((s) => {
        const sid = s?.id || s;
        return lookups.streamMap[sid] || s?.attributes?.stream_name || null;
      })
      .filter(Boolean);

    // Parse name and fullName from title like "CLAT - Common Law Admission Test"
    const titleStr = a.title || `Exam-${item.id}`;
    let name = titleStr;
    let fullName = a.main_exam_title || titleStr;
    const dashSplit = titleStr.split(" - ");
    if (dashSplit.length >= 2) {
      name = dashSplit[0].trim();
      if (!a.main_exam_title) {
        fullName = dashSplit.slice(1).join(" - ").trim();
      }
    }

    // Mode
    let mode = "Offline";
    if (a.exam_type) {
      mode = a.exam_type.charAt(0).toUpperCase() + a.exam_type.slice(1);
    }

    // Level
    const level = a.exam_level || "National";

    // Conducting body
    const conductingBody = a.conducting_body || "Various Bodies";

    let examSlug = a.slug || slug(titleStr);
    if (seenSlugs.has(examSlug)) {
      examSlug = `${examSlug}-${item.id}`;
    }
    seenSlugs.add(examSlug);

    // Syllabus
    const syllabusRaw = Array.isArray(a.syllabus) ? a.syllabus : [];
    const syllabus = syllabusRaw.map((s) => ({
      subject: s.subject_name || "General",
      topics:
        (Array.isArray(s.units) ? s.units : [])
          .map((u) => u.syllabus_heading || "")
          .filter(Boolean),
    }));

    exams.push({
      name: name.slice(0, 500),
      slug: examSlug.slice(0, 500),
      fullName: fullName.slice(0, 500),
      conductingBody,
      streams,
      level,
      mode,
      description: "",
      isFeatured: false,
      isActive: true,
      source: "onlyeducation",
      syllabus: syllabus.length > 0 ? syllabus : [],
    });
  }

  return exams;
}

// ── Database operations ───────────────────────────────────────────
async function deleteExistingData() {
  console.log("\n🗑️  Deleting existing college, exam, and course data...");

  // Delete in correct order (children first due to foreign keys)
  const delCollegeAdmission = prisma.collegeAdmissionInfo.deleteMany({});
  const delCollegeFee = prisma.collegeFeeStructure.deleteMany({});
  const delCollegeRecruiter = prisma.collegeRecruiter.deleteMany({});
  const delCollegeGallery = prisma.collegeGallery.deleteMany({});

  // Run child deletes in parallel
  const [r1, r2, r3, r4] = await Promise.all([
    delCollegeAdmission,
    delCollegeFee,
    delCollegeRecruiter,
    delCollegeGallery,
  ]);
  console.log(
    `  Deleted: ${r1.count} admission infos, ${r2.count} fee structures, ${r3.count} recruiters, ${r4.count} gallery items`
  );

  // Now delete parent tables
  const [rCollege, rExam, rCourse] = await Promise.all([
    prisma.college.deleteMany({}),
    prisma.exam.deleteMany({}),
    prisma.course.deleteMany({}),
  ]);
  console.log(
    `  Deleted: ${rCollege.count} colleges, ${rExam.count} exams, ${rCourse.count} courses`
  );
}

async function insertColleges(colleges) {
  console.log(`\n📤 Inserting ${colleges.length} colleges...`);
  const BATCH = 500;
  let inserted = 0;

  for (let i = 0; i < colleges.length; i += BATCH) {
    const batch = colleges.slice(i, i + BATCH);
    try {
      const result = await prisma.college.createMany({
        data: batch,
        skipDuplicates: true,
      });
      inserted += result.count;
      process.stdout.write(
        `  Batch ${Math.floor(i / BATCH) + 1}: inserted ${result.count} (total: ${inserted}/${colleges.length})\n`
      );
    } catch (err) {
      console.error(`  Batch error at offset ${i}:`, err.message);
      // Try inserting one by one for this batch
      for (const college of batch) {
        try {
          await prisma.college.create({ data: college });
          inserted++;
        } catch (e) {
          // Skip duplicates or invalid records
        }
      }
    }
  }
  console.log(`  ✅ Total colleges inserted: ${inserted}`);
  return inserted;
}

async function insertCourses(courses) {
  console.log(`\n📤 Inserting ${courses.length} courses...`);
  const BATCH = 200;
  let inserted = 0;

  for (let i = 0; i < courses.length; i += BATCH) {
    const batch = courses.slice(i, i + BATCH);
    try {
      const result = await prisma.course.createMany({
        data: batch,
        skipDuplicates: true,
      });
      inserted += result.count;
      process.stdout.write(
        `  Batch ${Math.floor(i / BATCH) + 1}: inserted ${result.count} (total: ${inserted}/${courses.length})\n`
      );
    } catch (err) {
      console.error(`  Batch error:`, err.message);
      for (const course of batch) {
        try {
          await prisma.course.create({ data: course });
          inserted++;
        } catch (e) {}
      }
    }
  }
  console.log(`  ✅ Total courses inserted: ${inserted}`);
  return inserted;
}

async function insertExams(exams) {
  console.log(`\n📤 Inserting ${exams.length} exams...`);
  const BATCH = 200;
  let inserted = 0;

  for (let i = 0; i < exams.length; i += BATCH) {
    const batch = exams.slice(i, i + BATCH);
    try {
      const result = await prisma.exam.createMany({
        data: batch,
        skipDuplicates: true,
      });
      inserted += result.count;
      process.stdout.write(
        `  Batch ${Math.floor(i / BATCH) + 1}: inserted ${result.count} (total: ${inserted}/${exams.length})\n`
      );
    } catch (err) {
      console.error(`  Batch error:`, err.message);
      for (const exam of batch) {
        try {
          await prisma.exam.create({ data: exam });
          inserted++;
        } catch (e) {}
      }
    }
  }
  console.log(`  ✅ Total exams inserted: ${inserted}`);
  return inserted;
}

// ── Main ──────────────────────────────────────────────────────────
async function main() {
  console.log("═══════════════════════════════════════════════════════");
  console.log("  OnlyEducation.in → Mayra International Data Seed");
  console.log("  Source: https://www.onlyeducation.in");
  console.log("═══════════════════════════════════════════════════════");

  const startTime = Date.now();

  // Step 1: Fetch lookups
  const lookups = await fetchLookups();

  // Step 2: Fetch all data from Strapi
  const colleges = await fetchColleges(lookups);
  const courses = await fetchCourses(lookups);
  const exams = await fetchExams(lookups);

  console.log("\n════════════════════════════════════════════════");
  console.log(`  Fetched: ${colleges.length} colleges, ${courses.length} courses, ${exams.length} exams`);
  console.log("════════════════════════════════════════════════");

  // Step 3: Delete existing data
  await deleteExistingData();

  // Step 4: Insert new data
  const cCount = await insertColleges(colleges);
  const crCount = await insertCourses(courses);
  const eCount = await insertExams(exams);

  const elapsed = ((Date.now() - startTime) / 1000).toFixed(1);
  console.log("\n═══════════════════════════════════════════════════════");
  console.log("  ✅ SEED COMPLETE");
  console.log(`  Colleges: ${cCount}`);
  console.log(`  Courses:  ${crCount}`);
  console.log(`  Exams:    ${eCount}`);
  console.log(`  Time:     ${elapsed}s`);
  console.log("═══════════════════════════════════════════════════════\n");
}

main()
  .catch((err) => {
    console.error("❌ Fatal error:", err);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
