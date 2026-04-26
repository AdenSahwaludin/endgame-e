<script setup lang="ts">
definePageMeta({ layout: "admin", middleware: "auth" });
const toast = useToast();
const loading = ref(false);

const { data: kategoris } = await useFetch("/api/kategori", {
  query: { limit: 100 },
});
const { data: ruangs } = await useFetch("/api/ruang", {
  query: { all: "true" },
});

const form = ref({
  namaBarang: "",
  kategoriId: "",
  satuan: "pcs",
  merk: "",
  hargaSatuan: 0,
  reorderPoint: 0,
  deskripsi: "",
  distribusiLokasi: [{ ruangId: 0, jumlah: 1 }] as {
    ruangId: number;
    jumlah: number;
  }[],
});

function addDistribusi() {
  form.value.distribusiLokasi.push({ ruangId: 0, jumlah: 1 });
}
function removeDistribusi(i: number) {
  form.value.distribusiLokasi.splice(i, 1);
}

const kategoriOptions = computed(
  () =>
    (kategoris.value as any)?.data?.map((k: any) => ({
      label: k.namaKategori,
      value: k.kodeKategori,
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
    const dist = form.value.distribusiLokasi.filter(
      (d) => d.ruangId && d.jumlah > 0,
    );
    await $fetch("/api/master-barang", {
      method: "POST",
      body: { ...form.value, distribusiLokasi: dist },
    });
    toast.add({
      title: "Berhasil",
      description: "Master barang dibuat",
      color: "success",
    });
    navigateTo("/master-barang");
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
        to="/master-barang"
      />
      <h2 class="text-2xl font-bold text-gray-900 dark:text-white">
        Tambah Master Barang
      </h2>
    </div>

    <UCard class="w-full">
      <form @submit.prevent="handleSubmit" class="space-y-5">
        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
          <UFormField label="Nama Barang" required>
            <UInput
              v-model="form.namaBarang"
              required
              placeholder="Nama barang"
              class="w-full"
            />
          </UFormField>
          <UFormField label="Kategori" required>
            <USelectMenu
              v-model="form.kategoriId"
              :items="kategoriOptions"
              value-key="value"
              placeholder="Pilih kategori"
              class="w-full"
            />
          </UFormField>
          <UFormField label="Satuan">
            <UInput v-model="form.satuan" placeholder="pcs" class="w-full" />
          </UFormField>
          <UFormField label="Merk">
            <UInput
              v-model="form.merk"
              placeholder="Merk (opsional)"
              class="w-full"
            />
          </UFormField>
          <UFormField label="Harga Satuan">
            <UInput
              v-model.number="form.hargaSatuan"
              type="number"
              min="0"
              class="w-full"
            />
          </UFormField>
          <UFormField label="Minimum Stok (Reorder Point)">
            <UInput
              v-model.number="form.reorderPoint"
              type="number"
              min="0"
              class="w-full"
            />
          </UFormField>
        </div>
        <UFormField label="Deskripsi">
          <UTextarea
            v-model="form.deskripsi"
            placeholder="Deskripsi (opsional)"
            class="w-full"
          />
        </UFormField>

        <!-- Distribusi Lokasi Repeater -->
        <div class="space-y-3">
          <div class="flex items-center justify-between">
            <h4 class="font-semibold text-gray-700 dark:text-gray-300">
              Distribusi Lokasi (Unit Awal)
            </h4>
            <UButton
              icon="i-heroicons-plus"
              size="xs"
              variant="soft"
              @click="addDistribusi"
              >Tambah Ruang</UButton
            >
          </div>
          <div
            v-for="(dist, i) in form.distribusiLokasi"
            :key="i"
            class="flex items-end gap-3 p-3 bg-gray-50 dark:bg-gray-800 rounded-lg"
          >
            <UFormField label="Ruang" class="flex-1">
              <USelectMenu
                v-model="dist.ruangId"
                :items="ruangOptions"
                value-key="value"
                placeholder="Pilih ruang"
                class="w-full"
              />
            </UFormField>
            <UFormField label="Jumlah" class="w-28">
              <UInput
                v-model.number="dist.jumlah"
                type="number"
                min="1"
                class="w-full"
              />
            </UFormField>
            <UButton
              icon="i-heroicons-trash"
              color="red"
              variant="ghost"
              size="sm"
              @click="removeDistribusi(i)"
            />
          </div>
        </div>

        <div class="flex justify-end gap-2">
          <UButton variant="ghost" to="/master-barang">Batal</UButton>
          <UButton type="submit" :loading="loading">Simpan</UButton>
        </div>
      </form>
    </UCard>
  </div>
</template>
