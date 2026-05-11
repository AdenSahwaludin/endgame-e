export function usePermission() {
  const { user } = useUserSession();

  const rolePermissions: Record<string, string[]> = {
    Admin: ["*"],
    "Kepala Sekolah": [
      "view_kategoris",
      "view_ruangs",
      "view_master_barangs",
      "view_unit_barangs",
      "view_transaksi_barangs",
      "view_transaksi_keluars",
      "view_barang_rusaks",
      "view_mutasi_lokasis",
      "view_log_aktivitas",
      "view_users",
      "approve_transaksi_barangs",
      "approve_transaksi_keluars",
      "generate_laporan",
      "export_data",
    ],
    "Petugas Inventaris": [
      "view_kategoris",
      "view_ruangs",
      "view_master_barangs",
      "view_unit_barangs",
      "view_transaksi_barangs",
      "view_transaksi_keluars",
      "view_barang_rusaks",
      "view_mutasi_lokasis",
      "view_log_aktivitas",
      "create_kategoris",
      "edit_kategoris",
      "delete_kategoris",
      "create_ruangs",
      "edit_ruangs",
      "delete_ruangs",
      "create_master_barangs",
      "edit_master_barangs",
      "create_unit_barangs",
      "edit_unit_barangs",
      "create_transaksi_barangs",
      "edit_transaksi_barangs",
      "create_transaksi_keluars",
      "edit_transaksi_keluars",
      "create_mutasi_lokasis",
      "edit_mutasi_lokasis",
      "delete_mutasi_lokasis",
      "create_barang_rusaks",
      "generate_laporan",
    ],
  };

  function hasPermission(permissionName: string): boolean {
    if (!user.value) return false;
    const u = user.value as any;
    const perms = rolePermissions[u.role] || [];
    if (perms.includes("*")) return true;
    return perms.includes(permissionName);
  }

  function hasRole(roleName: string): boolean {
    return (user.value as any)?.role === roleName;
  }

  function canApprove(): boolean {
    return (
      hasPermission("approve_transaksi_barangs") ||
      hasPermission("approve_transaksi_keluars")
    );
  }

  function isAdmin(): boolean {
    return hasRole("Admin");
  }

  function isKepsek(): boolean {
    return hasRole("Kepala Sekolah");
  }

  return { hasPermission, hasRole, canApprove, isAdmin, isKepsek };
}
