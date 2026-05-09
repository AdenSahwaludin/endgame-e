export const useCurrency = () => {
  const formatRupiah = (value: number | string | null | undefined): string => {
    if (value === null || value === undefined) return "Rp 0";
    
    // Parse value to number, handle string inputs safely
    let numValue = 0;
    if (typeof value === 'string') {
      // Remove any non-numeric characters except dots and commas if needed, 
      // but assuming it's from DB it should be purely numeric string.
      numValue = parseFloat(value);
    } else {
      numValue = value;
    }

    if (isNaN(numValue)) return "Rp 0";

    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(numValue);
  };

  return {
    formatRupiah,
  };
};
