import React from 'react';
import StepIndicator from './components/StepIndicator';
import CanvasArea from './components/CanvasArea';
import Sidebar from './components/Sidebar';

const App = () => {
    return (
        <div className="min-h-screen relative p-4 lg:p-12 overflow-hidden flex flex-col items-center">
            {/* Background effects */}
            <div className="fixed inset-0 pointer-events-none -z-10">
                <div className="absolute top-0 left-0 w-1/2 h-1/2 bg-viettin-accent/10 blur-[150px] opacity-20 rounded-full" />
                <div className="absolute bottom-0 right-0 w-1/2 h-1/2 bg-viettin-purple/10 blur-[150px] opacity-20 rounded-full" />
                <div className="absolute inset-0 bg-viettin-dark/80" />
            </div>

            {/* Header */}
            <header className="mb-8 text-center animate-fadeIn group">
                <h1 className="text-4xl lg:text-6xl font-black bg-gradient-to-r from-viettin-accent to-viettin-purple bg-clip-text text-transparent mb-2 tracking-tighter transition-all group-hover:scale-105">
                    VIETTIN.AI
                </h1>
                <p className="text-slate-500 font-medium tracking-[0.2em] uppercase text-xs">Hệ thống đề xuất áo thông minh</p>
            </header>

            <StepIndicator />

            <main className="w-full max-w-7xl grid grid-cols-1 lg:grid-cols-[1fr_400px] gap-8 animate-fadeIn delay-200">
                {/* Visual Area */}
                <div className="relative group">
                    <CanvasArea />
                    {/* Shadow effect */}
                    <div className="absolute -bottom-8 left-1/2 -translate-x-1/2 w-4/5 h-8 bg-black/40 blur-2xl -z-10" />
                </div>

                {/* Controls Area */}
                <aside className="sticky top-12 h-fit">
                    <Sidebar />
                </aside>
            </main>

            <footer className="mt-16 text-slate-600 text-xs font-medium tracking-widest uppercase">
                Designed for Excellence • &copy; 2024 Viettin
            </footer>
        </div>
    );
};

export default App;
