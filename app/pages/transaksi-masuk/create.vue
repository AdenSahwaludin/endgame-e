<script setup lang="ts">
definePageMeta({ layout: "admin", middleware: "auth" });
const toast = useToast();
const loading = ref(false);

const { data: masters } = await useFetch("/api/master-barang", {
  query: { limit: 200 },
});
const { data: ruangs } = await useFetch("/api/ruang", {
  query: { all: "true" },
});

const form = ref({
  masterBarangId: "",
  tanggalTransaksi: new Date().toISOString().split("T")[0],
  penanggungJawab: "",
  keterangan: "",
  distribusiLokasi: [{ ruangId: undefined as any, jumlah: 1 }] as {
    ruangId: number;
    jumlah: number;
  }[],
});

const masterOptions = computed(
  () =>
    (masters.value as any)?.data?.map((m: any) => ({
      label: `${m.kodeMaster} - ${m.namaBarang}`,
      value: m.kodeMaster,
    })) || [],
);
const ruangOptions = computed(() => {
  const list = Array.isArray(ruangs.value)
    ? ruangs.value
    : (ruangs.value as any)?.data || [];
  return list.map((r: any) => ({ label: r.namaRuang, value: r.id }));
});

function addDist() {
  form.value.distribusiLokasi.push({ ruangId: undefined as any, jumlah: 1 });
}
function removeDist(i: number) {
  form.value.distribusiLokasi.splice(i, 1);
}

async function handleSubmit() {
  loading.value = true;
  try {
    const dist = form.value.distribusiLokasi.filter(
      (d) => d.ruangId && d.jumlah > 0,
    );
    await $fetch("/api/transaksi-masuk", {
      method: "POST",
      body: { ...form.value, distribusiLokasi: dist },
    });
    toast.add({
      title: "Berhasil",
      description: "Transaksi masuk dibuat (pending approval)",
      color: "success",
    });
    navigateTo("/transaksi-masuk");
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
        to="/transaksi-masuk"
      />
      <h2 class="text-2xl font-bold text-gray-900 dark:text-white">
        Tambah Transaksi Masuk
      </h2>
    </div>
    <UCard class="w-full">
      <form @submit.prevent="handleSubmit" class="space-y-5">
        <UFormField label="Barang" required
          ><USelectMenu
            v-model="form.masterBarangId"
            :items="masterOptions"
            value-key="value"
            placeholder="Pilih barang"
            class="w-full"
        /></UFormField>
        <div class="grid grid-cols-2 gap-4">
          <UFormField label="Tanggal"
            ><UInput v-model="form.tanggalTransaksi" type="date" class="w-full"
          /></UFormField>
          <UFormField label="Penanggung Jawab"
            ><UInput
              v-model="form.penanggungJawab"
              placeholder="Opsional"
              class="w-full"
          /></UFormField>
        </div>
        <UFormField label="Keterangan"
          ><UTextarea
            v-model="form.keterangan"
            placeholder="Opsional"
            class="w-full"
        /></UFormField>

        <div class="space-y-3">
          <div class="flex items-center justify-between">
            <h4 class="font-semibold">Distribusi Lokasi</h4>
            <UButton
              icon="i-heroicons-plus"
              size="xs"
              variant="soft"
              @click="addDist"
              >Tambah</UButton
            >
          </div>
          <div
            v-for="(d, i) in form.distribusiLokasi"
            :key="i"
            class="flex items-end gap-3 p-3 bg-gray-50 dark:bg-gray-800 rounded-lg"
          >
            <UFormField label="Ruang" class="flex-1"
              ><USelectMenu
                v-model="d.ruangId"
                :items="ruangOptions"
                value-key="value"
                class="w-full"
            /></UFormField>
            <UFormField label="Jumlah" class="w-28"
              ><UInput
                v-model.number="d.jumlah"
                type="number"
                min="1"
                class="w-full"
            /></UFormField>
            <UButton
              icon="i-heroicons-trash"
              color="red"
              variant="ghost"
              size="sm"
              @click="removeDist(i)"
            />
          </div>
        </div>

        <div class="flex justify-end gap-2">
          <UButton variant="ghost" to="/transaksi-masuk">Batal</UButton>
          <UButton type="submit" :loading="loading">Simpan</UButton>
        </div>
      </form>
    </UCard>
  </div>
</template>
