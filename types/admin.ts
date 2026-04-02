import { z } from "zod";

// ============================================================
// ENUMS
// ============================================================

export const ADMIN_ROLES = ["SUPER_ADMIN", "ADMIN", "EDITOR", "VIEWER"] as const;
export type AdminRole = (typeof ADMIN_ROLES)[number];

export const ENQUIRY_STATUSES = ["PENDING", "UNDER_REVIEW", "RESPONDED", "CLOSED", "SPAM"] as const;
export type EnquiryStatus = (typeof ENQUIRY_STATUSES)[number];

export const PRIORITIES = ["LOW", "NORMAL", "HIGH", "URGENT"] as const;
export type Priority = (typeof PRIORITIES)[number];

/** @deprecated Use master data from /api/master-data instead */
export const STREAMS = [
  "Engineering",
  "Medical",
  "Management",
  "Law",
  "Science",
  "Arts",
  "Commerce",
  "Design",
  "Pharmacy",
  "Agriculture",
  "Hospitality",
  "Education",
  "Architecture",
  "Computer Applications",
] as const;

/** @deprecated Use master data from /api/master-data instead */
export const COLLEGE_TYPES = ["Government", "Private", "Deemed", "Autonomous"] as const;
/** @deprecated Use master data from /api/master-data instead */
export const COURSE_LEVELS = ["UG", "PG", "Diploma", "Certificate", "PhD"] as const;
/** @deprecated Use master data from /api/master-data instead */
export const EXAM_MODES = ["Online", "Offline", "Both"] as const;
/** @deprecated Use master data from /api/master-data instead */
export const NEWS_CATEGORIES = [
  "Exams",
  "Rankings",
  "Admissions",
  "Policy Updates",
  "News",
  "Scholarships",
  "Study Abroad",
  "Career",
] as const;

/** @deprecated Use master data from /api/master-data instead */
export const INDIAN_STATES = [
  "Andhra Pradesh", "Arunachal Pradesh", "Assam", "Bihar", "Chhattisgarh",
  "Goa", "Gujarat", "Haryana", "Himachal Pradesh", "Jharkhand", "Karnataka",
  "Kerala", "Madhya Pradesh", "Maharashtra", "Manipur", "Meghalaya", "Mizoram",
  "Nagaland", "Odisha", "Punjab", "Rajasthan", "Sikkim", "Tamil Nadu",
  "Telangana", "Tripura", "Uttar Pradesh", "Uttarakhand", "West Bengal",
  "Delhi", "Chandigarh", "Puducherry", "Jammu and Kashmir", "Ladakh",
] as const;

// ============================================================
// ZOD SCHEMAS
// ============================================================

export const adminLoginSchema = z.object({
  email: z.string().email("Invalid email address"),
  password: z.string().min(1, "Password is required"),
});

export const adminRegisterSchema = z
  .object({
    name: z.string().min(2, "Min 2 characters").max(100),
    email: z.string().email("Invalid email"),
    password: z
      .string()
      .min(8, "Min 8 characters")
      .regex(/[A-Z]/, "Must contain uppercase letter")
      .regex(/[a-z]/, "Must contain lowercase letter")
      .regex(/[0-9]/, "Must contain a number")
      .regex(/[^A-Za-z0-9]/, "Must contain a special character"),
    confirmPassword: z.string(),
    phone: z.string().optional(),
    role: z.enum(["ADMIN", "EDITOR", "VIEWER"]),
  })
  .refine((d) => d.password === d.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  });

export const collegeFormSchema = z
  .object({
    name: z.string().min(2).max(200),
    type: z.string().min(1, "Type is required"),
    established: z.coerce.number().min(1800).max(new Date().getFullYear()),
    city: z.string().min(1).max(100),
    state: z.string().min(1),
    address: z.string().min(1).max(500),
    countryCode: z.string().default("IN"),
    streams: z.array(z.string()).min(1, "Select at least one stream"),
    nirfRank: z.coerce.number().min(1).max(1000).nullable().optional(),
    rating: z.coerce.number().min(0).max(5).default(4.0),
    reviewCount: z.coerce.number().min(0).default(50),
    feesMin: z.coerce.number().min(0),
    feesMax: z.coerce.number().min(0),
    avgPackage: z.coerce.number().min(0).nullable().optional(),
    topPackage: z.coerce.number().min(0).nullable().optional(),
    placementRate: z.coerce.number().min(0).max(100).nullable().optional(),
    accreditation: z.array(z.string()).optional().default([]),
    courses: z.array(z.string()).optional().default([]),
    description: z.string().max(5000).optional().default(""),
    highlights: z.array(z.string()).optional().default([]),
    website: z.string().url().or(z.literal("")).optional(),
    phone: z.string().optional(),
    totalStudents: z.coerce.number().nullable().optional(),
    faculty: z.coerce.number().nullable().optional(),
    latitude: z.coerce.number().min(-90).max(90).nullable().optional(),
    longitude: z.coerce.number().min(-180).max(180).nullable().optional(),
    isFeatured: z.boolean().default(false),
    isActive: z.boolean().default(true),
    logo: z.string().optional().default(""),
  })
  .refine((d) => d.feesMax >= d.feesMin, {
    message: "Max fees must be >= min fees",
    path: ["feesMax"],
  });

