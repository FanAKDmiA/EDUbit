export const roles = ["admin", "teacher", "student"] as const;
export const profileStatuses = ["active", "invited", "pending", "blocked", "disabled"] as const;

export type Role = (typeof roles)[number];
export type ProfileStatus = (typeof profileStatuses)[number];

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

export const profileStatusLabel: Record<ProfileStatus, string> = {
  active: "Activo",
  invited: "Invitado",
  pending: "Pendiente",
  blocked: "Bloqueado",
  disabled: "Deshabilitado"
};
