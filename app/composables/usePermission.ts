export function usePermission() {
  const { user } = useUserSession()

  function hasPermission(permissionName: string): boolean {
    if (!user.value) return false
    const u = user.value as any
    if (u.role === 'Admin') return true
    return u.permissions?.includes(permissionName) ?? false
  }

  function hasRole(roleName: string): boolean {
    return (user.value as any)?.role === roleName
  }

  function canApprove(): boolean {
    return hasPermission('approve_transaksi_barangs') || hasPermission('approve_transaksi_keluars')
  }

  function isAdmin(): boolean {
    return hasRole('Admin')
  }

  return { hasPermission, hasRole, canApprove, isAdmin }
}