export const courseFormSchema = z.object({
  name: z.string().min(2).max(200),
  stream: z.string().min(1),
  level: z.string().min(1, "Level is required"),
  duration: z.string().min(1),
  description: z.string().max(5000).optional().default(""),
  topColleges: z.coerce.number().min(0).default(10),
  avgFees: z.coerce.number().min(0),
  avgSalary: z.coerce.number().min(0).nullable().optional(),
  icon: z.string().optional(),
  color: z.string().optional(),
  isFeatured: z.boolean().default(false),
  isActive: z.boolean().default(true),
});

export const examFormSchema = z.object({
  name: z.string().min(2).max(100),
  fullName: z.string().min(5).max(300),
  conductingBody: z.string().min(1).max(200),
  level: z.string().min(1, "Level is required"),
  streams: z.array(z.string()).min(1),
  mode: z.string().min(1, "Mode is required"),
  frequency: z.string().default("Annual"),
  registrationStart: z.string().nullable().optional(),
  registrationEnd: z.string().nullable().optional(),
  examDate: z.string().nullable().optional(),
  resultDate: z.string().nullable().optional(),
  applicationFeeGeneral: z.coerce.number().min(0),
  applicationFeeSCST: z.coerce.number().min(0).nullable().optional(),
  totalSeats: z.coerce.number().nullable().optional(),
  participatingColleges: z.coerce.number().nullable().optional(),
  eligibility: z.string().max(3000).optional().default(""),
  description: z.string().max(5000).optional().default(""),
  syllabus: z
    .array(
      z.object({
        section: z.string().min(1),
        topics: z.array(z.string().min(1)).min(1),
      })
    )
    .optional()
    .default([]),
  isFeatured: z.boolean().default(false),
  isActive: z.boolean().default(true),
});

export const newsFormSchema = z.object({
  title: z.string().min(5).max(300),
  category: z.string().min(1, "Category is required"),
  summary: z.string().min(1).max(500),
  content: z.string().min(10).max(50000),
  author: z.string().max(100).default("Editorial Team"),
  publishedAt: z.string(),
  imageColor: z.string().default("#3B82F6"),
  tags: z.array(z.string()).max(10).optional().default([]),
  isLive: z.boolean().default(false),
  isActive: z.boolean().default(true),
});

export const studyAbroadFormSchema = z.object({
  name: z.string().min(2).max(100),
  flag: z.string().min(1),
  universities: z.coerce.number().min(0),
  avgCost: z.string().min(1),
  popularCourses: z.array(z.string()).optional().default([]),
  description: z.string().max(5000).default(""),
  topUniversities: z
    .array(z.object({ name: z.string(), rank: z.coerce.number().optional() }))
    .optional()
    .default([]),
  whyStudyHere: z.string().optional().default(""),
  visaInfo: z.string().optional().default(""),
  scholarships: z.string().optional().default(""),
  livingCost: z.string().optional().default(""),
  isFeatured: z.boolean().default(false),
  isActive: z.boolean().default(true),
  sortOrder: z.coerce.number().default(0),
});

export const enquiryResponseSchema = z.object({
  response: z.string().min(10).max(5000),
  status: z.enum(ENQUIRY_STATUSES),
  priority: z.enum(PRIORITIES).optional(),
  notes: z.string().max(2000).optional(),
});

// ============================================================
// TYPES
// ============================================================

export type AdminLoginInput = z.infer<typeof adminLoginSchema>;
export type AdminRegisterInput = z.infer<typeof adminRegisterSchema>;
export type CollegeFormInput = z.infer<typeof collegeFormSchema>;
export type CourseFormInput = z.infer<typeof courseFormSchema>;
export type ExamFormInput = z.infer<typeof examFormSchema>;
export type NewsFormInput = z.infer<typeof newsFormSchema>;
export type StudyAbroadFormInput = z.infer<typeof studyAbroadFormSchema>;
export type EnquiryResponseInput = z.infer<typeof enquiryResponseSchema>;

export interface AdminJWTPayload {
  id: string;
  email: string;
  name: string;
  role: AdminRole;
  isActive: boolean;
}

export interface ApiResponse<T = unknown> {
  success: boolean;
  data?: T;
  error?: {
    code: string;
    message: string;
    details?: { field: string; message: string }[];
  };
}

export interface PaginatedResponse<T> extends ApiResponse<T[]> {
  total: number;
  page: number;
  limit: number;
  pages: number;
}
