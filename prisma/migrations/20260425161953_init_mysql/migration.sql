-- CreateTable
CREATE TABLE `users` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `name` VARCHAR(191) NOT NULL,
    `email` VARCHAR(191) NOT NULL,
    `password` VARCHAR(191) NOT NULL,
    `is_active` BOOLEAN NOT NULL DEFAULT true,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL,
    `deleted_at` DATETIME(3) NULL,
    `role_id` INTEGER NOT NULL,

    UNIQUE INDEX `users_email_key`(`email`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `roles` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `name` VARCHAR(191) NOT NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL,

    UNIQUE INDEX `roles_name_key`(`name`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `permissions` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `name` VARCHAR(191) NOT NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    UNIQUE INDEX `permissions_name_key`(`name`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `role_permissions` (
    `role_id` INTEGER NOT NULL,
    `permission_id` INTEGER NOT NULL,

    PRIMARY KEY (`role_id`, `permission_id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `kategori` (
    `kode_kategori` VARCHAR(191) NOT NULL,
    `nama_kategori` VARCHAR(191) NOT NULL,
    `deskripsi` VARCHAR(191) NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL,
    `deleted_at` DATETIME(3) NULL,

    PRIMARY KEY (`kode_kategori`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `ruang` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `nama_ruang` VARCHAR(191) NOT NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL,
    `deleted_at` DATETIME(3) NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `master_barang` (
    `kode_master` VARCHAR(191) NOT NULL,
    `nama_barang` VARCHAR(191) NOT NULL,
    `kategori_id` VARCHAR(191) NOT NULL,
    `satuan` VARCHAR(191) NOT NULL DEFAULT 'pcs',
    `merk` VARCHAR(191) NULL,
    `harga_satuan` DECIMAL(15, 2) NULL,
    `reorder_point` INTEGER NOT NULL DEFAULT 0,
    `total_pesanan` INTEGER NOT NULL DEFAULT 0,
    `deskripsi` VARCHAR(191) NULL,
    `distribusi_lokasi` JSON NULL,
    `created_by` INTEGER NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL,
    `deleted_at` DATETIME(3) NULL,

    PRIMARY KEY (`kode_master`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `unit_barang` (
    `kode_unit` VARCHAR(191) NOT NULL,
    `master_barang_id` VARCHAR(191) NOT NULL,
    `ruang_id` INTEGER NOT NULL,
    `status` VARCHAR(191) NOT NULL DEFAULT 'baik',
    `is_active` BOOLEAN NOT NULL DEFAULT true,
    `tanggal_pembelian` DATE NULL,
    `catatan` VARCHAR(191) NULL,
    `created_by` INTEGER NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL,

    PRIMARY KEY (`kode_unit`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `transaksi_barang` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `kode_transaksi` VARCHAR(191) NOT NULL,
    `master_barang_id` VARCHAR(191) NOT NULL,
    `distribusi_lokasi` JSON NULL,
    `tanggal_transaksi` DATE NOT NULL,
    `total_pesanan` INTEGER NOT NULL DEFAULT 0,
    `penanggung_jawab` VARCHAR(191) NULL,
    `keterangan` VARCHAR(191) NULL,
    `user_id` INTEGER NOT NULL,
    `approved_by` INTEGER NULL,
    `approved_at` DATETIME(3) NULL,
    `approval_status` VARCHAR(191) NOT NULL DEFAULT 'pending',
    `approval_notes` VARCHAR(191) NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL,
    `ruang_tujuan_id` INTEGER NULL,

    UNIQUE INDEX `transaksi_barang_kode_transaksi_key`(`kode_transaksi`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `transaksi_keluar` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `kode_transaksi` VARCHAR(191) NOT NULL,
    `unit_barang_id` VARCHAR(191) NOT NULL,
    `ruang_asal_id` INTEGER NULL,
    `ruang_tujuan_id` INTEGER NULL,
    `tipe` VARCHAR(191) NOT NULL,
    `tanggal_transaksi` DATE NOT NULL,
    `penerima` VARCHAR(191) NULL,
    `tujuan` VARCHAR(191) NULL,
    `keterangan` VARCHAR(191) NULL,
    `catatan` VARCHAR(191) NULL,
    `user_id` INTEGER NOT NULL,
    `approved_by` INTEGER NULL,
    `approved_at` DATETIME(3) NULL,
    `approval_status` VARCHAR(191) NOT NULL DEFAULT 'pending',
    `approval_notes` VARCHAR(191) NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL,

    UNIQUE INDEX `transaksi_keluar_kode_transaksi_key`(`kode_transaksi`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `barang_rusak` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `unit_barang_id` VARCHAR(191) NOT NULL,
    `ruang_id` INTEGER NULL,
    `tanggal_kejadian` DATE NULL,
    `tanggal_rusak` DATE NULL,
    `keterangan` VARCHAR(191) NULL,
    `penanggung_jawab` VARCHAR(191) NULL,
    `user_id` INTEGER NOT NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `mutasi_lokasi` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `unit_barang_id` VARCHAR(191) NOT NULL,
    `ruang_asal_id` INTEGER NULL,
    `ruang_tujuan_id` INTEGER NOT NULL,
    `tanggal_mutasi` DATE NOT NULL,
    `tipe_mutasi` VARCHAR(191) NOT NULL DEFAULT 'manual',
    `keterangan` VARCHAR(191) NULL,
    `user_id` INTEGER NOT NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `log_aktivitas` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `user_id` INTEGER NOT NULL,
    `jenis_aktivitas` VARCHAR(191) NOT NULL,
    `nama_tabel` VARCHAR(191) NULL,
    `record_id` VARCHAR(191) NULL,
    `deskripsi` VARCHAR(191) NOT NULL,
    `perubahan_data` JSON NULL,
    `ip_address` VARCHAR(191) NULL,
    `user_agent` VARCHAR(191) NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `backup_logs` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `user_id` INTEGER NOT NULL,
    `filename` VARCHAR(191) NULL,
    `format` VARCHAR(191) NOT NULL DEFAULT 'sql',
    `file_size` BIGINT NULL,
    `status` VARCHAR(191) NOT NULL DEFAULT 'pending',
    `notes` VARCHAR(191) NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL,
    `deleted_at` DATETIME(3) NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `users` ADD CONSTRAINT `users_role_id_fkey` FOREIGN KEY (`role_id`) REFERENCES `roles`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `role_permissions` ADD CONSTRAINT `role_permissions_role_id_fkey` FOREIGN KEY (`role_id`) REFERENCES `roles`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `role_permissions` ADD CONSTRAINT `role_permissions_permission_id_fkey` FOREIGN KEY (`permission_id`) REFERENCES `permissions`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `master_barang` ADD CONSTRAINT `master_barang_kategori_id_fkey` FOREIGN KEY (`kategori_id`) REFERENCES `kategori`(`kode_kategori`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `unit_barang` ADD CONSTRAINT `unit_barang_master_barang_id_fkey` FOREIGN KEY (`master_barang_id`) REFERENCES `master_barang`(`kode_master`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `unit_barang` ADD CONSTRAINT `unit_barang_ruang_id_fkey` FOREIGN KEY (`ruang_id`) REFERENCES `ruang`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `transaksi_barang` ADD CONSTRAINT `transaksi_barang_master_barang_id_fkey` FOREIGN KEY (`master_barang_id`) REFERENCES `master_barang`(`kode_master`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `transaksi_barang` ADD CONSTRAINT `transaksi_barang_user_id_fkey` FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `transaksi_barang` ADD CONSTRAINT `transaksi_barang_approved_by_fkey` FOREIGN KEY (`approved_by`) REFERENCES `users`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `transaksi_barang` ADD CONSTRAINT `transaksi_barang_ruang_tujuan_id_fkey` FOREIGN KEY (`ruang_tujuan_id`) REFERENCES `ruang`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `transaksi_keluar` ADD CONSTRAINT `transaksi_keluar_unit_barang_id_fkey` FOREIGN KEY (`unit_barang_id`) REFERENCES `unit_barang`(`kode_unit`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `transaksi_keluar` ADD CONSTRAINT `transaksi_keluar_ruang_asal_id_fkey` FOREIGN KEY (`ruang_asal_id`) REFERENCES `ruang`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `transaksi_keluar` ADD CONSTRAINT `transaksi_keluar_ruang_tujuan_id_fkey` FOREIGN KEY (`ruang_tujuan_id`) REFERENCES `ruang`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `transaksi_keluar` ADD CONSTRAINT `transaksi_keluar_user_id_fkey` FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `transaksi_keluar` ADD CONSTRAINT `transaksi_keluar_approved_by_fkey` FOREIGN KEY (`approved_by`) REFERENCES `users`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `barang_rusak` ADD CONSTRAINT `barang_rusak_unit_barang_id_fkey` FOREIGN KEY (`unit_barang_id`) REFERENCES `unit_barang`(`kode_unit`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `barang_rusak` ADD CONSTRAINT `barang_rusak_ruang_id_fkey` FOREIGN KEY (`ruang_id`) REFERENCES `ruang`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `barang_rusak` ADD CONSTRAINT `barang_rusak_user_id_fkey` FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `mutasi_lokasi` ADD CONSTRAINT `mutasi_lokasi_unit_barang_id_fkey` FOREIGN KEY (`unit_barang_id`) REFERENCES `unit_barang`(`kode_unit`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `mutasi_lokasi` ADD CONSTRAINT `mutasi_lokasi_ruang_asal_id_fkey` FOREIGN KEY (`ruang_asal_id`) REFERENCES `ruang`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `mutasi_lokasi` ADD CONSTRAINT `mutasi_lokasi_ruang_tujuan_id_fkey` FOREIGN KEY (`ruang_tujuan_id`) REFERENCES `ruang`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `mutasi_lokasi` ADD CONSTRAINT `mutasi_lokasi_user_id_fkey` FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `log_aktivitas` ADD CONSTRAINT `log_aktivitas_user_id_fkey` FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `backup_logs` ADD CONSTRAINT `backup_logs_user_id_fkey` FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;
