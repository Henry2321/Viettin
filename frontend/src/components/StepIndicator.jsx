import React from 'react';
import useDesignStore from '../store/useDesignStore';

const steps = [
    { n: 1, label: 'Cấu hình' },
    { n: 2, label: 'Background' },
    { n: 3, label: 'Thiết kế' },
    { n: 4, label: 'Thử đồ AI' },
    { n: 5, label: 'Báo giá' },
    { n: 6, label: 'Bảng size' },
];

const StepIndicator = () => {
    const { currentStep, setStep } = useDesignStore();

    return (
        <div className="glass-card p-6 mb-8 w-full max-w-5xl mx-auto shadow-2xl relative">
            <div className="flex justify-between relative">
                {/* Connector line */}
                <div className="absolute top-4 left-0 w-full h-0.5 bg-white/10 -z-0" />
                
                {steps.map((step) => (
                    <button
                        key={step.n}
                        onClick={() => setStep(step.n)}
                        className="relative z-10 flex flex-col items-center group w-1/6 transition-all hover:scale-105"
                    >
                        <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm border-2 transition-all
                            ${currentStep === step.n 
                                ? 'bg-viettin-accent border-viettin-accent shadow-[0_0_20px_#38bdf8] text-white' 
                                : currentStep > step.n 
                                    ? 'bg-viettin-purple border-viettin-purple text-white' 
                                    : 'bg-[#0f172a] border-white/10 text-slate-500'}`}
                        >
                            {step.n}
                        </div>
                        <span className={`mt-2 text-[10px] uppercase tracking-wider font-semibold transition-colors
                            ${currentStep === step.n ? 'text-viettin-accent' : 'text-slate-500'}`}
                        >
                            {step.label}
                        </span>
                    </button>
                ))}
            </div>
        </div>
    );
};

export default StepIndicator;
