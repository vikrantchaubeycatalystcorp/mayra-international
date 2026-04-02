-- CreateTable
CREATE TABLE "College" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "logo" TEXT NOT NULL DEFAULT '',
    "city" TEXT NOT NULL DEFAULT '',
    "state" TEXT NOT NULL DEFAULT '',
    "streams" TEXT[],
    "nirfRank" INTEGER,
    "rating" DOUBLE PRECISION NOT NULL DEFAULT 4.0,
    "reviewCount" INTEGER NOT NULL DEFAULT 50,
    "established" INTEGER NOT NULL DEFAULT 2000,
    "type" TEXT NOT NULL DEFAULT 'Private',
    "feesMin" INTEGER NOT NULL DEFAULT 50000,
    "feesMax" INTEGER NOT NULL DEFAULT 500000,
    "avgPackage" INTEGER,
    "topPackage" INTEGER,
    "placementRate" DOUBLE PRECISION,
    "accreditation" TEXT[],
    "courses" TEXT[],
    "description" TEXT NOT NULL DEFAULT '',
    "highlights" TEXT[],
    "address" TEXT NOT NULL DEFAULT '',
    "website" TEXT,
    "phone" TEXT,
    "totalStudents" INTEGER,
    "faculty" INTEGER,
    "isFeatured" BOOLEAN NOT NULL DEFAULT false,
    "latitude" DOUBLE PRECISION,
    "longitude" DOUBLE PRECISION,
    "countryCode" TEXT NOT NULL DEFAULT 'IN',
    "countryName" TEXT NOT NULL DEFAULT 'India',
    "source" TEXT NOT NULL DEFAULT 'static',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "College_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Exam" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "fullName" TEXT NOT NULL,
    "conductingBody" TEXT NOT NULL,
    "streams" TEXT[],
    "level" TEXT NOT NULL,
    "registrationStart" TEXT,
    "registrationEnd" TEXT,
    "examDate" TEXT,
    "resultDate" TEXT,
    "eligibility" TEXT NOT NULL DEFAULT '',
    "applicationFeeGeneral" INTEGER NOT NULL DEFAULT 0,
    "applicationFeeSCST" INTEGER,
    "mode" TEXT NOT NULL DEFAULT 'Offline',
    "frequency" TEXT NOT NULL DEFAULT 'Annual',
    "totalSeats" INTEGER,
    "participatingColleges" INTEGER,
    "description" TEXT NOT NULL DEFAULT '',
    "syllabus" JSONB NOT NULL DEFAULT '[]',
    "isFeatured" BOOLEAN NOT NULL DEFAULT false,
    "source" TEXT NOT NULL DEFAULT 'static',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Exam_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Course" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "stream" TEXT NOT NULL,
    "level" TEXT NOT NULL,
    "duration" TEXT NOT NULL,
    "description" TEXT NOT NULL DEFAULT '',
    "topColleges" INTEGER NOT NULL DEFAULT 10,
    "avgFees" INTEGER NOT NULL DEFAULT 100000,
    "avgSalary" INTEGER,
    "isFeatured" BOOLEAN NOT NULL DEFAULT false,
    "icon" TEXT,
    "color" TEXT,
    "source" TEXT NOT NULL DEFAULT 'static',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Course_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "NewsArticle" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "category" TEXT NOT NULL,
    "summary" TEXT NOT NULL DEFAULT '',
    "content" TEXT NOT NULL DEFAULT '',
    "publishedAt" TEXT NOT NULL,
    "imageColor" TEXT NOT NULL DEFAULT '#3B82F6',
    "author" TEXT NOT NULL DEFAULT 'Editorial Team',
    "isLive" BOOLEAN NOT NULL DEFAULT false,
    "tags" TEXT[],
    "views" INTEGER,
    "source" TEXT NOT NULL DEFAULT 'static',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "NewsArticle_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "College_slug_key" ON "College"("slug");

-- CreateIndex
CREATE INDEX "College_slug_idx" ON "College"("slug");

-- CreateIndex
CREATE INDEX "College_streams_idx" ON "College"("streams");

-- CreateIndex
CREATE INDEX "College_isFeatured_idx" ON "College"("isFeatured");

-- CreateIndex
CREATE INDEX "College_nirfRank_idx" ON "College"("nirfRank");

-- CreateIndex
CREATE UNIQUE INDEX "Exam_slug_key" ON "Exam"("slug");

-- CreateIndex
CREATE INDEX "Exam_slug_idx" ON "Exam"("slug");

-- CreateIndex
CREATE INDEX "Exam_streams_idx" ON "Exam"("streams");

-- CreateIndex
CREATE INDEX "Exam_isFeatured_idx" ON "Exam"("isFeatured");

-- CreateIndex
CREATE UNIQUE INDEX "Course_slug_key" ON "Course"("slug");

-- CreateIndex
CREATE INDEX "Course_slug_idx" ON "Course"("slug");

-- CreateIndex
CREATE INDEX "Course_stream_idx" ON "Course"("stream");

-- CreateIndex
CREATE INDEX "Course_isFeatured_idx" ON "Course"("isFeatured");

-- CreateIndex
CREATE UNIQUE INDEX "NewsArticle_slug_key" ON "NewsArticle"("slug");

-- CreateIndex
CREATE INDEX "NewsArticle_slug_idx" ON "NewsArticle"("slug");

-- CreateIndex
CREATE INDEX "NewsArticle_category_idx" ON "NewsArticle"("category");

-- CreateIndex
CREATE INDEX "NewsArticle_isLive_idx" ON "NewsArticle"("isLive");
