import { Timestamp } from 'firebase/firestore';

// Base types
export interface BaseDocument {
  id: string;
  createdAt: Timestamp;
  updatedAt: Timestamp;
}

// Student types
export interface Student extends BaseDocument {
  firstName: string;
  lastName: string;
  phone: string; // E.164 format
  university: string;
  department: string;
  classYear: number;
  displayHandle: string;
  consentKVKK: boolean;
}

// Clan types
export interface Clan extends BaseDocument {
  code: string; // unique
  name: string;
  description?: string;
  stats: {
    memberCount: number;
    projectCount: number;
  };
}

export interface ClanMember extends BaseDocument {
  studentId: string; // reference to Student
  clanId: string; // reference to Clan
  role: 'leader' | 'member';
}

// Project types
export interface Project extends BaseDocument {
  name: string;
  summary: string;
  category: ProjectCategory;
  techTags: string[];
  status: ProjectStatus;
  ownerStudentId: string; // reference to Student
  clanId?: string; // reference to Clan, nullable
}

export type ProjectCategory = 'software' | 'robotics' | 'design' | 'ai' | 'mobile' | 'web' | 'other';
export type ProjectStatus = 'idea' | 'active' | 'completed' | 'paused';

// Forum types
export interface Category extends BaseDocument {
  name: string;
  slug: string;
  order: number;
  isLocked: boolean;
}

export interface Tag extends BaseDocument {
  name: string;
  slug: string;
  usageCount: number;
}

export interface Thread extends BaseDocument {
  categoryId: string; // reference to Category
  title: string;
  body: string;
  tagIds: string[]; // references to Tags
  authorType: 'student' | 'system' | 'anon';
  authorStudentId?: string; // reference to Student, nullable
  status: 'pending' | 'published' | 'closed' | 'deleted';
  stats: {
    replyCount: number;
    viewCount: number;
    reportCount: number;
  };
  lastActivityAt: Timestamp;
}

export interface Post extends BaseDocument {
  threadId: string; // reference to Thread
  body: string;
  authorType: 'student' | 'system' | 'anon';
  authorStudentId?: string; // reference to Student, nullable
  status: 'pending' | 'published' | 'deleted';
}

export interface Report extends BaseDocument {
  targetType: 'thread' | 'post';
  targetId: string; // reference to Thread or Post
  reason: ReportReason;
  notes?: string;
  status: 'open' | 'review' | 'closed';
}

export type ReportReason = 'spam' | 'inappropriate' | 'harassment' | 'off_topic' | 'other';

// Admin types
export interface AdminAudit extends BaseDocument {
  actorUid: string;
  action: string;
  target: Record<string, any>;
  meta: Record<string, any>;
}

export interface Settings extends BaseDocument {
  bannedWords: string[];
  postEditWindowSec: number;
  rateLimits: Record<string, number>;
  formRequirements: Record<string, boolean>;
}

// Public submission types
export interface PublicSubmission extends BaseDocument {
  payload: Record<string, any>;
  ipHash: string;
  ua: string;
  recaptchaScore: number;
  type: 'form' | 'topicSuggestion' | 'replySuggestion';
  status: 'pending' | 'ingested' | 'rejected';
}

// Form types
export interface FormData {
  // Personal Information
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  university: string;
  department: string;
  classYear: number;
  
  // Clan Information
  clanName: string;
  clanRole: 'leader' | 'member';
  
  // Project Information
  projectName: string;
  projectSummary: string;
  projectCategory: ProjectCategory;
  projectTechTags: string[];
  projectStatus: ProjectStatus;
  
  // Consent
  consentKVKK: boolean;
}

// API Response types
export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

// Analytics types
export interface AnalyticsData {
  dailyFormSubmissions: number;
  totalStudents: number;
  totalClans: number;
  totalProjects: number;
  pendingSubmissions: number;
  pendingThreads: number;
  pendingPosts: number;
  universityDistribution: Record<string, number>;
  departmentDistribution: Record<string, number>;
  categoryDistribution: Record<string, number>;
  tagUsage: Record<string, number>;
}
