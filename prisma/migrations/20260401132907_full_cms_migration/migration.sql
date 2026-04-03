-- AlterTable
ALTER TABLE "NewsArticle" ADD COLUMN     "imageUrl" TEXT;

-- CreateTable
CREATE TABLE "Stream" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "icon" TEXT,
    "color" TEXT,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Stream_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "State" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "countryCode" TEXT NOT NULL DEFAULT 'IN',
    "isActive" BOOLEAN NOT NULL DEFAULT true,

    CONSTRAINT "State_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "City" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "stateId" TEXT NOT NULL,

    CONSTRAINT "City_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AccreditationBody" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "fullName" TEXT,
    "description" TEXT,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "AccreditationBody_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Tag" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "slug" TEXT NOT NULL,

    CONSTRAINT "Tag_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CollegeGallery" (
    "id" TEXT NOT NULL,
    "collegeId" TEXT NOT NULL,
    "imageUrl" TEXT NOT NULL,
    "caption" TEXT,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "CollegeGallery_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CollegeRecruiter" (
    "id" TEXT NOT NULL,
    "collegeId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "logo" TEXT,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "CollegeRecruiter_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CollegeFeeStructure" (
    "id" TEXT NOT NULL,
    "collegeId" TEXT NOT NULL,
    "program" TEXT NOT NULL,
    "annual" INTEGER NOT NULL,
    "hostel" INTEGER,
    "total" INTEGER,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "CollegeFeeStructure_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CollegeAdmissionInfo" (
    "id" TEXT NOT NULL,
    "collegeId" TEXT NOT NULL,
    "eligibility" TEXT NOT NULL DEFAULT '',
    "process" TEXT NOT NULL DEFAULT '',
    "documentsRequired" TEXT[],
    "importantDates" JSONB NOT NULL DEFAULT '[]',
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "CollegeAdmissionInfo_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "NavigationItem" (
    "id" TEXT NOT NULL,
    "parentId" TEXT,
    "label" TEXT NOT NULL,
    "href" TEXT NOT NULL,
    "icon" TEXT,
    "description" TEXT,
    "target" TEXT NOT NULL DEFAULT '_self',
    "section" TEXT NOT NULL DEFAULT 'main',
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "isMega" BOOLEAN NOT NULL DEFAULT false,
    "megaGroupTitle" TEXT,
    "featuredTitle" TEXT,
    "featuredItems" TEXT[],
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "NavigationItem_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "FooterSection" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "FooterSection_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "FooterLink" (
    "id" TEXT NOT NULL,
    "sectionId" TEXT NOT NULL,
    "label" TEXT NOT NULL,
    "href" TEXT NOT NULL,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "FooterLink_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "HeroBanner" (
    "id" TEXT NOT NULL,
    "badgeText" TEXT,
    "badgeLinkText" TEXT,
    "badgeLink" TEXT,
    "heading" TEXT NOT NULL,
    "headingHighlight" TEXT,
    "subheading" TEXT,
    "bgImage" TEXT,
    "ctaText" TEXT NOT NULL DEFAULT 'Search',
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "HeroBanner_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "HeroStat" (
    "id" TEXT NOT NULL,
    "bannerId" TEXT NOT NULL,
    "icon" TEXT NOT NULL,
    "value" TEXT NOT NULL,
    "label" TEXT NOT NULL,
    "color" TEXT NOT NULL DEFAULT 'text-blue-300',
    "sortOrder" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "HeroStat_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "HeroSearchTab" (
    "id" TEXT NOT NULL,
    "bannerId" TEXT NOT NULL,
    "label" TEXT NOT NULL,
    "placeholder" TEXT NOT NULL,
    "searchPath" TEXT NOT NULL,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "HeroSearchTab_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "HeroQuickFilter" (
    "id" TEXT NOT NULL,
    "bannerId" TEXT NOT NULL,
    "tab" TEXT NOT NULL,
    "label" TEXT NOT NULL,
    "href" TEXT NOT NULL,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "HeroQuickFilter_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "HeroPopularSearch" (
    "id" TEXT NOT NULL,
    "bannerId" TEXT NOT NULL,
    "label" TEXT NOT NULL,
    "href" TEXT NOT NULL,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "HeroPopularSearch_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "HeroFloatingCard" (
    "id" TEXT NOT NULL,
    "bannerId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "subtitle" TEXT,
    "content" JSONB,
    "position" TEXT NOT NULL DEFAULT 'left',
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "HeroFloatingCard_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "HomeStat" (
    "id" TEXT NOT NULL,
    "icon" TEXT NOT NULL,
    "value" INTEGER NOT NULL,
    "suffix" TEXT NOT NULL DEFAULT '+',
    "label" TEXT NOT NULL,
    "sublabel" TEXT,
    "color" TEXT NOT NULL DEFAULT 'from-blue-600 to-blue-400',
    "bgColor" TEXT NOT NULL DEFAULT 'bg-blue-50',
    "iconColor" TEXT NOT NULL DEFAULT 'text-blue-600',
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "HomeStat_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Announcement" (
    "id" TEXT NOT NULL,
    "text" TEXT NOT NULL,
    "linkText" TEXT,
    "link" TEXT,
    "bgColor" TEXT NOT NULL DEFAULT 'bg-primary-600',
    "textColor" TEXT NOT NULL DEFAULT 'text-white',
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "startDate" TIMESTAMP(3),
    "endDate" TIMESTAMP(3),
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Announcement_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SocialLink" (
    "id" TEXT NOT NULL,
    "platform" TEXT NOT NULL,
    "url" TEXT NOT NULL,
    "icon" TEXT NOT NULL,
    "hoverColor" TEXT NOT NULL DEFAULT 'hover:text-sky-400',
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "isActive" BOOLEAN NOT NULL DEFAULT true,

    CONSTRAINT "SocialLink_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CompanyInfo" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL DEFAULT 'Mayra International',
    "tagline" TEXT NOT NULL DEFAULT 'India''s most trusted education platform',
    "description" TEXT NOT NULL DEFAULT '',
    "email" TEXT NOT NULL DEFAULT 'info@mayrainternational.com',
    "phone" TEXT NOT NULL DEFAULT '1800-123-4567',
    "phoneLabel" TEXT NOT NULL DEFAULT '(Free)',
    "address" TEXT NOT NULL DEFAULT 'Office No 613, 6th Floor, Satra Plaza, Vashi, Navi Mumbai-400703',
    "logo" TEXT NOT NULL DEFAULT '/images/mayra-logo.png',
    "footerLogo" TEXT NOT NULL DEFAULT '/images/mayra-logo.png',
    "copyrightText" TEXT NOT NULL DEFAULT 'Mayra International',
    "foundedYear" INTEGER NOT NULL DEFAULT 2020,
    "siteUrl" TEXT NOT NULL DEFAULT 'https://mayra.in',
    "twitterHandle" TEXT NOT NULL DEFAULT '@mayra_in',
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "CompanyInfo_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PageSeo" (
    "id" TEXT NOT NULL,
    "pageSlug" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "keywords" TEXT[],
    "ogImage" TEXT,
    "ogTitle" TEXT,
    "ogDescription" TEXT,
    "canonical" TEXT,
    "noIndex" BOOLEAN NOT NULL DEFAULT false,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "PageSeo_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "WorldCollegeStat" (
    "id" TEXT NOT NULL,
    "countryCode" TEXT NOT NULL,
    "countryName" TEXT NOT NULL,
    "collegeCount" INTEGER NOT NULL DEFAULT 0,
    "centroidLng" DOUBLE PRECISION NOT NULL,
    "centroidLat" DOUBLE PRECISION NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "WorldCollegeStat_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "MediaAsset" (
    "id" TEXT NOT NULL,
    "url" TEXT NOT NULL,
    "alt" TEXT NOT NULL DEFAULT '',
    "type" TEXT NOT NULL DEFAULT 'image',
    "size" INTEGER,
    "width" INTEGER,
    "height" INTEGER,
    "folder" TEXT NOT NULL DEFAULT 'general',
    "uploadedBy" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "MediaAsset_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CtaSection" (
    "id" TEXT NOT NULL,
    "sectionKey" TEXT NOT NULL,
    "badge" TEXT,
    "heading" TEXT NOT NULL,
    "subheading" TEXT,
    "ctaPrimaryText" TEXT,
    "ctaPrimaryLink" TEXT,
    "ctaSecondaryText" TEXT,
    "ctaSecondaryLink" TEXT,
    "footnote" TEXT,
    "bgGradient" TEXT,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "CtaSection_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "HomeSection" (
    "id" TEXT NOT NULL,
    "sectionKey" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "subtitle" TEXT,
    "ctaLabel" TEXT,
    "ctaLink" TEXT,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "HomeSection_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "LegalLink" (
    "id" TEXT NOT NULL,
    "label" TEXT NOT NULL,
    "href" TEXT NOT NULL,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "isActive" BOOLEAN NOT NULL DEFAULT true,

    CONSTRAINT "LegalLink_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "TrustBadge" (
    "id" TEXT NOT NULL,
    "label" TEXT NOT NULL,
    "icon" TEXT,
    "bgColor" TEXT NOT NULL DEFAULT 'bg-green-900/50',
    "borderColor" TEXT NOT NULL DEFAULT 'border-green-700',
    "textColor" TEXT NOT NULL DEFAULT 'text-green-400',
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "isActive" BOOLEAN NOT NULL DEFAULT true,

    CONSTRAINT "TrustBadge_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AppDownloadLink" (
    "id" TEXT NOT NULL,
    "platform" TEXT NOT NULL,
    "icon" TEXT NOT NULL,
    "storeLabel" TEXT NOT NULL,
    "storeName" TEXT NOT NULL,
    "url" TEXT NOT NULL DEFAULT '#',
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "isActive" BOOLEAN NOT NULL DEFAULT true,

    CONSTRAINT "AppDownloadLink_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Stream_name_key" ON "Stream"("name");

-- CreateIndex
CREATE UNIQUE INDEX "Stream_slug_key" ON "Stream"("slug");

-- CreateIndex
CREATE INDEX "Stream_slug_idx" ON "Stream"("slug");

-- CreateIndex
CREATE INDEX "Stream_sortOrder_idx" ON "Stream"("sortOrder");

-- CreateIndex
CREATE UNIQUE INDEX "State_name_key" ON "State"("name");

-- CreateIndex
CREATE UNIQUE INDEX "State_code_key" ON "State"("code");

-- CreateIndex
CREATE INDEX "State_countryCode_idx" ON "State"("countryCode");

-- CreateIndex
CREATE INDEX "City_stateId_idx" ON "City"("stateId");

-- CreateIndex
CREATE UNIQUE INDEX "City_name_stateId_key" ON "City"("name", "stateId");

-- CreateIndex
CREATE UNIQUE INDEX "AccreditationBody_name_key" ON "AccreditationBody"("name");

-- CreateIndex
CREATE UNIQUE INDEX "Tag_name_key" ON "Tag"("name");

-- CreateIndex
CREATE UNIQUE INDEX "Tag_slug_key" ON "Tag"("slug");

-- CreateIndex
CREATE INDEX "Tag_slug_idx" ON "Tag"("slug");

-- CreateIndex
CREATE INDEX "CollegeGallery_collegeId_idx" ON "CollegeGallery"("collegeId");

-- CreateIndex
CREATE INDEX "CollegeRecruiter_collegeId_idx" ON "CollegeRecruiter"("collegeId");

-- CreateIndex
CREATE INDEX "CollegeFeeStructure_collegeId_idx" ON "CollegeFeeStructure"("collegeId");

-- CreateIndex
CREATE UNIQUE INDEX "CollegeAdmissionInfo_collegeId_key" ON "CollegeAdmissionInfo"("collegeId");

-- CreateIndex
CREATE INDEX "NavigationItem_parentId_idx" ON "NavigationItem"("parentId");

-- CreateIndex
CREATE INDEX "NavigationItem_section_idx" ON "NavigationItem"("section");

-- CreateIndex
CREATE INDEX "NavigationItem_sortOrder_idx" ON "NavigationItem"("sortOrder");

-- CreateIndex
CREATE INDEX "FooterSection_sortOrder_idx" ON "FooterSection"("sortOrder");

-- CreateIndex
CREATE INDEX "FooterLink_sectionId_idx" ON "FooterLink"("sectionId");

-- CreateIndex
CREATE INDEX "FooterLink_sortOrder_idx" ON "FooterLink"("sortOrder");

-- CreateIndex
CREATE INDEX "HeroStat_bannerId_idx" ON "HeroStat"("bannerId");

-- CreateIndex
CREATE INDEX "HeroSearchTab_bannerId_idx" ON "HeroSearchTab"("bannerId");

-- CreateIndex
CREATE INDEX "HeroQuickFilter_bannerId_idx" ON "HeroQuickFilter"("bannerId");

-- CreateIndex
CREATE INDEX "HeroQuickFilter_tab_idx" ON "HeroQuickFilter"("tab");

-- CreateIndex
CREATE INDEX "HeroPopularSearch_bannerId_idx" ON "HeroPopularSearch"("bannerId");

-- CreateIndex
CREATE INDEX "HeroFloatingCard_bannerId_idx" ON "HeroFloatingCard"("bannerId");

-- CreateIndex
CREATE INDEX "HomeStat_sortOrder_idx" ON "HomeStat"("sortOrder");

-- CreateIndex
CREATE INDEX "Announcement_isActive_idx" ON "Announcement"("isActive");

-- CreateIndex
CREATE UNIQUE INDEX "SocialLink_platform_key" ON "SocialLink"("platform");

-- CreateIndex
CREATE INDEX "SocialLink_sortOrder_idx" ON "SocialLink"("sortOrder");

-- CreateIndex
CREATE UNIQUE INDEX "PageSeo_pageSlug_key" ON "PageSeo"("pageSlug");

-- CreateIndex
CREATE INDEX "PageSeo_pageSlug_idx" ON "PageSeo"("pageSlug");

-- CreateIndex
CREATE UNIQUE INDEX "WorldCollegeStat_countryCode_key" ON "WorldCollegeStat"("countryCode");

-- CreateIndex
CREATE INDEX "WorldCollegeStat_countryCode_idx" ON "WorldCollegeStat"("countryCode");

-- CreateIndex
CREATE INDEX "MediaAsset_folder_idx" ON "MediaAsset"("folder");

-- CreateIndex
CREATE INDEX "MediaAsset_type_idx" ON "MediaAsset"("type");

-- CreateIndex
CREATE UNIQUE INDEX "CtaSection_sectionKey_key" ON "CtaSection"("sectionKey");

-- CreateIndex
CREATE UNIQUE INDEX "HomeSection_sectionKey_key" ON "HomeSection"("sectionKey");

-- CreateIndex
CREATE INDEX "HomeSection_sortOrder_idx" ON "HomeSection"("sortOrder");

-- CreateIndex
CREATE INDEX "LegalLink_sortOrder_idx" ON "LegalLink"("sortOrder");

-- CreateIndex
CREATE INDEX "TrustBadge_sortOrder_idx" ON "TrustBadge"("sortOrder");

-- CreateIndex
CREATE UNIQUE INDEX "AppDownloadLink_platform_key" ON "AppDownloadLink"("platform");

-- CreateIndex
CREATE INDEX "AppDownloadLink_sortOrder_idx" ON "AppDownloadLink"("sortOrder");

-- CreateIndex
CREATE INDEX "College_state_idx" ON "College"("state");

-- CreateIndex
CREATE INDEX "College_type_idx" ON "College"("type");

-- CreateIndex
CREATE INDEX "College_countryCode_idx" ON "College"("countryCode");

-- CreateIndex
CREATE INDEX "Course_level_idx" ON "Course"("level");

-- CreateIndex
CREATE INDEX "Exam_level_idx" ON "Exam"("level");

-- CreateIndex
CREATE INDEX "StudyAbroadCountry_isActive_idx" ON "StudyAbroadCountry"("isActive");

-- AddForeignKey
ALTER TABLE "City" ADD CONSTRAINT "City_stateId_fkey" FOREIGN KEY ("stateId") REFERENCES "State"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CollegeGallery" ADD CONSTRAINT "CollegeGallery_collegeId_fkey" FOREIGN KEY ("collegeId") REFERENCES "College"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CollegeRecruiter" ADD CONSTRAINT "CollegeRecruiter_collegeId_fkey" FOREIGN KEY ("collegeId") REFERENCES "College"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CollegeFeeStructure" ADD CONSTRAINT "CollegeFeeStructure_collegeId_fkey" FOREIGN KEY ("collegeId") REFERENCES "College"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CollegeAdmissionInfo" ADD CONSTRAINT "CollegeAdmissionInfo_collegeId_fkey" FOREIGN KEY ("collegeId") REFERENCES "College"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "NavigationItem" ADD CONSTRAINT "NavigationItem_parentId_fkey" FOREIGN KEY ("parentId") REFERENCES "NavigationItem"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "FooterLink" ADD CONSTRAINT "FooterLink_sectionId_fkey" FOREIGN KEY ("sectionId") REFERENCES "FooterSection"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "HeroStat" ADD CONSTRAINT "HeroStat_bannerId_fkey" FOREIGN KEY ("bannerId") REFERENCES "HeroBanner"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "HeroSearchTab" ADD CONSTRAINT "HeroSearchTab_bannerId_fkey" FOREIGN KEY ("bannerId") REFERENCES "HeroBanner"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "HeroQuickFilter" ADD CONSTRAINT "HeroQuickFilter_bannerId_fkey" FOREIGN KEY ("bannerId") REFERENCES "HeroBanner"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "HeroPopularSearch" ADD CONSTRAINT "HeroPopularSearch_bannerId_fkey" FOREIGN KEY ("bannerId") REFERENCES "HeroBanner"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "HeroFloatingCard" ADD CONSTRAINT "HeroFloatingCard_bannerId_fkey" FOREIGN KEY ("bannerId") REFERENCES "HeroBanner"("id") ON DELETE CASCADE ON UPDATE CASCADE;
