export function isStaff(role?: string | null): boolean {
  return role === 'admin' || role === 'moderator';
}

export function isAdmin(role?: string | null): boolean {
  return role === 'admin';
}
