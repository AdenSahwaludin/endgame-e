<script setup lang="ts">
definePageMeta({ layout: "admin", middleware: "auth" });

const toast = useToast();
const { isAdmin } = usePermission();
const { confirm } = useConfirm();

const backupLoading = ref(false);
const restoreLoading = ref(false);
const fileInput = ref<HTMLInputElement | null>(null);

if (!isAdmin()) {
  navigateTo("/");
}

async function handleBackup() {
  backupLoading.value = true;
  try {
    const response = await fetch("/api/system/backup");
    if (!response.ok) throw new Error("Gagal mengunduh backup");
    
    const blob = await response.blob();
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `backup_inventaris_${new Date().toISOString().slice(0, 10)}.json`;
    document.body.appendChild(a);
    a.click();
    window.URL.revokeObjectURL(url);
    document.body.removeChild(a);
    
    toast.add({ title: "Berhasil", description: "Backup berhasil diunduh", color: "success" });
  } catch (e: any) {
    toast.add({ title: "Error", description: e.message, color: "error" });
  } finally {
    backupLoading.value = false;
  }
}

function triggerRestore() {
  fileInput.value?.click();
}

async function handleFileChange(event: Event) {
  const target = event.target as HTMLInputElement;
  const file = target.files?.[0];
  if (!file) return;

  confirm({
    title: "Konfirmasi Restore Data",
    message: "PERINGATAN: Proses ini akan menghapus seluruh data saat ini dan menggantinya dengan data dari file backup. Tindakan ini tidak dapat dibatalkan. Apakah Anda yakin?",
    confirmLabel: "Ya, Restore Sekarang",
    color: "error",
    onConfirm: async () => {
      restoreLoading.value = true;
      try {
        const formData = new FormData();
        formData.append("file", file);

        await $fetch("/api/system/restore", {
          method: "POST",
          body: formData,
        });

        toast.add({ title: "Berhasil", description: "Data sistem berhasil dipulihkan", color: "success" });
        // Refresh page to show restored data
        setTimeout(() => window.location.reload(), 2000);
      } catch (e: any) {
        toast.add({ title: "Error", description: e.data?.statusMessage || "Gagal memulihkan data", color: "error" });
      } finally {
        restoreLoading.value = false;
        if (fileInput.value) fileInput.value.value = "";
      }
    },
    onCancel: () => {
      if (fileInput.value) fileInput.value.value = "";
    }
  });
}
</script>

<template>
  <div class="space-y-6">
    <div>
      <h2 class="text-2xl font-bold text-gray-900 dark:text-white">Pengaturan Sistem</h2>
      <p class="text-sm text-gray-500 dark:text-gray-400 mt-0.5">Kelola backup data dan pemeliharaan sistem.</p>
    </div>

    <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
      <!-- Backup Card -->
      <UCard class="hover:shadow-md transition-shadow">
        <template #header>
          <div class="flex items-center gap-3 text-primary-600 dark:text-primary-400">
            <UIcon name="i-heroicons-cloud-arrow-down" class="w-6 h-6" />
            <h3 class="font-bold">Backup Data</h3>
          </div>
        </template>
        <p class="text-sm text-gray-600 dark:text-gray-300 mb-4">
          Unduh seluruh data aplikasi (Users, Barang, Transaksi, dll) dalam format file JSON. Simpan file ini di tempat yang aman.
        </p>
        <UButton 
          icon="i-heroicons-arrow-down-tray" 
          block 
          class="btn-jelly"
          :loading="backupLoading"
          @click="handleBackup"
        >
          Unduh Backup Sekarang
        </UButton>
      </UCard>

      <!-- Restore Card -->
      <UCard class="hover:shadow-md transition-shadow border-red-100 dark:border-red-900/30">
        <template #header>
          <div class="flex items-center gap-3 text-red-600 dark:text-red-400">
            <UIcon name="i-heroicons-cloud-arrow-up" class="w-6 h-6" />
            <h3 class="font-bold">Restore Data</h3>
          </div>
        </template>
        <p class="text-sm text-gray-600 dark:text-gray-300 mb-4">
          Pulihkan data sistem dari file backup sebelumnya. <span class="font-bold text-red-500">Peringatan: Data saat ini akan terhapus seluruhnya!</span>
        </p>
        <input 
          type="file" 
          ref="fileInput" 
          accept=".json" 
          class="hidden" 
          @change="handleFileChange" 
        />
        <UButton 
          icon="i-heroicons-arrow-path" 
          color="error" 
          variant="soft"
          block 
          class="btn-jelly"
          :loading="restoreLoading"
          @click="triggerRestore"
        >
          Upload & Restore Data
        </UButton>
      </UCard>
    </div>

    <!-- Info Card -->
    <UAlert
      icon="i-heroicons-information-circle"
      color="info"
      variant="soft"
      title="Tips Keamanan"
      description="Lakukan backup secara rutin (misal: setiap minggu atau sebelum melakukan perubahan besar) untuk mencegah kehilangan data jika terjadi kegagalan sistem."
    />
  </div>
</template>
