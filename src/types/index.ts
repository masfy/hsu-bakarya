import { ComponentType } from "react";

export type UserRole = "public" | "contributor" | "admin" | "superAdmin";

export type AccountStatus = "active" | "pending" | "suspended";

export type WorkStatus =
  | "draft"
  | "pending_review"
  | "published"
  | "revision_requested"
  | "archived";

export interface EducationLevel {
  id: string;
  name: string;
  slug: string;
  sortOrder: number;
  isActive: boolean;
}

export interface ClassData {
  id: string;
  name: string;
  educationLevelId: string;
}

export interface Subject {
  id: string;
  name: string;
}

export interface Category {
  id: string;
  name: string;
  slug: string;
}

export interface MediaType {
  id: string;
  name: string;
  slug: string;
  description: string;
  icon?: ComponentType<{ className?: string }>;
}

export interface UserAccount {
  uid: string;
  username: string;
  tempPassword?: string;
  displayName: string;
  email: string;
  institution: string;
  district: string;
  bio: string;
  role: UserRole;
  accountStatus: AccountStatus;
  publicProfileEnabled: boolean;
  isDeleted: boolean;
  deletedAt: string | null;
  deletedBy: string | null;
  lastLoginAt: string;
  avatar: string;
}

export interface Work {
  id: string;
  title: string;
  slug: string;
  shortDescription: string;
  description: string;
  thumbnailURL: string;
  mediaURL: string;
  mediaTypeId: string;
  categoryIds: string[];
  educationLevelIds: string[];
  classIds: string[];
  subjectIds: string[];
  contributorId: string;
  contributorNameSnapshot: string;
  contributorInstitution: string;
  status: WorkStatus;
  moderationNote?: string;
  viewCount: number;
  outboundClickCount: number;
  createdAt: string;
  updatedAt: string;
  submittedAt: string | null;
  publishedAt: string | null;
  isDeleted: boolean;
}

export interface ModerationLog {
  id: string;
  workId: string;
  workTitle: string;
  actorName: string;
  action: "approved" | "published" | "revision_requested" | "rejected" | "archived";
  previousStatus: WorkStatus;
  newStatus: WorkStatus;
  note: string;
  createdAt: string;
}

export interface AuditLog {
  id: string;
  actorName: string;
  action: string;
  targetType: string;
  summary: string;
  createdAt: string;
}

export interface DailyAnalytics {
  dateKey: string;
  visits: number;
  pageViews: number;
  uniqueVisitorsEstimate: number;
  outboundClicks: number;
}

export interface MonthlyAnalytics {
  monthKey: string;
  visits: number;
  pageViews: number;
  outboundClicks: number;
}

export interface ToastInfo {
  message: string;
  type: "info" | "success" | "error" | "warning";
}
