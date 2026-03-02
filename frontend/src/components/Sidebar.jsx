import React from 'react';
import useDesignStore from '../store/useDesignStore';
import { Palette, Layers, User, Zap, Image as ImageIcon, Download } from 'lucide-react';
import axios from 'axios';

// Import local backgrounds
import bgVanPhong from '../picture/vanphong.jpg';
import bgXuong from '../picture/xuong.jpg';
import bgStudio from '../picture/studio.jpg';
import bgShowroom from '../picture/showroom.jpg';

const Sidebar = () => {
    const API_BASE = 'http://localhost:8001';
    const { 
        currentStep, setStep, config, setConfig, isGenerating, 
        setGenerating, setShirtCanvas, setModel, setBackground, backgroundType,
        logoPosition, logoSize, shirtFit, setFit, quote, setQuote,
        logo, setLogo, setAiMerged, suggestionImage, setSuggestionImage, stageRef
    } = useDesignStore();

    const [adviceTitle, setAdviceTitle] = React.useState("");

    const generateShirtAI = async () => {
        setGenerating(true);
        setSuggestionImage(null);
        try {
            const formData = new FormData();
            formData.append('shirt_type', config.shirtType);
            formData.append('color', config.color);
            formData.append('background_type', backgroundType);
            
            const response = await axios.post(`${API_BASE}/generate-shirt`, formData);
            
            if (response.data.image_url) {
                const fullImageUrl = response.data.image_url.startsWith('http') || response.data.image_url.startsWith('data:') 
                                     ? response.data.image_url 
                                     : `${API_BASE}/` + response.data.image_url;

                const img = new Image();
                img.crossOrigin = 'anonymous';
                img.onload = () => {
                    setShirtCanvas(img);
                    if (response.data.suggestion_image) {
                        // Xây dựng đường dẫn đầy đủ cho ảnh gợi ý (suggestion_image)
                        const sugImg = response.data.suggestion_image;
                        const fullSugUrl = sugImg.startsWith('http') || sugImg.startsWith('data:')
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
            formData.append('gender', gender);
            const res = await axios.post(`${API_BASE}/generate-model`, formData);
            if (res.data.image_url) {
                const img = new Image();
                img.crossOrigin = 'anonymous';
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

    const handleFileUpload = (e, callback) => {
        const file = e.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = (event) => {
                const img = new Image();
                img.crossOrigin = 'anonymous';
                img.onload = () => {
                    callback(img);
                };
                img.src = event.target.result;
            };
            reader.readAsDataURL(file);
        }
    };

    const setPresetBackground = (source) => {
        const bgMap = {
            office: bgVanPhong,
            workshop: bgXuong,
            studio: bgStudio,
            showroom: bgShowroom
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
                            <label className="text-[10px] text-slate-500 uppercase font-bold ml-1">Loại áo</label>
                            <select className="bg-slate-900 border border-white/10 rounded-xl p-2 text-xs text-white outline-none"
                                value={config.shirtType} onChange={(e) => setConfig({ shirtType: e.target.value })}>
                                <option value="polo">Áo Polo</option><option value="tshirt">Áo Thun</option>
                                <option value="hoodie">Áo Hoodie</option><option value="jacket">Áo Khoác</option>
                            </select>
                        </div>
                        <div className="flex flex-col gap-1">
                            <label className="text-[10px] text-slate-500 uppercase font-bold ml-1">Chất liệu</label>
                            <select className="bg-slate-900 border border-white/10 rounded-xl p-2 text-xs text-white outline-none"
                                value={config.fabricType} onChange={(e) => setConfig({ fabricType: e.target.value })}>
                                <option value="Cá sấu Poly">Cá sấu Poly</option><option value="Cotton 100%">Cotton 100%</option>
                                <option value="Mè kim">Vải Mè kim</option><option value="Thun lạnh">Thun lạnh</option>
                            </select>
                        </div>
                    </div>
                    <div className="flex flex-col gap-2">
                        <label className="text-[10px] text-slate-500 uppercase font-bold ml-1">Giá & Màu</label>
                        <div className="flex items-center gap-4">
                            <input type="number" step="10000" className="bg-slate-900 border border-white/10 rounded-xl p-2 text-sm font-bold text-white outline-none w-2/3"
                                value={config.basePrice} onChange={(e) => setConfig({ basePrice: parseInt(e.target.value) || 0 })} />
                            <div className="flex gap-1">
                                {['#FFFFFF', '#000000', '#0a2351', '#FF0000', '#FFA500'].map(c => (
                                    <button key={c} onClick={() => setConfig({ color: c })}
                                        className={`w-5 h-5 rounded-full border border-white/20 ${config.color === c ? 'ring-2 ring-viettin-accent' : ''}`}
                                        style={{ backgroundColor: c }} />
                                ))}
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* B2: Chọn Background */}
            {currentStep === 2 && (
                <div className="flex flex-col gap-6 animate-fadeIn">
                    <h2 className="text-2xl font-bold text-viettin-accent flex items-center gap-2">
                        <ImageIcon size={24} /> B2: Chọn Background
                    </h2>
                    <div className="grid grid-cols-2 gap-3">
                        {[
                            { id: 'office', url: bgVanPhong, name: 'Văn phòng' },
                            { id: 'workshop', url: bgXuong, name: 'Xưởng' },
                            { id: 'studio', url: bgStudio, name: 'Studio' },
                            { id: 'showroom', url: bgShowroom, name: 'Showroom' }
                        ].map(bg => (
                            <button key={bg.id} onClick={() => setPresetBackground(bg.id)}
                                className={`h-24 overflow-hidden rounded-xl border-2 transition-all relative ${backgroundType === bg.id ? 'border-viettin-accent' : 'border-white/10'}`}>
                                <img src={bg.url} className="w-full h-full object-cover" />
                                <span className="absolute bottom-1 left-1 text-[8px] bg-black/70 px-2 py-1 rounded">{bg.name}</span>
                            </button>
                        ))}
                    </div>
                </div>
            )}

            {/* B3: Canvas (Áo) */}
            {currentStep === 3 && (
                <div className="flex flex-col gap-6 animate-fadeIn">
                    <h2 className="text-2xl font-bold text-viettin-accent flex items-center gap-2">
                        <Layers size={24} /> B3: Canvas (Áo)
                    </h2>
                    
                    {/* Nút tải ảnh áo lên */}
                    <div className="p-4 bg-slate-900/40 rounded-xl border border-white/5">
                        <label className="text-xs text-slate-400 uppercase font-bold mb-2 block">Upload Ảnh Áo (PNG/JPG)</label>
                        <input 
                            type="file" 
                            accept="image/png,image/jpeg,image/jpg"
                            onChange={(e) => handleFileUpload(e, setShirtCanvas)} 
                            className="text-xs text-slate-400 file:mr-4 file:py-2 file:px-4 file:rounded-xl file:border-0 file:bg-slate-800 file:text-white hover:file:bg-slate-700" 
                        />
                        <p className="text-[10px] text-slate-500 mt-2">✅ Khuyến khích: Upload ảnh áo thật màu {config.color === '#FFA500' ? 'cam' : config.color === '#FF0000' ? 'đỏ' : config.color === '#0a2351' ? 'xanh navy' : config.color === '#000000' ? 'đen' : 'trắng'} để chính xác 100%</p>
                    </div>

                    <button onClick={generateShirtAI} disabled={isGenerating}
                        className="viettin-gradient p-4 rounded-xl text-sm font-bold flex items-center justify-center gap-2 transition-all disabled:opacity-50 disabled:cursor-not-allowed">
                        {isGenerating ? (
                            <>
                                <Zap size={16} className="animate-spin" />
                                Đang tạo...
                            </>
                        ) : (
                            <>
                                <Zap size={16} />
                                Tạo Form Áo Bằng AI
                            </>
                        )}
                    </button>

                    {/* AI Preview Image - LUÔN DƯỚI NÚT TẠO FORM */}
                    {suggestionImage && (
                        <div className="flex flex-col gap-3 animate-fadeIn mt-2">
                             <div className="flex items-center justify-between">
                                <h4 className="text-[10px] text-viettin-accent uppercase font-black flex items-center gap-2">
                                    <Zap size={12} fill="currentColor" /> AI SUGGESTION: {adviceTitle}
                                </h4>
                                <span className="text-[8px] bg-slate-800 text-slate-500 px-2 py-0.5 rounded-full">AI IMAGING</span>
                             </div>
                             
                             <div className="group relative rounded-2xl overflow-hidden border border-white/10 shadow-lg bg-slate-900 aspect-video">
                                 <img src={suggestionImage} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110" alt="AI Suggestion" />
                                 <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex items-end p-4">
                                     <p className="text-[10px] text-white/80 font-medium italic">Gợi ý cách mặc áo trong bối cảnh thực tế.</p>
                                 </div>
                             </div>
                        </div>
                    )}

                    {/* Cảnh báo AI (Đặt dưới cùng của nhóm thiết kế số 1) */}
                    <p className="text-[10px] text-slate-400 text-center">⚠️ AI có thể tạo màu không chính xác. Nên upload ảnh áo thật ở trên.</p>

                    {/* GỘP LOGO VÀO BƯỚC 3 */}
                    <div className="pt-4 border-t border-white/10 space-y-4">
                        <div className="p-4 bg-slate-900/40 rounded-xl border border-white/5">
                            <label className="text-xs text-slate-400 uppercase font-bold mb-2 block flex items-center gap-2">
                                <Zap size={14} className="text-viettin-accent" /> Upload Logo (Chỉnh ngay trên áo)
                            </label>
                            <input type="file" onChange={(e) => handleFileUpload(e, setLogo)} 
                                className="text-xs text-slate-400 file:mr-4 file:py-2 file:px-4 file:rounded-xl file:border-0 file:bg-slate-800 file:text-white hover:file:bg-slate-700 w-full" />
                        </div>
                        
                        {logo && (
                            <div className="p-4 bg-slate-900/40 rounded-xl border border-white/5 animate-fadeIn">
                                <label className="text-xs text-slate-400 uppercase font-bold mb-2 block">Cỡ Logo: {logoSize}%</label>
                                <input type="range" min="5" max="40" value={logoSize} 
                                    onChange={(e) => useDesignStore.setState({ logoSize: parseInt(e.target.value) })} 
                                    className="w-full h-2 bg-slate-800 rounded-lg accent-viettin-accent" />
                                <p className="text-[8px] text-slate-500 mt-2 italic">* Bạn có thể kéo thả logo trực tiếp trên màn hình bên trái</p>
                            </div>
                        )}
                    </div>
                </div>
            )}

            {/* B4: Model (Người mẫu) */}
            {currentStep === 4 && (
                <div className="flex flex-col gap-6 animate-fadeIn">
                    <h2 className="text-2xl font-bold text-viettin-accent flex items-center gap-2">
                        <User size={24} /> B4: Chọn hoặc Up ảnh người mẫu
                    </h2>
                    
                    {/* Tải ảnh người mẫu lên */}
                    <div className="p-4 bg-slate-900/40 rounded-xl border border-white/5">
                        <label className="text-xs text-slate-400 uppercase font-bold mb-2 block">Upload Ảnh Của Bạn (Tự Thử Đồ)</label>
                        <input 
                            type="file" 
                            accept="image/*"
                            onChange={(e) => handleFileUpload(e, (img) => {
                                setModel(img);
                                setConfig({ selectedGender: 'custom' });
                            })} 
                            className="text-xs text-slate-400 file:mr-4 file:py-2 file:px-4 file:rounded-xl file:border-0 file:bg-slate-800 file:text-white hover:file:bg-slate-700 w-full" 
                        />
                        <p className="text-[10px] text-slate-500 mt-2">✅ AI sẽ tự động phân tích và ghép áo vào ảnh bạn upload.</p>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <button 
                            onClick={async () => {
                                setConfig({ selectedGender: 'male' });
                                await generateModelAI('male');
                            }}
                            disabled={isGenerating}
                            className={`p-4 rounded-xl text-xs font-bold flex flex-col items-center justify-center gap-2 transition-all border-2 ${
                                config.selectedGender === 'male' 
                                ? 'border-viettin-accent bg-viettin-accent/10' 
                                : 'border-white/5 bg-slate-800 hover:bg-slate-700'
                            } disabled:opacity-50`}>
                            🤵 Nam
                        </button>
                        <button 
                            onClick={async () => {
                                setConfig({ selectedGender: 'female' });
                                await generateModelAI('female');
                            }}
                            disabled={isGenerating}
                            className={`p-4 rounded-xl text-xs font-bold flex flex-col items-center justify-center gap-2 transition-all border-2 ${
                                config.selectedGender === 'female' 
                                ? 'border-viettin-accent bg-viettin-accent/10' 
                                : 'border-white/5 bg-slate-800 hover:bg-slate-700'
                            } disabled:opacity-50`}>
                            👰 Nữ
                        </button>
                    </div>

                    {/* Nút AI Try On */}
                    <button 
                        onClick={async () => {
                            if (!useDesignStore.getState().model) {
                                alert("Vui lòng chọn hoặc upload ảnh người mẫu trước!");
                                return;
                            }
                            setGenerating(true);
                            try {
                                const formData = new FormData();
                                // Chuyển model image sang base64 nếu cần, hoặc dùng URL
                                formData.append('person_image', useDesignStore.getState().model.src);
                                formData.append('shirt_type', config.shirtType);
                                formData.append('color', config.color);
                                
                                const res = await axios.post(`${API_BASE}/virtual-try-on`, formData);
                                if (res.data.image_url) {
                                    const img = new Image();
                                    img.crossOrigin = 'anonymous';
                                    img.onload = () => {
                                        setModel(img);
                                        if (res.data.mode === "AI Reimagined") {
                                            setAiMerged(true);
                                            alert("AI đã 'tái thiết lập' lại ảnh người mẫu mặc áo!");
                                        } else {
                                            setAiMerged(false);
                                        }
                                    };
                                    img.src = res.data.image_url;
                                }
                            } catch (e) {
                                console.error(e);
                                alert("Lỗi khi thử đồ AI.");
                            } finally {
                                setGenerating(false);
                            }
                        }}
                        disabled={isGenerating}
                        className="viettin-gradient p-4 rounded-xl text-sm font-bold flex items-center justify-center gap-2 shadow-lg hover:scale-105 transition-all"
                    >
                        <Zap size={18} /> {isGenerating ? "AI Đang xử lý..." : "AI TRY-ON (Thử Đồ Thông Minh)"}
                    </button>
                </div>
            )}

            {/* B5: Báo giá (Chuyển từ B6 sang) */}
            {currentStep === 5 && (
                <div className="flex flex-col gap-4 animate-fadeIn">
                    <h2 className="text-2xl font-bold text-viettin-accent flex items-center gap-2">
                        <Layers size={24} /> B5: Báo giá – Xuất Card
                    </h2>
                    <p className="text-xs text-slate-400 italic mb-2">Thông tin này sẽ hiển thị trực tiếp trên Card bên trái</p>
                    
                    <div className="flex flex-col gap-3">
                        <div className="flex flex-col gap-1">
                            <label className="text-[10px] text-slate-400 uppercase font-bold">Tên loại áo</label>
                            <input type="text" placeholder="VD: ÁO POLO KỸ THUẬT" className="bg-slate-900 p-3 rounded-xl border border-white/5 focus:border-viettin-accent outline-none"
                                value={quote.title} onChange={(e) => setQuote({ title: e.target.value })} />
                        </div>
                        
                        <div className="flex flex-col gap-1">
                            <label className="text-[10px] text-slate-400 uppercase font-bold">Chất liệu vải</label>
                            <input type="text" placeholder="VD: Cá sấu Poly Thái" className="bg-slate-900 p-3 rounded-xl border border-white/5 outline-none"
                                value={config.fabricType} onChange={(e) => setConfig({ fabricType: e.target.value })} />
                        </div>

                        <div className="grid grid-cols-2 gap-3">
                            <div className="flex flex-col gap-1">
                                <label className="text-[10px] text-slate-400 uppercase font-bold">Số lượng</label>
                                <input type="text" placeholder="100-300" className="bg-slate-900 p-3 rounded-xl border border-white/5 outline-none"
                                    value={quote.quantity} onChange={(e) => setQuote({ quantity: e.target.value })} />
                            </div>
                            <div className="flex flex-col gap-1">
                                <label className="text-[10px] text-slate-400 uppercase font-bold">Liên hệ</label>
                                <input type="text" placeholder="Mr. Bình" className="bg-slate-900 p-3 rounded-xl border border-white/5 outline-none"
                                    value={quote.contact} onChange={(e) => setQuote({ contact: e.target.value })} />
                            </div>
                        </div>

                        <div className="flex flex-col gap-1">
                            <label className="text-[10px] text-slate-400 uppercase font-bold">Thông tin nhanh (Size/Note)</label>
                            <textarea placeholder="VD: Size S-3XL, In decal cao cấp" className="bg-slate-900 p-3 rounded-xl border border-white/5 outline-none h-20"
                                value={quote.note} onChange={(e) => setQuote({ note: e.target.value })} />
                        </div>
                    </div>

                    <button 
                        onClick={() => {
                            if (stageRef) {
                                const link = document.createElement('a');
                                link.download = `ViettinAI_BaoGia_${Date.now()}.png`;
                                link.href = stageRef.toDataURL({ pixelRatio: 2 });
                                link.click();
                            } else {
                                alert("Đang chuẩn bị khung hình, vui lòng thử lại sau giây lát.");
                            }
                        }}
                        className="mt-4 viettin-gradient p-5 rounded-2xl font-black text-lg flex items-center justify-center gap-3 shadow-[0_10px_30px_rgba(30,174,238,0.3)] hover:scale-[1.02] transition-all"
                    >
                        <Download size={24} /> XUẤT CARD (PNG/JPG)
                    </button>
                    <p className="text-[10px] text-center text-slate-500">Sau khi tải về, bạn có thể gửi trực tiếp qua Zalo cho khách hàng.</p>
                </div>
            )}

            {/* B6: Bảng Size (Chuyển từ B7 sang) */}
            {currentStep === 6 && (
                <div className="flex flex-col gap-6 animate-fadeIn">
                    <h2 className="text-2xl font-bold text-viettin-accent flex items-center gap-2">
                        <Layers size={24} /> B6: Bảng Size Chuẩn
                    </h2>
                    <div className="p-4 bg-slate-900/40 rounded-xl border border-white/5 space-y-4">
                        <p className="text-sm text-slate-300 leading-relaxed">
                            Bảng thông số size được thiết kế dựa trên form áo chuẩn của Việt Tín. Bạn có thể tải bảng này về để gửi kèm với mẫu thiết kế cho nhân viên hoặc khách hàng.
                        </p>
                    </div>

                    <button 
                        onClick={() => {
                            if (stageRef) {
                                const link = document.createElement('a');
                                link.download = `ViettinAI_BangSize_${config.shirtType}_${Date.now()}.png`;
                                link.href = stageRef.toDataURL({ pixelRatio: 2 });
                                link.click();
                            } else {
                                alert("Đang chuẩn bị khung hình, vui lòng thử lại sau giây lát.");
                            }
                        }}
                        className="viettin-gradient p-5 rounded-2xl font-black text-lg flex items-center justify-center gap-3 shadow-[0_10px_30px_rgba(30,174,238,0.3)] hover:scale-[1.02] transition-all"
                    >
                        <Download size={24} /> TẢI BẢNG SIZE (PNG)
                    </button>
                    <p className="text-[10px] text-center text-slate-500 italic">Lưu ý: Bảng size tự động cập nhật loại áo bạn đang chọn.</p>
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
                {currentStep < 6 && (
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
