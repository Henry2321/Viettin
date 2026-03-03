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
                            <Rect width={canvasSize.width} height={80 * scale} fill="#1e40af" />
                            <Text 
                                text={quote.title || "MẪU: ÁO POLO KỸ THUẬT"}
                                fontSize={24 * scale}
                                fontStyle="bold"
                                fill="#fbbf24"
                                x={20 * scale}
                                y={25 * scale}
                            />
                            
                            {/* Thông tin sản phẩm */}
                            <Group x={20 * scale} y={100 * scale}>
                                <Text 
                                    text={`• Chất liệu: ${config.fabricType || 'Cá sấu Poly Thái'} | Màu: ${config.color === '#FFFFFF' ? 'Trắng' : config.color === '#000000' ? 'Đen' : 'Màu khác'} | Input: ${config.basePrice?.toLocaleString() || '170,000'}đ`}
                                    fontSize={14 * scale}
                                    fill="white"
                                    width={canvasSize.width - 40 * scale}
                                />
                                <Text 
                                    text={`• SL: ${quote.quantity || '100-300'} | Đơn giá: ${quote.contact || 'Liên hệ'}`}
                                    fontSize={14 * scale}
                                    fill="white"
                                    y={25 * scale}
                                    width={canvasSize.width - 40 * scale}
                                />
                            </Group>
                            
                            {/* Khung liên hệ */}
                            <Group x={20 * scale} y={170 * scale}>
                                <Rect 
                                    width={canvasSize.width - 40 * scale} 
                                    height={60 * scale} 
                                    fill="#1e40af" 
                                    cornerRadius={8}
                                    stroke="#fbbf24"
                                    strokeWidth={2}
                                />
                                <Text 
                                    text="📞 Liên hệ: ___________________"
                                    fontSize={16 * scale}
                                    fill="#fbbf24"
                                    x={15 * scale}
                                    y={20 * scale}
                                    fontStyle="bold"
                                />
                            </Group>
                            
                            {/* Hình ảnh sản phẩm */}
                            {(modelImg && isAiMerged) || shirtImg ? (
                                <Group x={20 * scale} y={260 * scale}>
                                    <Rect 
                                        width={canvasSize.width - 40 * scale} 
                                        height={280 * scale} 
                                        fill="#f1f5f9" 
                                        cornerRadius={10}
                                    />
                                    {modelImg && isAiMerged ? (
                                        <KonvaImage 
                                            image={modelImg} 
                                            x={10 * scale} 
                                            y={10 * scale} 
                                            width={(canvasSize.width - 60 * scale)} 
                                            height={260 * scale}
                                        />
                                    ) : shirtImg && (
                                        <KonvaImage 
                                            image={shirtImg} 
                                            x={10 * scale} 
                                            y={10 * scale} 
                                            width={(canvasSize.width - 60 * scale)} 
                                            height={(shirtImg.height/shirtImg.width) * (canvasSize.width - 60 * scale)} 
                                        />
                                    )}
                                </Group>
                            ) : null}
                        </Group>
                    ) : currentStep === 4 ? (
                        <Group>
                                <Group>
                                    <Rect width={canvasSize.width} height={canvasSize.height} fill="#0f172a" />
                                    
                                    {/* Header Bảng Size */}
                                    <Rect width={canvasSize.width} height={120} fill="#1e293b" />
                                    <Text 
                                        text="BẢNG THÔNG SỐ CHỌN SIZE CHUẨN - VIỆT TÍN"
                                        fontSize={28}
                                        fontStyle="bold"
                                        fill="#1eaeee"
                                        width={canvasSize.width}
                                        align="center"
                                        y={35}
                                    />
                                    <Text 
                                        text={`Loại áo: ${config.shirtType.toUpperCase()} | Ngày tạo: ${new Date().toLocaleDateString('vi-VN')}`}
                                        fontSize={14}
                                        fill="#94a3b8"
                                        width={canvasSize.width}
                                        align="center"
                                        y={75}
                                    />

                                    {/* Bảng Thông Số */}
                                    <Group x={(canvasSize.width - 600)/2} y={160}>
                                        {/* Table Header */}
                                        <Rect width={600} height={50} fill="#1eaeee" cornerRadius={10} />
                                        {['SIZE', 'CÂN NẶNG (KG)', 'CHIỀU CAO (CM)', 'VÒNG NGỰC'].map((h, i) => (
                                            <Text key={i} text={h} x={i*150} width={150} align="center" y={15} fill="white" fontStyle="bold" fontSize={14} />
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
                                            <Group key={rowIndex} y={60 + rowIndex * 60}>
                                                <Rect width={600} height={50} fill={rowIndex % 2 === 0 ? "#1e293b" : "transparent"} stroke="#334155" strokeWidth={1} />
                                                {row.map((cell, cellIndex) => (
                                                    <Text key={cellIndex} text={cell} x={cellIndex*150} width={150} align="center" y={18} fill={cellIndex === 0 ? "#1eaeee" : "white"} fontStyle={cellIndex === 0 ? "bold" : "normal"} fontSize={16} />
                                                ))}
                                            </Group>
                                        ))}
                                    </Group>

                                    {/* Footer Lưu Ý */}
                                    <Group y={canvasSize.height - 120} x={(canvasSize.width - 600)/2}>
                                        <Rect width={600} height={80} fill="#1e293b" cornerRadius={10} stroke="#1eaeee" strokeWidth={1} strokeScaleEnabled={false} dash={[10, 5]} />
                                        <Text 
                                            text="* Lưu ý: Thông số trên chỉ mang tính chất tham khảo. Tùy vào form áo và chất liệu vải sẽ có sự chênh lệch (1-2cm)."
                                            fontSize={12}
                                            fill="#94a3b8"
                                            x={20}
                                            y={25}
                                            width={560}
                                            lineHeight={1.4}
                                            fontStyle="italic"
                                        />
                                    </Group>

                                    {/* Brand Watermark */}
                                    <Text 
                                        text="VIETTIN AI DESIGN SYSTEM"
                                        fontSize={10}
                                        fill="#334155"
                                        opacity={0.5}
                                        x={canvasSize.width - 150}
                                        y={canvasSize.height - 20}
                                    />
                                </Group>
                        </Group>
                    ) : null}
                    )}
                </Layer>
            </Stage>
        </div>
    );
};

export default CanvasArea;
