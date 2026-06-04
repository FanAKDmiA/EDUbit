export function isValidEmail(email: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

export function isValidPassword(password: string) {
  return (
    password.length >= 8 &&
    /[a-z]/.test(password) &&
    /[A-Z]/.test(password) &&
    /\d/.test(password) &&
    /[^A-Za-z0-9]/.test(password)
  );
}

export function normalizeEmail(email: string) {
  return email.trim().toLowerCase();
}

export function formValue(formData: FormData, key: string) {
  return String(formData.get(key) || "").trim();
}
