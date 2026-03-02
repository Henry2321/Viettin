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

    const [canvasSize, setCanvasSize] = useState({ width: 800, height: 1000 });

    useEffect(() => {
        const updateSize = () => {
            const container = document.getElementById('canvas-container');
            if (container) {
                const newWidth = Math.min(container.offsetWidth, 800);
                setCanvasSize({ width: newWidth, height: newWidth * 1.25 }); 
            }
        };
        window.addEventListener('resize', updateSize);
        updateSize();
        return () => window.removeEventListener('resize', updateSize);
    }, []);

    const scale = (canvasSize.width / 800) || 1;

    return (
        <div id="canvas-container" className="w-full flex justify-center items-center">
            <Stage width={canvasSize.width} height={canvasSize.height} ref={stageRef} className="rounded-2xl overflow-hidden shadow-[0_50px_100px_rgba(0,0,0,0.5)] bg-slate-900">
                <Layer>
                    {/* 1. LAYOUT LOGIC */}
                    {currentStep < 5 ? (
                        <Group>
                            <Rect width={canvasSize.width} height={canvasSize.height} fill="#1e293b" />
                            {bgImg && currentStep >= 2 && <KonvaImage image={bgImg} width={canvasSize.width} height={canvasSize.height} />}
                            
                            {modelImg && (
                                <KonvaImage
                                    image={modelImg}
                                    x={(canvasSize.width - 700 * scale) / 2}
                                    y={canvasSize.height - ((modelImg.width > 0 ? (modelImg.height/modelImg.width) : 1) * 700 * scale)}
                                    width={700 * scale}
                                    height={(modelImg.width > 0 ? (modelImg.height/modelImg.width) : 1) * 700 * scale}
                                />
                            )}

                            {/* Áo (Chế độ thiết kế) */}
                            {shirtImg && !isAiMerged && (
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

                            {/* Logo: Hiện độc lập để người dùng dễ căn chỉnh */}
                            {logoImg && !isAiMerged && (
                                <KonvaImage
                                    image={logoImg}
                                    x={(canvasSize.width * logoPos.x) - ((150 * scale * (logoSize || 15)/10) * 0.5)}
                                    y={(canvasSize.height * logoPos.y)}
                                    width={150 * scale * (logoSize || 15)/10}
                                    height={(logoImg.width > 0 ? (logoImg.height / logoImg.width) : 1) * (150 * scale * (logoSize || 15)/10)}
                                    draggable
                                    onDragEnd={(e) => {
                                        const node = e.target;
                                        setLogoPos({ 
                                            x: node.x() / canvasSize.width, 
                                            y: node.y() / canvasSize.height 
                                        });
                                    }}
                                />
                            )}
                        </Group>
                    ) : (
                        // QUOTE VIEW (B5) hoặc SIZE CHART (B6)
                        <>
                            {currentStep === 5 && (
                                <Group>
                                    <Rect width={canvasSize.width} height={canvasSize.height} fill="#0a2351" />
                                    {bgImg && <KonvaImage image={bgImg} width={canvasSize.width} height={canvasSize.height} opacity={0.6} />}
                                    
                                    <Group x={40 * scale} y={40 * scale}>
                                        <Rect width={canvasSize.width - 80 * scale} height={canvasSize.height - 80 * scale} fill="white" cornerRadius={20} shadowBlur={20} shadowOpacity={0.3} />
                                        
                                        {/* Tên loại áo */}
                                        <Text text={quote.title || "MẪU THIẾT KẾ ĐỒNG PHỤC"} fontSize={32} fontStyle="bold" fill="#0a2351" x={40} y={40} />
                                        
                                        {/* Hình ảnh thiết kế chính */}
                                        <Rect x={40} y={100} width={canvasSize.width - 160 * scale} height={canvasSize.height * 0.4} fill="#f1f5f9" cornerRadius={10} />
                                        {shirtImg && (
                                            <KonvaImage 
                                                image={shirtImg} 
                                                x={80} y={120} 
                                                width={canvasSize.width - 240 * scale} 
                                                height={(shirtImg.height/shirtImg.width) * (canvasSize.width - 240 * scale)} 
                                            />
                                        )}
                                        {/* Logo trên áo ở card báo giá */}
                                        {logoImg && shirtImg && (
                                            <KonvaImage
                                                image={logoImg}
                                                x={80 + ((canvasSize.width - 240 * scale) * logoPos.x) - (((canvasSize.width - 240 * scale) * logoSize/100) * 0.5)}
                                                y={120 + ((shirtImg.height/shirtImg.width) * (canvasSize.width - 240 * scale)) * logoPos.y}
                                                width={(canvasSize.width - 240 * scale) * logoSize/100}
                                                height={logoImg.height/logoImg.width * ((canvasSize.width - 240 * scale) * logoSize/100)}
                                            />
                                        )}

                                        {/* Thông tin báo giá */}
                                        <Group x={40} y={canvasSize.height * 0.6}>
                                            <Text text={`Chất liệu: ${config.fabricType || 'Chọn ở B6'}`} fontSize={18} fill="#475569" y={20} />
                                            <Text text={`Số lượng: ${quote.quantity || '...'}`} fontSize={18} fill="#475569" y={50} />
                                            <Text text={`Ghi chú: ${quote.note || '...'}`} fontSize={16} fill="#94a3b8" y={80} width={canvasSize.width - 160} />
                                        </Group>
                                    </Group>
                                </Group>
                            )}

                            {currentStep === 6 && (
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
                            )}
                        </>
                    )}
                </Layer>
            </Stage>
        </div>
    );
};

export default CanvasArea;
