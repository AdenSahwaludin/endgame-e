<script setup lang="ts">
const { isVisible, title, message, onConfirm, onCancel, confirmLabel, cancelLabel, isPrompt, promptValue, promptPlaceholder, color } = useConfirm();

const loading = ref(false);

async function handleConfirm() {
  loading.value = true;
  try {
    await onConfirm(isPrompt.value ? promptValue.value : undefined);
    isVisible.value = false;
  } catch (e) {
    console.error(e);
  } finally {
    loading.value = false;
  }
}

function handleCancel() {
  onCancel();
  isVisible.value = false;
}
</script>

<template>
  <UModal v-model:open="isVisible" :close="{ onClick: handleCancel }">
    <template #content>
      <UCard>
        <template #header>
          <div class="flex items-center gap-3">
            <UIcon 
              :name="isPrompt ? 'i-heroicons-pencil-square' : 'i-heroicons-exclamation-triangle'" 
              :class="isPrompt ? 'text-primary' : 'text-warning'"
              class="w-6 h-6"
            />
            <h3 class="text-lg font-bold">{{ title }}</h3>
          </div>
        </template>

        <div class="space-y-4">
          <p class="text-gray-600 dark:text-gray-300">{{ message }}</p>
          
          <div v-if="isPrompt" class="mt-2">
            <UInput 
              v-model="promptValue" 
              :placeholder="promptPlaceholder" 
              autofocus
              class="w-full"
            />
          </div>
        </div>

        <template #footer>
          <div class="flex justify-end gap-3">
            <UButton 
              variant="ghost" 
              color="neutral" 
              @click="handleCancel"
            >
              {{ cancelLabel }}
            </UButton>
            <UButton 
              variant="solid"
              color="info" 
              :loading="loading"
              class="btn-jelly"
              @click="handleConfirm"
            >
              {{ confirmLabel }}
            </UButton>
          </div>
        </template>
      </UCard>
    </template>
  </UModal>
</template>
