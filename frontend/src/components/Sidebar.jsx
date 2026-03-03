import React from "react";
import useDesignStore from "../store/useDesignStore";
import {
  Palette,
  Layers,
  User,
  Zap,
  Image as ImageIcon,
  Download,
} from "lucide-react";
import axios from "axios";

// Import local backgrounds
import bgVanPhong from "../picture/vanphong.jpg";
import bgXuong from "../picture/xuong.jpg";
import bgStudio from "../picture/studio.jpg";
import bgShowroom from "../picture/showroom.jpg";

const Sidebar = () => {
  const API_BASE = "https://YOUR_BACKEND_URL.vercel.app"; // Thay YOUR_BACKEND_URL bằng URL thực tế
  const {
    currentStep,
    setStep,
    config,
    setConfig,
    isGenerating,
    setGenerating,
    setShirtCanvas,
    setModel,
    setBackground,
    backgroundType,
    logoPosition,
    logoSize,
    shirtFit,
    setFit,
    quote,
    setQuote,
    logo,
    logoFile,
    setLogo,
    setAiMerged,
    suggestionImage,
    setSuggestionImage,
    stageRef,
    shirtSampleFile,
    shirtSamplePreview,
    personFile,
    personPreview,
    aiTryonResult,
    aiTryonPrompt,
    aiTryonShirtDesc,
    setShirtSample,
    setPersonFile,
    setAiTryonResult,
    clearTryon,
  } = useDesignStore();

  const [adviceTitle, setAdviceTitle] = React.useState("");
  const [tryonStatus, setTryonStatus] = React.useState(""); // trạng thái chi tiết AI Try-On

  const generateShirtAI = async () => {
    setGenerating(true);
    setSuggestionImage(null);
    try {
      const formData = new FormData();
      formData.append("shirt_type", config.shirtType);
      formData.append("color", config.color);
      formData.append("background_type", backgroundType);

      const response = await axios.post(`${API_BASE}/generate-shirt`, formData);

      if (response.data.image_url) {
        const fullImageUrl =
          response.data.image_url.startsWith("http") ||
          response.data.image_url.startsWith("data:")
            ? response.data.image_url
            : `${API_BASE}/` + response.data.image_url;

        const img = new Image();
        img.crossOrigin = "anonymous";
        img.onload = () => {
          setShirtCanvas(img);
          if (response.data.suggestion_image) {
            // Xây dựng đường dẫn đầy đủ cho ảnh gợi ý (suggestion_image)
            const sugImg = response.data.suggestion_image;
            const fullSugUrl =
              sugImg.startsWith("http") || sugImg.startsWith("data:")
                ? sugImg
                : `${API_BASE}/` + sugImg;
            setSuggestionImage(fullSugUrl);
            setAdviceTitle(response.data.advice_title || "Gợi ý bối cảnh");
          }
        };
        img.src = fullImageUrl;
      }
    } catch (error) {
      console.error(error);
      alert("Lỗi AI.");
    } finally {
      setGenerating(false);
    }
  };

  const generateModelAI = async (gender = "male") => {
    setGenerating(true);
    try {
      const formData = new FormData();
      formData.append("gender", gender);
      const res = await axios.post(`${API_BASE}/generate-model`, formData);
      if (res.data.image_url) {
        const img = new Image();
        img.crossOrigin = "anonymous";
        img.onload = () => setModel(img);
        img.src = res.data.image_url;
      } else if (res.data.error) {
        alert("Lỗi AI: " + res.data.error);
      }
    } catch (error) {
      console.error("AI Model Generation failed", error);
      alert("Lỗi kết nối Backend hoặc OpenAI API Key không hợp lệ.");
    } finally {
      setGenerating(false);
    }
  };

  const handleLogoUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const previewUrl = URL.createObjectURL(file);
    console.log('Logo preview URL:', previewUrl);

    const img = new Image();
    img.onload = () => {
      console.log('Logo loaded successfully');
      setLogo(file, previewUrl); // lưu File và preview URL
    };
    img.onerror = () => {
      console.error('Logo load failed');
    };
    img.src = previewUrl;
  };

  // Handler riêng cho AI Try-On (lưu cả File object để upload multipart)
  const handleTryonShirtUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const previewUrl = URL.createObjectURL(file);
    setShirtSample(file, previewUrl);
    clearTryon();
  };

  const handleTryonPersonUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const previewUrl = URL.createObjectURL(file);
    setPersonFile(file, previewUrl);
    clearTryon();
  };

  // Gọi API AI Try-On
  const runAiTryon = async () => {
    if (!shirtSampleFile || !personFile) {
      alert("Vui lòng upload đủ ẢNH ÁO MẪU và ẢNH CÁ NHÂN trước!");
      return;
    }
    setGenerating(true);
    clearTryon();
    setTryonStatus("🔍 Đang phân tích 4 ảnh bằng AI Vision...");
    
    try {
      // Test backend connection first
      const healthCheck = await axios.get(`${API_BASE}/health`, { timeout: 5000 });
      if (!healthCheck.data.status === 'healthy') {
        throw new Error('Backend không sẵn sàng');
      }
    } catch (error) {
      setTryonStatus("❌ Không thể kết nối backend. Vui lòng kiểm tra server.");
      alert("Lỗi kết nối: Backend server không chạy hoặc không thể truy cập. Vui lòng khởi động lại backend.");
      setGenerating(false);
      return;
    }
    
    try {
      const formData = new FormData();
      formData.append("shirt_image", shirtSampleFile);
      formData.append("person_image", personFile);
      
      // Lấy logoFile từ store
      const currentState = useDesignStore.getState();
      if (currentState.logoFile) {
        formData.append("logo_image", currentState.logoFile);
      }
      
      // Gửi background nếu đã chọn
      if (currentState.background) {
        // Convert background image to blob synchronously
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        canvas.width = currentState.background.width;
        canvas.height = currentState.background.height;
        ctx.drawImage(currentState.background, 0, 0);
        
        // Convert to blob and wait for it
        const backgroundBlob = await new Promise(resolve => {
          canvas.toBlob(resolve, 'image/png');
        });
        
        if (backgroundBlob) {
          formData.append("background_image", backgroundBlob, "background.png");
        }
      }

      setTryonStatus(
        "🚀 Đang ghép 4 ảnh bằng Gemini AI... (30-60 giây)",
      );
      const res = await axios.post(`${API_BASE}/ai-tryon`, formData, {
        headers: { "Content-Type": "multipart/form-data" },
        timeout: 180000,
      });

      if (res.data.error) {
        alert("Lỗi AI: " + res.data.error);
        setTryonStatus("❌ Thất bại: " + res.data.error);
        return;
      }

      const { image_url, prompt, shirt_description, mode, person_image } =
        res.data;

      if (image_url && mode === "gemini") {
        setAiTryonResult(image_url, prompt, shirt_description);
        const img = new Image();
        img.crossOrigin = "anonymous";
        img.onload = () => {
          setModel(img);
          setAiMerged(true);
        };
        img.src = image_url;
        setTryonStatus(`✅ Thành công! Đã ghép 4 ảnh (Gemini AI)`);
      } else {
        setAiTryonResult(
          person_image || personPreview,
          prompt,
          shirt_description,
        );
        const img = new Image();
        img.crossOrigin = "anonymous";
        img.onload = () => {
          setModel(img);
          setAiMerged(false);
        };
        img.src = person_image || personPreview;
        setTryonStatus("⚡ Gemini đang xử lý 4 ảnh, vui lòng bấm lại.");
      }
    } catch (err) {
      console.error(err);
      if (err.code === "ECONNABORTED") {
        setTryonStatus("⏱ Timeout - AI model đang tải. Thử lại sau 1 phút.");
        alert(
          "Quá thời gian chờ. HF model đang khởi động, vui lòng thử lại sau 1 phút!",
        );
      } else {
        alert("Lỗi kết nối: " + (err.message || "Không rõ"));
        setTryonStatus("❌ Lỗi kết nối backend.");
      }
    } finally {
      setGenerating(false);
    }
  };

  const setPresetBackground = (source) => {
    const bgMap = {
      office: bgVanPhong,
      workshop: bgXuong,
      studio: bgStudio,
      showroom: bgShowroom,
    };
    const src = bgMap[source] || source;

    const img = new Image();
    img.onload = () => {
      setBackground(img, source); // Pass source ID for context
    };
    img.src = src;
  };

  return (
    <div className="glass-card p-8 h-full min-h-[600px] flex flex-col gap-6 shadow-2xl relative overflow-y-auto max-h-[85vh]">
      {/* B1: Cấu hình sản phẩm */}
      {currentStep === 1 && (
        <div className="flex flex-col gap-6 animate-fadeIn">
          <h2 className="text-2xl font-bold text-viettin-accent flex items-center gap-2">
            <Palette size={24} /> B1: Cấu hình sản phẩm
          </h2>
          <div className="grid grid-cols-2 gap-3">
            <div className="flex flex-col gap-1">
              <label className="text-[10px] text-slate-500 uppercase font-bold ml-1">
                Loại áo
              </label>
              <select
                className="bg-slate-900 border border-white/10 rounded-xl p-2 text-xs text-white outline-none"
                value={config.shirtType}
                onChange={(e) => setConfig({ shirtType: e.target.value })}
              >
                <option value="polo">Áo Polo</option>
                <option value="tshirt">Áo Thun</option>
                <option value="hoodie">Áo Hoodie</option>
                <option value="jacket">Áo Khoác</option>
              </select>
            </div>
            <div className="flex flex-col gap-1">
              <label className="text-[10px] text-slate-500 uppercase font-bold ml-1">
                Chất liệu
              </label>
              <select
                className="bg-slate-900 border border-white/10 rounded-xl p-2 text-xs text-white outline-none"
                value={config.fabricType}
                onChange={(e) => setConfig({ fabricType: e.target.value })}
              >
                <option value="Cá sấu Poly">Cá sấu Poly</option>
                <option value="Cotton 100%">Cotton 100%</option>
                <option value="Mè kim">Vải Mè kim</option>
                <option value="Thun lạnh">Thun lạnh</option>
              </select>
            </div>
          </div>
          <div className="flex flex-col gap-2">
            <label className="text-[10px] text-slate-500 uppercase font-bold ml-1">
              Giá & Màu
            </label>
            <div className="flex items-center gap-4">
              <input
                type="number"
                step="10000"
                className="bg-slate-900 border border-white/10 rounded-xl p-2 text-sm font-bold text-white outline-none w-2/3"
                value={config.basePrice}
                onChange={(e) =>
                  setConfig({ basePrice: parseInt(e.target.value) || 0 })
                }
              />
              <div className="flex gap-1">
                {["#FFFFFF", "#000000", "#0a2351", "#FF0000", "#FFA500"].map(
                  (c) => (
                    <button
                      key={c}
                      onClick={() => setConfig({ color: c })}
                      className={`w-5 h-5 rounded-full border border-white/20 ${config.color === c ? "ring-2 ring-viettin-accent" : ""}`}
                      style={{ backgroundColor: c }}
                    />
                  ),
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* B2: AI Try-On thông minh */}
      {currentStep === 2 && (
        <div className="flex flex-col gap-6 animate-fadeIn">
          <h2 className="text-2xl font-bold text-viettin-accent flex items-center gap-2">
            <User size={24} /> B2: AI Try-On Thông Minh
          </h2>
          <p className="text-[11px] text-slate-400 leading-relaxed bg-slate-900/40 p-3 rounded-xl border border-white/5">
            📸 Upload <strong className="text-white">ảnh áo mẫu</strong> +{" "}
            <strong className="text-white">ảnh cá nhân</strong> + chọn background → AI sẽ ghép 4 ảnh thành 1 ảnh hoàn chỉnh.
          </p>

          {/* Upload Logo */}
          <div className="p-4 bg-slate-900/40 rounded-xl border border-white/5">
            <label className="text-xs text-slate-400 uppercase font-bold mb-2 block flex items-center gap-2">
              <Zap size={14} className="text-viettin-accent" /> Upload Logo
              (Chỉnh ngay trên áo)
            </label>
            <input
              type="file"
              onChange={handleLogoUpload}
              className="text-xs text-slate-400 file:mr-4 file:py-2 file:px-4 file:rounded-xl file:border-0 file:bg-slate-800 file:text-white hover:file:bg-slate-700 w-full"
            />

            {/* Hiển thị preview logo */}
            {logo && (
              <div className="mt-3 flex items-center gap-3">
                <div className="w-16 h-16 rounded-lg overflow-hidden border border-viettin-accent/30 bg-slate-800 flex items-center justify-center">
                  <img 
                    src={logo} 
                    alt="Logo preview" 
                    className="max-w-full max-h-full object-contain"
                    onLoad={() => console.log('Logo preview rendered successfully')}
                    onError={(e) => {
                      console.log('Logo preview error:', e, 'URL:', logo);
                      e.target.style.display = 'none';
                    }}
                  />
                </div>
                <div className="flex-1">
                  <p className="text-[10px] text-viettin-accent font-bold">Logo đã upload</p>
                  <p className="text-[8px] text-slate-500">Sẽ được thêm vào áo khi AI Try-On</p>
                  <p className="text-[8px] text-slate-600">URL: {logo?.substring(0, 30)}...</p>
                </div>
              </div>
            )}
            {console.log('Current logo state:', logo)}

            {logo && (
              <div className="mt-3">
                <label className="text-xs text-slate-400 uppercase font-bold mb-2 block">
                  Cỡ Logo: {logoSize}%
                </label>
                <input
                  type="range"
                  min="5"
                  max="40"
                  value={logoSize}
                  onChange={(e) =>
                    useDesignStore.setState({
                      logoSize: parseInt(e.target.value),
                    })
                  }
                  className="w-full h-2 bg-slate-800 rounded-lg accent-viettin-accent"
                />
                <p className="text-[8px] text-slate-500 mt-2 italic">
                  * Bạn có thể kéo thả logo trực tiếp trên màn hình bên trái
                </p>
              </div>
            )}
          </div>

          {/* 2 ô upload song song */}
          <div className="grid grid-cols-2 gap-3">
            {/* Ô 1: Ảnh áo mẫu */}
            <div className="flex flex-col gap-2">
              <label className="text-[10px] text-viettin-accent uppercase font-black flex items-center gap-1">
                👕 Ảnh Áo Mẫu
              </label>
              <label
                htmlFor="shirt-sample-upload"
                className={`relative flex flex-col items-center justify-center h-36 rounded-2xl border-2 border-dashed cursor-pointer transition-all overflow-hidden ${
                  shirtSamplePreview
                    ? "border-viettin-accent"
                    : "border-white/20 hover:border-viettin-accent/60"
                } bg-slate-900/50`}
              >
                {shirtSamplePreview ? (
                  <>
                    <img
                      src={shirtSamplePreview}
                      className="absolute inset-0 w-full h-full object-cover"
                      alt="Áo mẫu"
                    />
                    <div className="absolute inset-0 bg-black/40 flex items-end justify-center pb-2">
                      <span className="text-[9px] text-white bg-black/70 px-2 py-1 rounded-full">
                        Nhấn để đổi
                      </span>
                    </div>
                  </>
                ) : (
                  <>
                    <span className="text-3xl mb-1">👔</span>
                    <span className="text-[9px] text-slate-500 text-center px-2">
                      Upload ảnh áo mẫu
                    </span>
                  </>
                )}
                <input
                  id="shirt-sample-upload"
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={handleTryonShirtUpload}
                />
              </label>
            </div>

            {/* Ô 2: Ảnh cá nhân */}
            <div className="flex flex-col gap-2">
              <label className="text-[10px] text-viettin-accent uppercase font-black flex items-center gap-1">
                🧑 Ảnh Cá Nhân
              </label>
              <label
                htmlFor="person-upload"
                className={`relative flex flex-col items-center justify-center h-36 rounded-2xl border-2 border-dashed cursor-pointer transition-all overflow-hidden ${
                  personPreview
                    ? "border-viettin-accent"
                    : "border-white/20 hover:border-viettin-accent/60"
                } bg-slate-900/50`}
              >
                {personPreview ? (
                  <>
                    <img
                      src={personPreview}
                      className="absolute inset-0 w-full h-full object-cover"
                      alt="Ảnh cá nhân"
                    />
                    <div className="absolute inset-0 bg-black/40 flex items-end justify-center pb-2">
                      <span className="text-[9px] text-white bg-black/70 px-2 py-1 rounded-full">
                        Nhấn để đổi
                      </span>
                    </div>
                  </>
                ) : (
                  <>
                    <span className="text-3xl mb-1">🧑‍💼</span>
                    <span className="text-[9px] text-slate-500 text-center px-2">
                      Upload ảnh của bạn
                    </span>
                  </>
                )}
                <input
                  id="person-upload"
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={handleTryonPersonUpload}
                />
              </label>
            </div>
          </div>

          {/* Checklist trạng thái */}
          <div className="flex items-center gap-3 text-[11px]">
            <span
              className={`px-2 py-1 rounded-lg font-bold ${shirtSamplePreview ? "bg-green-900/50 text-green-400" : "bg-slate-800 text-slate-500"}`}
            >
              {shirtSamplePreview ? "✓" : "○"} Áo mẫu
            </span>
            <span
              className={`px-2 py-1 rounded-lg font-bold ${personPreview ? "bg-green-900/50 text-green-400" : "bg-slate-800 text-slate-500"}`}
            >
              {personPreview ? "✓" : "○"} Ảnh người
            </span>
            {shirtSamplePreview && personPreview && (
              <span className="text-viettin-accent font-bold">
                → Sẵn sàng AI!
              </span>
            )}
          </div>

          {/* Divider - chọn background */}
          <div className="pt-2 border-t border-white/10">
            <p className="text-[10px] text-slate-500 uppercase font-bold mb-3">
              Chọn background cho ảnh kết quả:
            </p>
            <div className="grid grid-cols-2 gap-3">
              {[
                { id: "office", url: bgVanPhong, name: "Văn phòng" },
                { id: "workshop", url: bgXuong, name: "Xưởng" },
                { id: "studio", url: bgStudio, name: "Studio" },
                { id: "showroom", url: bgShowroom, name: "Showroom" },
              ].map((bg) => (
                <button
                  key={bg.id}
                  onClick={() => setPresetBackground(bg.id)}
                  className={`h-16 overflow-hidden rounded-xl border-2 transition-all relative ${
                    backgroundType === bg.id ? "border-viettin-accent" : "border-white/10"
                  }`}
                >
                  <img src={bg.url} className="w-full h-full object-cover" />
                  <span className="absolute bottom-1 left-1 text-[8px] bg-black/70 px-2 py-1 rounded">
                    {bg.name}
                  </span>
                </button>
              ))}
            </div>
          </div>

          {/* Nút AI Tạo Ảnh */}
          <button
            onClick={runAiTryon}
            disabled={isGenerating || !shirtSampleFile || !personFile}
            className="viettin-gradient p-4 rounded-xl text-sm font-bold flex items-center justify-center gap-2 shadow-[0_8px_25px_rgba(30,174,238,0.35)] hover:scale-[1.02] transition-all disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:scale-100"
          >
            <Zap size={18} className={isGenerating ? "animate-spin" : ""} />
            {isGenerating ? "AI Đang Xử Lý..." : "⚡ AI TẠO ẢNH TRY-ON"}
          </button>

          {/* Trạng thái chi tiết */}
          {tryonStatus && (
            <p className="text-[11px] text-center text-viettin-accent animate-pulse font-medium">
              {tryonStatus}
            </p>
          )}

          {/* Hiển thị kết quả */}
          {aiTryonResult && (
            <div className="flex flex-col gap-3 animate-fadeIn">
              <div className="flex items-center justify-between">
                <h4 className="text-[10px] text-viettin-accent uppercase font-black flex items-center gap-1">
                  <Zap size={11} fill="currentColor" /> KẾT QUẢ AI TRY-ON
                </h4>
                <span className="text-[8px] bg-emerald-900/50 text-emerald-400 px-2 py-0.5 rounded-full font-bold">
                  AI GENERATED
                </span>
              </div>

              {/* Ảnh kết quả */}
              <div className="relative rounded-2xl overflow-hidden border border-viettin-accent/30 shadow-[0_0_20px_rgba(30,174,238,0.15)] bg-slate-900 max-h-96">
                <img
                  src={aiTryonResult}
                  className="w-full h-auto object-contain max-h-96"
                  alt="AI Try-On Result"
                />
                <div className="absolute top-2 right-2">
                  <a
                    href={aiTryonResult}
                    download={`VietinAI_TryOn_${Date.now()}.png`}
                    className="bg-black/70 text-white text-[9px] px-2 py-1 rounded-lg hover:bg-viettin-accent/80 transition-all font-bold"
                  >
                    ⬇ Tải về
                  </a>
                </div>
              </div>

              {/* Prompt BẮT BUỘC hiển thị */}
              {aiTryonPrompt && (
                <details
                  className="bg-slate-900/60 rounded-xl border border-viettin-accent/20 p-3"
                  open
                >
                  <summary className="text-[10px] text-viettin-accent cursor-pointer font-black uppercase flex items-center gap-2">
                    🤖 PROMPT BẮT BUỘC ĐÃ DÙNG
                    <span className="ml-auto text-[8px] bg-viettin-accent/20 text-viettin-accent px-2 py-0.5 rounded-full border border-viettin-accent/30">
                      FIXED
                    </span>
                  </summary>
                  <div className="mt-3 space-y-3">
                    {/* Prompt tiếng Việt - từng dòng */}
                    <div className="bg-slate-950/60 rounded-lg p-3 border border-white/5">
                      <p className="text-[9px] text-slate-500 uppercase font-bold mb-2">
                        📋 Prompt (Tiếng Việt):
                      </p>
                      <ul className="space-y-1.5">
                        {aiTryonPrompt
                          .split("\n")
                          .filter(Boolean)
                          .map((line, i) => (
                            <li
                              key={i}
                              className="flex items-start gap-2 text-[10px] text-slate-300 leading-relaxed"
                            >
                              <span className="text-viettin-accent mt-0.5 flex-shrink-0 font-bold">
                                ▸
                              </span>
                              <span>{line}</span>
                            </li>
                          ))}
                      </ul>
                    </div>
                    {/* Mô tả áo từ Vision AI */}
                    {aiTryonShirtDesc && (
                      <div className="bg-slate-950/40 rounded-lg p-3 border border-white/5">
                        <p className="text-[9px] text-slate-500 uppercase font-bold mb-1">
                          🔍 Vision AI phân tích áo mẫu:
                        </p>
                        <p className="text-[10px] text-slate-400 leading-relaxed italic">
                          {aiTryonShirtDesc}
                        </p>
                      </div>
                    )}
                  </div>
                </details>
              )}
            </div>
          )}
        </div>
      )}

      {/* B3: Báo giá */}
      {currentStep === 3 && (
        <div className="flex flex-col gap-4 animate-fadeIn">
          <h2 className="text-2xl font-bold text-viettin-accent flex items-center gap-2">
            <Layers size={24} /> B3: Báo giá – Xuất Card
          </h2>
          <p className="text-xs text-slate-400 italic mb-2">
            Thông tin này sẽ hiển thị trực tiếp trên Card bên trái
          </p>

          <div className="flex flex-col gap-3">
            <div className="flex flex-col gap-1">
              <label className="text-[10px] text-slate-400 uppercase font-bold">
                Tên loại áo
              </label>
              <input
                type="text"
                placeholder="VD: ÁO POLO KỸ THUẬT"
                className="bg-slate-900 p-3 rounded-xl border border-white/5 focus:border-viettin-accent outline-none"
                value={quote.title}
                onChange={(e) => setQuote({ title: e.target.value })}
              />
            </div>

            <div className="flex flex-col gap-1">
              <label className="text-[10px] text-slate-400 uppercase font-bold">
                Chất liệu vải
              </label>
              <input
                type="text"
                placeholder="VD: Cá sấu Poly Thái"
                className="bg-slate-900 p-3 rounded-xl border border-white/5 outline-none"
                value={config.fabricType}
                onChange={(e) => setConfig({ fabricType: e.target.value })}
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="flex flex-col gap-1">
                <label className="text-[10px] text-slate-400 uppercase font-bold">
                  Số lượng
                </label>
                <input
                  type="text"
                  placeholder="100-300"
                  className="bg-slate-900 p-3 rounded-xl border border-white/5 outline-none"
                  value={quote.quantity}
                  onChange={(e) => setQuote({ quantity: e.target.value })}
                />
              </div>
              <div className="flex flex-col gap-1">
                <label className="text-[10px] text-slate-400 uppercase font-bold">
                  Liên hệ
                </label>
                <input
                  type="text"
                  placeholder="Mr. Bình"
                  className="bg-slate-900 p-3 rounded-xl border border-white/5 outline-none"
                  value={quote.contact}
                  onChange={(e) => setQuote({ contact: e.target.value })}
                />
              </div>
            </div>

            <div className="flex flex-col gap-1">
              <label className="text-[10px] text-slate-400 uppercase font-bold">
                Thông tin nhanh (Size/Note)
              </label>
              <textarea
                placeholder="VD: Size S-3XL, In decal cao cấp"
                className="bg-slate-900 p-3 rounded-xl border border-white/5 outline-none h-20"
                value={quote.note}
                onChange={(e) => setQuote({ note: e.target.value })}
              />
            </div>
          </div>

          <button
            onClick={() => {
              if (stageRef) {
                const link = document.createElement("a");
                link.download = `ViettinAI_BaoGia_${Date.now()}.png`;
                link.href = stageRef.toDataURL({ pixelRatio: 2 });
                link.click();
              } else {
                alert(
                  "Đang chuẩn bị khung hình, vui lòng thử lại sau giây lát.",
                );
              }
            }}
            className="mt-4 viettin-gradient p-5 rounded-2xl font-black text-lg flex items-center justify-center gap-3 shadow-[0_10px_30px_rgba(30,174,238,0.3)] hover:scale-[1.02] transition-all"
          >
            <Download size={24} /> XUẤT CARD (PNG/JPG)
          </button>
          <p className="text-[10px] text-center text-slate-500">
            Sau khi tải về, bạn có thể gửi trực tiếp qua Zalo cho khách hàng.
          </p>
        </div>
      )}

      {/* B4: Bảng Size */}
      {currentStep === 4 && (
        <div className="flex flex-col gap-6 animate-fadeIn">
          <h2 className="text-2xl font-bold text-viettin-accent flex items-center gap-2">
            <Layers size={24} /> B4: Bảng Size Chuẩn
          </h2>
          <div className="p-4 bg-slate-900/40 rounded-xl border border-white/5 space-y-4">
            <p className="text-sm text-slate-300 leading-relaxed">
              Bảng thông số size được thiết kế dựa trên form áo chuẩn của Việt
              Tín. Bạn có thể tải bảng này về để gửi kèm với mẫu thiết kế cho
              nhân viên hoặc khách hàng.
            </p>
          </div>

          <button
            onClick={() => {
              if (stageRef) {
                const link = document.createElement("a");
                link.download = `ViettinAI_BangSize_${config.shirtType}_${Date.now()}.png`;
                link.href = stageRef.toDataURL({ pixelRatio: 2 });
                link.click();
              } else {
                alert(
                  "Đang chuẩn bị khung hình, vui lòng thử lại sau giây lát.",
                );
              }
            }}
            className="viettin-gradient p-5 rounded-2xl font-black text-lg flex items-center justify-center gap-3 shadow-[0_10px_30px_rgba(30,174,238,0.3)] hover:scale-[1.02] transition-all"
          >
            <Download size={24} /> TẢI BẢNG SIZE (PNG)
          </button>
          <p className="text-[10px] text-center text-slate-500 italic">
            Lưu ý: Bảng size tự động cập nhật loại áo bạn đang chọn.
          </p>
        </div>
      )}

      {/* Navigation buttons */}
      <div className="mt-auto pt-8 border-t border-white/10 flex gap-4">
        {currentStep > 1 && (
          <button
            onClick={() => setStep(currentStep - 1)}
            className="flex-1 bg-slate-900 border border-white/10 p-3 rounded-xl hover:bg-slate-800 transition-all text-sm font-bold"
          >
            ← Quay lại
          </button>
        )}
        {currentStep < 4 && (
          <button
            onClick={() => setStep(currentStep + 1)}
            className="flex-1 viettin-gradient p-3 rounded-xl font-bold hover:scale-[1.02] transition-all text-sm"
          >
            Tiếp theo →
          </button>
        )}
      </div>
    </div>
  );
};
export default Sidebar;
