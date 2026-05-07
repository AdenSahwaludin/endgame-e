<script setup lang="ts">
definePageMeta({ layout: "admin", middleware: "auth" });
const toast = useToast();
const loading = ref(false);

const { data: units } = await useFetch("/api/unit-barang", {
  query: { limit: 500, activeOnly: "true", status: "baik" },
});
const { data: ruangs } = await useFetch("/api/ruang", {
  query: { all: "true" },
});

const form = ref({
  unitBarangId: "",
  tipe: "peminjaman",
  ruangTujuanId: 0,
  tanggalTransaksi: new Date().toISOString().split("T")[0],
  penerima: "",
  tujuan: "",
  keterangan: "",
});

const tipeOptions = [
  { label: "Peminjaman", value: "peminjaman" },
  { label: "Pemindahan", value: "pemindahan" },
  { label: "Penggunaan", value: "penggunaan" },
  { label: "Penghapusan", value: "penghapusan" },
];
const unitOptions = computed(
  () =>
    (units.value as any)?.data?.map((u: any) => ({
      label: `${u.kodeUnit} - ${u.masterBarang?.namaBarang}`,
      value: u.kodeUnit,
    })) || [],
);
const ruangOptions = computed(() => {
  const list = Array.isArray(ruangs.value)
    ? ruangs.value
    : (ruangs.value as any)?.data || [];
  return list.map((r: any) => ({ label: r.namaRuang, value: r.id }));
});

async function handleSubmit() {
  loading.value = true;
  try {
    await $fetch("/api/transaksi-keluar", { method: "POST", body: form.value });
    toast.add({
      title: "Berhasil",
      description: "Pengelolaan aset dibuat",
      color: "success",
    });
    navigateTo("/transaksi-keluar");
  } catch (e: any) {
    toast.add({
      title: "Error",
      description: e.data?.statusMessage,
      color: "error",
    });
  } finally {
    loading.value = false;
  }
}
</script>

<template>
  <div class="w-full space-y-6">
    <div class="flex items-center gap-3">
      <UButton
        icon="i-heroicons-arrow-left"
        variant="ghost"
        to="/transaksi-keluar"
      />
      <h2 class="text-2xl font-bold text-gray-900 dark:text-white">
        Tambah Pengelolaan Aset
      </h2>
    </div>
    <UCard class="w-full">
      <form @submit.prevent="handleSubmit" class="space-y-5">
        <UFormField label="Unit Barang" required
          ><USelectMenu
            v-model="form.unitBarangId"
            :items="unitOptions"
            value-key="value"
            placeholder="Pilih unit"
            searchable
            class="w-full"
        /></UFormField>
        <UFormField label="Tipe Transaksi" required
          ><USelectMenu
            v-model="form.tipe"
            :items="tipeOptions"
            value-key="value"
            class="w-full"
        /></UFormField>
        <UFormField v-if="form.tipe === 'pemindahan'" label="Ruang Tujuan"
          ><USelectMenu
            v-model="form.ruangTujuanId"
            :items="ruangOptions"
            value-key="value"
            placeholder="Pilih ruang"
            class="w-full"
        /></UFormField>
        <div class="grid grid-cols-2 gap-4">
          <UFormField label="Tanggal"
            ><UInput v-model="form.tanggalTransaksi" type="date" class="w-full"
          /></UFormField>
          <UFormField label="Penerima"
            ><UInput v-model="form.penerima" class="w-full"
          /></UFormField>
        </div>
        <UFormField label="Tujuan"
          ><UInput v-model="form.tujuan" class="w-full"
        /></UFormField>
        <UFormField label="Keterangan"
          ><UTextarea v-model="form.keterangan" class="w-full"
        /></UFormField>
        <div class="flex justify-end gap-2">
          <UButton variant="ghost" to="/transaksi-keluar">Batal</UButton>
          <UButton type="submit" :loading="loading">Simpan</UButton>
        </div>
      </form>
    </UCard>
  </div>
</template>
