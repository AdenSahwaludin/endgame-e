<script setup lang="ts" generic="T">
import { useSlots } from 'vue';
const props = defineProps<{
  data: T[];
  columns: any[];
  sortBy?: string;
  sortOrder?: string;
}>();
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
  <UTable 
    :data="data" 
    :columns="columns" 
    v-bind="$attrs"
    :ui="{
      root: 'ring-1 ring-gray-200 dark:ring-gray-800 rounded-xl overflow-hidden shadow-sm bg-white dark:bg-gray-900',
      thead: 'bg-gray-50/50 dark:bg-gray-800/50',
      tbody: 'divide-y divide-gray-200 dark:divide-gray-800',
      tr: 'hover:bg-gray-50/80 dark:hover:bg-gray-800/40 transition-colors duration-150',
      th: 'text-gray-600 dark:text-gray-400 px-4 py-3.5',
      td: 'px-4 py-3'
    }"
  >
    <!-- Render custom headers for sortable columns -->
    <template v-for="col in columns" :key="col.id" #[`${col.id}-header`]="{ column }">
      <div 
        v-if="col.sortable !== false && col.id !== 'actions' && (col.accessorKey || col.id)" 
        class="group flex items-center gap-1.5 cursor-pointer select-none hover:text-primary-600 dark:hover:text-primary-400 transition-colors duration-200" 
        @click="handleSort(col.accessorKey || col.id)"
      >
        <span class="font-semibold">{{ col.header }}</span>
        <div class="flex items-center">
          <UIcon 
            v-if="sortBy === (col.accessorKey || col.id)" 
            :name="sortOrder === 'asc' ? 'i-heroicons-chevron-up-20-solid' : 'i-heroicons-chevron-down-20-solid'" 
            class="w-4 h-4 text-primary-500" 
          />
          <UIcon 
            v-else 
            name="i-heroicons-chevron-up-down-20-solid" 
            class="w-4 h-4 text-gray-400 opacity-40 group-hover:opacity-100 transition-opacity" 
          />
        </div>
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
