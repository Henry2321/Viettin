import React, { useRef, useEffect, useState } from 'react';
import { Stage, Layer, Image as KonvaImage, Rect, Group, Text } from 'react-konva';
import useDesignStore from '../store/useDesignStore';
import useImage from 'use-image';

const CanvasArea = () => {
    const { 
        currentStep, config, background, shirtCanvas, shirtFit, 
        model, logo, logoPosition, logoSize, quote, isAiMerged,
        logoPos, setLogoPos, suggestionImage, setStageRef
    } = useDesignStore();
    const stageRef = useRef(null);

    useEffect(() => {
        if (stageRef.current) {
            setStageRef(stageRef.current);
        }
    }, [setStageRef]);

    // Sử dụng ảnh trực tiếp từ store (đã được load sẵn ở Sidebar)
    const bgImg = background; 
    const shirtImg = shirtCanvas; 
    const modelImg = model;
    const logoImg = logo;

    const [canvasSize, setCanvasSize] = useState({ width: 800, height: 600 });

    useEffect(() => {
        const updateSize = () => {
            const container = document.getElementById('canvas-container');
            if (container) {
                const containerWidth = container.offsetWidth;
                const maxWidth = Math.min(containerWidth * 0.9, 600); // Giới hạn max 600px
                const height = maxWidth * 0.75; // Tỷ lệ 4:3 thay vì 5:4
                setCanvasSize({ width: maxWidth, height });
            }
        };
        window.addEventListener('resize', updateSize);
        updateSize();
        return () => window.removeEventListener('resize', updateSize);
    }, []);

    const scale = (canvasSize.width / 600) || 1;

    return (
        <div id="canvas-container" className="w-full flex justify-center items-center">
            <Stage width={canvasSize.width} height={canvasSize.height} ref={stageRef} className="rounded-2xl overflow-hidden shadow-[0_50px_100px_rgba(0,0,0,0.5)] bg-slate-900">
                <Layer>
                    {/* 1. LAYOUT LOGIC */}
                    {currentStep < 3 ? (
                        <Group>
                            <Rect width={canvasSize.width} height={canvasSize.height} fill="#1e293b" />
                            
                            {/* Hiển thị ảnh kết quả AI Try-On */}
                            {modelImg && (
                                <KonvaImage
                                    image={modelImg}
                                    x={(canvasSize.width - 400 * scale) / 2}
                                    y={canvasSize.height * 0.1}
                                    width={400 * scale}
                                    height={(modelImg.width > 0 ? (modelImg.height/modelImg.width) : 1) * 400 * scale}
                                />
                            )}

                            {/* Hiển thị áo thiết kế khi chưa có AI */}
                            {shirtImg && !modelImg && (
                                <Group
                                    x={(canvasSize.width - (650 * shirtFit.scale * scale)) / 2 + shirtFit.x * scale}
                                    y={(canvasSize.height * 0.25) + shirtFit.y * scale}
                                >
                                    <KonvaImage
                                        image={shirtImg}
                                        width={650 * shirtFit.scale * scale}
                                        height={(shirtImg.width > 0 ? (shirtImg.height/shirtImg.width) : 1) * 650 * shirtFit.scale * scale}
                                        shadowBlur={15}
                                        shadowColor="black"
                                        shadowOpacity={0.2}
                                    />
                                </Group>
                            )}
                        </Group>
                    ) : currentStep === 3 ? (
                        // QUOTE VIEW - Khung báo giá cho khách hàng
                        <Group>
                            <Rect width={canvasSize.width} height={canvasSize.height} fill="#0a2351" />
                            
                            {/* Header */}
                            <Rect width={canvasSize.width} height={60 * scale} fill="#1e40af" />
                            <Text 
                                text={quote.title || "MẪU: ÁO POLO KỸ THUẬT"}
                                fontSize={20 * scale}
                                fontStyle="bold"
                                fill="#fbbf24"
                                x={20 * scale}
                                y={20 * scale}
                            />
                            
                            {/* Hình ảnh sản phẩm - ĐẶT TRÊN CÙNG */}
                            {(modelImg && isAiMerged) || shirtImg ? (
                                <Group x={20 * scale} y={80 * scale}>
                                    <Rect 
                                        width={canvasSize.width - 40 * scale} 
                                        height={300 * scale} 
                                        fill="#f1f5f9" 
                                        cornerRadius={10}
                                    />
                                    {modelImg && isAiMerged ? (
                                        <KonvaImage 
                                            image={modelImg} 
                                            x={10 * scale}
                                            y={10 * scale}
                                            width={canvasSize.width - 60 * scale}
                                            height={280 * scale}
                                        />
                                    ) : shirtImg && (
                                        <KonvaImage 
                                            image={shirtImg} 
                                            x={((canvasSize.width - 40 * scale) - Math.min(280 * scale, (shirtImg.width/shirtImg.height) * 280 * scale)) / 2}
                                            y={10 * scale}
                                            width={Math.min(280 * scale, (shirtImg.width/shirtImg.height) * 280 * scale)}
                                            height={Math.min(280 * scale, (shirtImg.height/shirtImg.width) * 280 * scale)}
                                        />
                                    )}
                                </Group>
                            ) : null}
                            
                            {/* Thông tin sản phẩm - ĐẶT DƯỚI */}
                            <Group x={20 * scale} y={400 * scale}>
                                <Text 
                                    text={`• Chất liệu: ${config.fabricType || 'Cá sấu Poly Thái'} | Màu: ${config.color === '#FFFFFF' ? 'Trắng' : config.color === '#000000' ? 'Đen' : 'Màu khác'} | Input: ${config.basePrice?.toLocaleString() || '170,000'}đ`}
                                    fontSize={12 * scale}
                                    fill="white"
                                    width={canvasSize.width - 40 * scale}
                                />
                                <Text 
                                    text={`• SL: ${quote.quantity || '100-300'} | Đơn giá: ${quote.contact || 'Liên hệ'}`}
                                    fontSize={12 * scale}
                                    fill="white"
                                    y={20 * scale}
                                    width={canvasSize.width - 40 * scale}
                                />
                            </Group>
                            
                            {/* Khung liên hệ */}
                            <Group x={20 * scale} y={460 * scale}>
                                <Rect 
                                    width={canvasSize.width - 40 * scale} 
                                    height={50 * scale} 
                                    fill="#1e40af" 
                                    cornerRadius={8}
                                    stroke="#fbbf24"
                                    strokeWidth={2}
                                />
                                <Text 
                                    text="📞 Liên hệ: ___________________"
                                    fontSize={14 * scale}
                                    fill="#fbbf24"
                                    x={15 * scale}
                                    y={18 * scale}
                                    fontStyle="bold"
                                />
                            </Group>
                        </Group>
                    ) : currentStep === 4 ? (
                        <Group>
                            <Rect width={canvasSize.width} height={canvasSize.height} fill="#0f172a" />
                            
                            {/* Header Bảng Size */}
                            <Rect width={canvasSize.width} height={100 * scale} fill="#1e293b" />
                            <Text 
                                text="BẢNG THÔNG SỐ CHỌN SIZE CHUẨN - VIỆT TÍN"
                                fontSize={22 * scale}
                                fontStyle="bold"
                                fill="#1eaeee"
                                width={canvasSize.width}
                                align="center"
                                y={25 * scale}
                            />
                            <Text 
                                text={`Loại áo: ${config.shirtType.toUpperCase()} | Ngày tạo: ${new Date().toLocaleDateString('vi-VN')}`}
                                fontSize={12 * scale}
                                fill="#94a3b8"
                                width={canvasSize.width}
                                align="center"
                                y={60 * scale}
                            />

                            {/* Bảng Thông Số */}
                            <Group x={(canvasSize.width - 560 * scale)/2} y={120 * scale}>
                                {/* Table Header */}
                                <Rect width={560 * scale} height={45 * scale} fill="#1eaeee" cornerRadius={8} />
                                {['SIZE', 'CÂN NẶNG (KG)', 'CHIỀU CAO (CM)', 'VÒNG NGỰC (CM)'].map((h, i) => (
                                    <Text key={i} text={h} x={i*140*scale} width={140*scale} align="center" y={15*scale} fill="white" fontStyle="bold" fontSize={11*scale} />
                                ))}

                                {/* Table Rows */}
                                {[
                                    ['S', '45 - 53', '150 - 158', '84 - 88'],
                                    ['M', '53 - 60', '158 - 165', '88 - 92'],
                                    ['L', '60 - 68', '165 - 172', '92 - 96'],
                                    ['XL', '68 - 75', '170 - 178', '96 - 100'],
                                    ['2XL', '75 - 83', '175 - 183', '100 - 104'],
                                    ['3XL', '83 - 95', '180 - 190', '104 - 110'],
                                ].map((row, rowIndex) => (
                                    <Group key={rowIndex} y={(50 + rowIndex * 45) * scale}>
                                        <Rect width={560*scale} height={45*scale} fill={rowIndex % 2 === 0 ? "#1e293b" : "#334155"} stroke="#475569" strokeWidth={1} />
                                        {row.map((cell, cellIndex) => (
                                            <Text key={cellIndex} text={cell} x={cellIndex*140*scale} width={140*scale} align="center" y={15*scale} fill={cellIndex === 0 ? "#1eaeee" : "white"} fontStyle={cellIndex === 0 ? "bold" : "normal"} fontSize={13*scale} />
                                        ))}
                                    </Group>
                                ))}
                            </Group>

                            {/* Footer Lưu Ý */}
                            <Group y={(canvasSize.height - 100) * scale} x={20 * scale}>
                                <Rect width={(canvasSize.width - 40) * scale} height={70 * scale} fill="#1e293b" cornerRadius={8} stroke="#1eaeee" strokeWidth={1} strokeScaleEnabled={false} dash={[8, 4]} />
                                <Text 
                                    text="💡 Lưu ý: Thông số trên chỉ mang tính chất tham khảo. Tùy vào form áo và chất liệu vải sẽ có sự chênh lệch (1-2cm)."
                                    fontSize={10 * scale}
                                    fill="#94a3b8"
                                    x={15 * scale}
                                    y={20 * scale}
                                    width={(canvasSize.width - 70) * scale}
                                    lineHeight={1.4}
                                    fontStyle="italic"
                                />
                            </Group>

                            {/* Brand Watermark */}
                            <Text 
                                text="VIETTIN AI DESIGN SYSTEM"
                                fontSize={8 * scale}
                                fill="#475569"
                                opacity={0.6}
                                x={(canvasSize.width - 120) * scale}
                                y={(canvasSize.height - 15) * scale}
                            />
                        </Group>
                    ) : null}
                </Layer>
            </Stage>
        </div>
    );
};

export default CanvasArea;
