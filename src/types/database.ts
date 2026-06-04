import type { ProfileStatus, Role } from "./roles";

export type Profile = {
  id: string;
  email: string;
  full_name: string;
  role: Role;
  status: ProfileStatus;
  created_at: string;
  updated_at: string | null;
  last_login_at: string | null;
  created_by: string | null;
  updated_by: string | null;
};

export type Course = {
  id: string;
  name: string;
  description: string | null;
  teacher_id: string | null;
  created_at: string;
};

export type CourseMembership = {
  id: string;
  course_id: string;
  student_id: string;
  created_at: string;
};

export type CourseWithTeacher = Course & {
  teacher: Pick<Profile, "id" | "full_name" | "email"> | null;
};

export type EnrollmentWithStudent = CourseMembership & {
  student: Pick<Profile, "id" | "full_name" | "email"> | null;
};

export type AccessRequestStatus = "pending" | "approved" | "rejected" | "cancelled";

export type AccessRequest = {
  id: string;
  full_name: string;
  email: string;
  requested_role: Extract<Role, "teacher" | "student">;
  institution: string | null;
  course_reference: string | null;
  message: string | null;
  status: AccessRequestStatus;
  reviewed_by: string | null;
  reviewed_at: string | null;
  review_notes: string | null;
  created_user_id: string | null;
  created_at: string;
  updated_at: string;
};

export type AuditLog = {
  id: string;
  actor_user_id: string | null;
  target_user_id: string | null;
  action: string;
  entity_type: string | null;
  entity_id: string | null;
  metadata: Record<string, unknown> | null;
  created_at: string;
};
