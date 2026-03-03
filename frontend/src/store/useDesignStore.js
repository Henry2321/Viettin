import { create } from "zustand";

const useDesignStore = create((set) => ({
  currentStep: 1,
  config: {
    shirtType: "polo",
    fabricType: "cotton",
    color: "#FFFFFF",
    basePrice: 150000,
    selectedGender: "male",
  },
  background: null,
  backgroundType: "studio",
  shirtCanvas: null, // Image object
  shirtFit: { scale: 0.75, x: 0, y: 0 },
  model: null,
  logo: null,
  logoPosition: "chest",
  logoSize: 15,
  logoPos: { x: 0.5, y: 0.3 }, // Relative center-origin position: x(0-1), y(0-1)
  quote: { title: "", quantity: "", contact: "", note: "" },
  isGenerating: false,
  isAiMerged: false,
  suggestionImage: null,
  stageRef: null,

  // === AI Try-On state mới ===
  shirtSampleFile: null, // File object ảnh áo mẫu để upload
  personFile: null, // File object ảnh cá nhân để upload
  shirtSamplePreview: null, // URL preview ảnh áo mẫu
  personPreview: null, // URL preview ảnh cá nhân
  aiTryonResult: null, // URL ảnh kết quả AI tạo ra
  aiTryonPrompt: null, // Prompt AI đã tạo
  aiTryonShirtDesc: null, // Mô tả áo từ Vision AI
  logoFile: null, // File object ảnh logo để upload
  logoPreview: null, // URL preview ảnh logo

  setStep: (step) => set({ currentStep: step }),
  setStageRef: (ref) => set({ stageRef: ref }),
  setConfig: (newConfig) =>
    set((state) => ({ config: { ...state.config, ...newConfig } })),
  setShirtCanvas: (img) => set({ shirtCanvas: img, isAiMerged: false }),
  setBackground: (img, type) =>
    set({ background: img, backgroundType: type || "custom" }),
  setModel: (img) => set({ model: img }),
  setLogo: (file, preview) => set({ logo: preview, logoFile: file }),
  clearLogo: () => set({ logo: null, logoFile: null }),
  setLogoPos: (pos) => set({ logoPos: pos }),
  setFit: (fit) =>
    set((state) => ({ shirtFit: { ...state.shirtFit, ...fit } })),
  setQuote: (newQuote) =>
    set((state) => ({ quote: { ...state.quote, ...newQuote } })),
  setGenerating: (status) => set({ isGenerating: status }),
  setAiMerged: (status) => set({ isAiMerged: status }),
  setSuggestionImage: (img) => set({ suggestionImage: img }),

  // === AI Try-On setters ===
  setShirtSample: (file, preview) =>
    set({ shirtSampleFile: file, shirtSamplePreview: preview }),
  setPersonFile: (file, preview) =>
    set({ personFile: file, personPreview: preview }),
  setAiTryonResult: (url, prompt, desc) =>
    set({ aiTryonResult: url, aiTryonPrompt: prompt, aiTryonShirtDesc: desc }),
  clearTryon: () =>
    set({ aiTryonResult: null, aiTryonPrompt: null, aiTryonShirtDesc: null }),
}));

export default useDesignStore;
