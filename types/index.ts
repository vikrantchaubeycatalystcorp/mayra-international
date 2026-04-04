export interface College {
  id: string;
  name: string;
  slug: string;
  logo: string;
  city: string;
  state: string;
  streams: string[];
  nirfRank?: number;
  rating: number;
  reviewCount: number;
  established: number;
  type: "Government" | "Private" | "Deemed" | "Autonomous";
  fees: { min: number; max: number };
  avgPackage?: number;
  topPackage?: number;
  placementRate?: number;
  accreditation: string[];
  courses: string[];
  description: string;
  highlights: string[];
  address: string;
  website?: string;
  phone?: string;
  totalStudents?: number;
  faculty?: number;
  isFeatured?: boolean;
  isActive?: boolean;
  latitude?: number;
  longitude?: number;
  countryCode?: string;
  countryName?: string;
}

export interface Exam {
  id: string;
  name: string;
  slug: string;
  fullName: string;
  conductingBody: string;
  stream: string[];
  level: "UG" | "PG" | "PhD" | "Diploma";
  registrationStart?: string;
  registrationEnd?: string;
  examDate?: string;
  resultDate?: string;
  eligibility: string;
  applicationFee: { general: number; sc_st?: number };
  mode: "Online" | "Offline" | "Both";
  frequency: string;
  totalSeats?: number;
  participatingColleges?: number;
  description: string;
  syllabus: { section: string; topics: string[] }[];
  isFeatured?: boolean;
  isActive?: boolean;
}

export interface Course {
  id: string;
  name: string;
  slug: string;
  stream: string;
  level: "UG" | "PG" | "Diploma" | "Certificate" | "PhD";
  duration: string;
  description: string;
  topColleges: number;
  avgFees: number;
  avgSalary?: number;
  isFeatured?: boolean;
  isActive?: boolean;
  icon?: string;
  color?: string;
}

export interface NewsArticle {
  id: string;
  title: string;
  slug: string;
  category: string;
  summary: string;
  content: string;
  publishedAt: string;
  imageUrl?: string;
  imageColor: string;
  author: string;
  isLive?: boolean;
  isActive?: boolean;
  tags: string[];
  views?: number;
}

export interface StudyAbroadCountry {
  id: string;
  name: string;
  flag: string;
  universities: number;
  avgCost: string;
  popularCourses: string[];
  description: string;
  topUniversities: string[];
  isActive?: boolean;
}

export interface FilterState {
  search: string;
  states: string[];
  streams: string[];
  types: string[];
  feesMin: number;
  feesMax: number;
  nirfMin: number;
  nirfMax: number;
  ratingMin: number;
}
