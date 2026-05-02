const isVisible = ref(false);
const title = ref("Konfirmasi");
const message = ref("Apakah Anda yakin ingin melakukan tindakan ini?");
const confirmLabel = ref("Ya, Lanjutkan");
const cancelLabel = ref("Batal");
const isPrompt = ref(false);
const promptValue = ref("");
const promptPlaceholder = ref("Masukkan alasan...");
const color = ref("primary");

let confirmCallback: (value?: string) => void | Promise<void> = () => {};
let cancelCallback: () => void = () => {};

export const useConfirm = () => {
  const confirm = (options: {
    title?: string;
    message: string;
    confirmLabel?: string;
    cancelLabel?: string;
    color?: string;
    isPrompt?: boolean;
    promptPlaceholder?: string;
    onConfirm: (value?: string) => void | Promise<void>;
    onCancel?: () => void;
  }) => {
    title.value = options.title || "Konfirmasi";
    message.value = options.message;
    confirmLabel.value = options.confirmLabel || "Ya, Lanjutkan";
    cancelLabel.value = options.cancelLabel || "Batal";
    color.value = options.color || "primary";
    isPrompt.value = options.isPrompt || false;
    promptValue.value = "";
    promptPlaceholder.value = options.promptPlaceholder || "Masukkan alasan...";
    confirmCallback = options.onConfirm;
    cancelCallback = options.onCancel || (() => {});
    isVisible.value = true;
  };

  return {
    isVisible,
    title,
    message,
    confirmLabel,
    cancelLabel,
    isPrompt,
    promptValue,
    promptPlaceholder,
    color,
    confirm,
    onConfirm: async (val?: string) => await confirmCallback(val),
    onCancel: () => cancelCallback(),
  };
};
