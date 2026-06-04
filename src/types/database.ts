import type { Role } from "./roles";

export type Profile = {
  id: string;
  email: string;
  full_name: string;
  role: Role;
  created_at: string;
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
