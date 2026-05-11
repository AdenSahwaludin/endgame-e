export const useChartColors = () => {
  return {
    status: {
      baik:      'rgba(34, 197, 94, 0.8)',   // success (green)
      dipinjam:  'rgba(234, 179, 8, 0.8)',   // warning (yellow)
      rusak:     'rgba(239, 68, 68, 0.8)',   // error (red)
      dihapus:   'rgba(156, 163, 175, 0.8)', // neutral (gray)
    },
    tipe: {
      pemindahan: '#3b82f6', // blue
      peminjaman: '#eab308', // yellow
      penggunaan: '#8b5cf6', // violet
      penghapusan: '#ef4444', // red
      hibah:       '#22c55e', // green
    },
    palette: [
      '#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6',
      '#ec4899', '#06b6d4', '#f97316', '#14b8a6', '#6366f1'
    ]
  }
}
