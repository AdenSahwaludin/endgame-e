<script setup lang="ts">
import { useSlots } from 'vue';
const props = defineProps({
  data: { type: Array, required: true },
  columns: { type: Array, required: true },
  sortBy: { type: String, required: false },
  sortOrder: { type: String, required: false }
});
const emit = defineEmits(['update:sortBy', 'update:sortOrder']);
const slots = useSlots();

function handleSort(key: string) {
  if (!key) return;
  if (props.sortBy === key) {
    emit('update:sortOrder', props.sortOrder === 'asc' ? 'desc' : 'asc');
  } else {
    emit('update:sortBy', key);
    emit('update:sortOrder', 'asc');
  }
}
</script>

<template>
  <UTable :data="data" :columns="columns" v-bind="$attrs">
    <!-- Render custom headers for sortable columns -->
    <template v-for="col in columns" :key="col.id" #[`${col.id}-header`]="{ column }">
      <div 
        v-if="col.sortable !== false && col.id !== 'actions' && (col.accessorKey || col.id)" 
        class="flex items-center gap-1 cursor-pointer select-none hover:text-primary transition-colors" 
        @click="handleSort(col.accessorKey || col.id)"
      >
        <span>{{ col.header }}</span>
        <UIcon 
          v-if="sortBy === (col.accessorKey || col.id)" 
          :name="sortOrder === 'asc' ? 'i-heroicons-arrow-up' : 'i-heroicons-arrow-down'" 
          class="w-4 h-4" 
        />
        <UIcon 
          v-else 
          name="i-heroicons-arrows-up-down" 
          class="w-4 h-4 opacity-0 group-hover:opacity-100 text-gray-400" 
        />
      </div>
      <div v-else>
        {{ col.header }}
      </div>
    </template>

    <!-- Forward all other slots safely -->
    <template v-for="(_, name) in slots" :key="name" #[name]="slotData">
      <slot v-if="!name.toString().endsWith('-header')" :name="name" v-bind="slotData || {}" />
    </template>
  </UTable>
</template>
