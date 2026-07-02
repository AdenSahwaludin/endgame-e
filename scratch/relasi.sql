-- 1. Table Role
CREATE TABLE Role (
    id_role INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(255) NOT NULL
);

-- 2. Table Users
CREATE TABLE Users (
    id_users INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    is_active BOOLEAN DEFAULT TRUE,
    role_id INT NOT NULL,
    FOREIGN KEY (role_id) REFERENCES Role(id_role)
);

-- 3. Table Log_Aktivitas
CREATE TABLE Log_Aktivitas (
    id_log_aktivitas INT AUTO_INCREMENT PRIMARY KEY,
    ip_address VARCHAR(45),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    deskripsi TEXT,
    nama_tabel VARCHAR(100),
    jenis_aktivitas VARCHAR(100),
    user_id INT NOT NULL,
    FOREIGN KEY (user_id) REFERENCES Users(id_users)
);

-- 4. Table Backup_Logs
CREATE TABLE Backup_Logs (
    id_backup INT AUTO_INCREMENT PRIMARY KEY,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    status VARCHAR(50),
    file_size BIGINT,
    filename VARCHAR(255),
    user_id INT NOT NULL,
    FOREIGN KEY (user_id) REFERENCES Users(id_users)
);

-- 5. Table Kategori
CREATE TABLE Kategori (
    kode_kategori VARCHAR(50) PRIMARY KEY,
    nama_kategori VARCHAR(255) NOT NULL,
    deskripsi TEXT
);

-- 6. Table Master_Barang
CREATE TABLE Master_Barang (
    kode_master VARCHAR(50) PRIMARY KEY,
    nama_barang VARCHAR(255) NOT NULL,
    kategori_id VARCHAR(50) NOT NULL,
    satuan VARCHAR(50) DEFAULT 'pcs',
    merk VARCHAR(100),
    harga_satuan DECIMAL(15, 2),
    reorder_point INT DEFAULT 0,
    total_pesanan INT DEFAULT 0,
    deskripsi TEXT,
    distribusi_lokasi JSON,
    FOREIGN KEY (kategori_id) REFERENCES Kategori(kode_kategori)
);

-- 7. Table Ruang
CREATE TABLE Ruang (
    id_ruang INT AUTO_INCREMENT PRIMARY KEY,
    nama_ruang VARCHAR(255) NOT NULL
);

-- 8. Table Unit_Barang
CREATE TABLE Unit_Barang (
    kode_unit VARCHAR(50) PRIMARY KEY,
    master_barang_id VARCHAR(50) NOT NULL,
    ruang_id INT,
    status VARCHAR(50) DEFAULT 'baik',
    is_active BOOLEAN DEFAULT TRUE,
    tanggal_pembelian DATE,
    catatan TEXT,
    FOREIGN KEY (master_barang_id) REFERENCES Master_Barang(kode_master),
    FOREIGN KEY (ruang_id) REFERENCES Ruang(id_ruang)
);

-- 9. Table Pengadaan_Barang
CREATE TABLE Pengadaan_Barang (
    id_pengadaan INT AUTO_INCREMENT PRIMARY KEY,
    master_barang_id VARCHAR(50) NOT NULL,
    tanggal_pengadaan DATE,
    total_pesanan INT,
    user_id INT NOT NULL,
    approved_by INT,
    approval_status VARCHAR(50) DEFAULT 'pending',
    ruang_tujuan INT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (master_barang_id) REFERENCES Master_Barang(kode_master),
    FOREIGN KEY (user_id) REFERENCES Users(id_users),
    FOREIGN KEY (approved_by) REFERENCES Users(id_users),
    FOREIGN KEY (ruang_tujuan) REFERENCES Ruang(id_ruang)
);

-- 10. Table Barang_Rusak
CREATE TABLE Barang_Rusak (
    id_barang_rusak INT AUTO_INCREMENT PRIMARY KEY,
    unit_barang_id VARCHAR(50) NOT NULL,
    ruang_id INT,
    tanggal_kejadian DATE,
    penanggung_jawab VARCHAR(255),
    user_id INT NOT NULL,
    FOREIGN KEY (unit_barang_id) REFERENCES Unit_Barang(kode_unit),
    FOREIGN KEY (ruang_id) REFERENCES Ruang(id_ruang),
    FOREIGN KEY (user_id) REFERENCES Users(id_users)
);

-- 11. Table Mutasi_Lokasi
CREATE TABLE Mutasi_Lokasi (
    id_mutasi INT AUTO_INCREMENT PRIMARY KEY,
    unit_barang_id VARCHAR(50) NOT NULL,
    ruang_asal_id INT,
    ruang_tujuan_id INT NOT NULL,
    tanggal_mutasi DATE,
    user_id INT NOT NULL,
    FOREIGN KEY (unit_barang_id) REFERENCES Unit_Barang(kode_unit),
    FOREIGN KEY (ruang_asal_id) REFERENCES Ruang(id_ruang),
    FOREIGN KEY (ruang_tujuan_id) REFERENCES Ruang(id_ruang),
    FOREIGN KEY (user_id) REFERENCES Users(id_users)
);

-- 12. Table Pengelolaan_Barang
CREATE TABLE Pengelolaan_Barang (
    id_pengelolaan_barang INT AUTO_INCREMENT PRIMARY KEY,
    kode_pengelolaan VARCHAR(50) NOT NULL,
    unit_barang_id VARCHAR(50) NOT NULL,
    ruang_asal_id INT,
    ruang_tujuan_id INT,
    tipe VARCHAR(50),
    tanggal_pengelolaan DATE,
    userId INT NOT NULL,
    FOREIGN KEY (unit_barang_id) REFERENCES Unit_Barang(kode_unit),
    FOREIGN KEY (ruang_asal_id) REFERENCES Ruang(id_ruang),
    FOREIGN KEY (ruang_tujuan_id) REFERENCES Ruang(id_ruang),
    FOREIGN KEY (userId) REFERENCES Users(id_users)
);
