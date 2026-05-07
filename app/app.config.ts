export default defineAppConfig({
  ui: {
    card: {
      slots: {
        root: 'bg-white dark:bg-gray-900',
        header: 'px-4 py-5 sm:px-6 bg-gray-50 dark:bg-gray-800/50',
        footer: 'px-4 py-4 sm:px-6 bg-gray-50 dark:bg-gray-800/50'
      },
      // Backward compatibility
      background: 'bg-white dark:bg-gray-900',
      ring: 'ring-1 ring-gray-200 dark:ring-gray-800',
      divide: 'divide-y divide-gray-200 dark:divide-gray-800',
    },
    modal: {
      slots: {
        content: 'bg-white dark:bg-gray-900'
      },
      background: 'bg-white dark:bg-gray-900',
      ring: 'ring-1 ring-gray-200 dark:ring-gray-800',
    },
    popover: {
      slots: {
        content: 'bg-white dark:bg-gray-900'
      },
      background: 'bg-white dark:bg-gray-900',
      ring: 'ring-1 ring-gray-200 dark:ring-gray-800',
    },
    selectMenu: {
      slots: {
        content: 'bg-white dark:bg-gray-900'
      },
      background: 'bg-white dark:bg-gray-900',
      ring: 'ring-1 ring-gray-200 dark:ring-gray-800',
    }
  }
})
