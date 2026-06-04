export const roles = ["admin", "teacher", "student"] as const;

export type Role = (typeof roles)[number];

export const roleHome: Record<Role, string> = {
  admin: "/admin",
  teacher: "/teacher",
  student: "/student"
};

export const roleLabel: Record<Role, string> = {
  admin: "Administrador",
  teacher: "Docente",
  student: "Alumno"
};
