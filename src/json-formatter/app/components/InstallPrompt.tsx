"use client";

import { useEffect, useState } from "react";
import { Download, X, Check, Smartphone } from "lucide-react";

interface BeforeInstallPromptEvent extends Event {
    prompt: () => Promise<void>;
    userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
}

const POSTPONE_KEY = "pwa-install-postponed-until";

export default function InstallPrompt() {
    const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
    const [showPrompt, setShowPrompt] = useState(false);
    const [isClosing, setIsClosing] = useState(false);

    useEffect(() => {
        const postponedUntil = localStorage.getItem(POSTPONE_KEY);
        if (postponedUntil) {
            const postponeDate = new Date(postponedUntil);
            if (new Date() < postponeDate) {
                return;
            } else {
                localStorage.removeItem(POSTPONE_KEY);
            }
        }

        const handleBeforeInstallPrompt = (e: Event) => {
            e.preventDefault();
            setDeferredPrompt(e as BeforeInstallPromptEvent);
            setShowPrompt(true);
        };

        window.addEventListener("beforeinstallprompt", handleBeforeInstallPrompt);

        // Force show in development for testing UI
        if (process.env.NODE_ENV === "development") {
            setTimeout(() => setShowPrompt(true), 1000);
        }

        return () => {
            window.removeEventListener("beforeinstallprompt", handleBeforeInstallPrompt);
        };
    }, []);

    const handleInstall = async () => {
        if (!deferredPrompt) {
            if (process.env.NODE_ENV === "development") {
                alert("In production, this button triggers the native install dialog.");
                closePrompt();
            }
            return;
        }
        await deferredPrompt.prompt();
        const { outcome } = await deferredPrompt.userChoice;
        if (outcome === "accepted") {
            closePrompt();
        }
        setDeferredPrompt(null);
    };

    const handlePostpone = () => {
        closePrompt();
        setTimeout(() => {
            const tomorrow = new Date();
            tomorrow.setDate(tomorrow.getDate() + 1);
            localStorage.setItem(POSTPONE_KEY, tomorrow.toISOString());
        }, 300);
    };

    const closePrompt = () => {
        setIsClosing(true);
        setTimeout(() => setShowPrompt(false), 300);
    };

    if (!showPrompt) return null;

    return (
        <div
            className={`fixed bottom-6 left-6 z-50 w-full max-w-[340px] transform transition-all duration-300 ease-out ${isClosing ? 'opacity-0 translate-y-4 scale-95' : 'opacity-100 translate-y-0 scale-100 animate-in slide-in-from-left-4 fade-in'
                }`}
        >
            <div className="relative bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-2xl overflow-hidden flex flex-col">

                {/* Header Background */}
                <div
                    className="h-24 w-full relative"
                    style={{ backgroundColor: "var(--accent)" }}
                >
                    {/* Close Button */}
                    <button
                        onClick={handlePostpone}
                        className="absolute top-3 right-3 p-1 text-white/80 hover:text-white hover:bg-white/20 rounded-lg transition-colors"
                    >
                        <X size={20} />
                    </button>
                </div>

                {/* Content Section */}
                <div className="px-6 pb-6 pt-0 relative flex flex-col items-center text-center">

                    {/* Overlapping Icon */}
                    <div
                        className="w-20 h-20 -mt-10 mb-4 bg-white dark:bg-slate-900 rounded-2xl p-1 shadow-lg"
                    >
                        <div
                            className="w-full h-full rounded-xl flex items-center justify-center font-mono text-3xl font-bold"
                            style={{
                                backgroundColor: "var(--accent)",
                                color: "white"
                            }}
                        >
                            {/* Using text logo instead of generic icon for brand feel */}
                            {"{ }"}
                        </div>
                    </div>

                    <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-2">
                        Install JSON Formatter
                    </h3>

                    <p className="text-sm text-slate-500 dark:text-slate-400 mb-6 leading-relaxed">
                        Install the app on your home screen for a better experience and exclusive features!
                    </p>

                    <div className="w-full space-y-3 mb-8 text-left pl-2">
                        <div className="flex items-center gap-3 text-sm text-slate-600 dark:text-slate-300">
                            <div className="flex-shrink-0 w-5 h-5 rounded-full flex items-center justify-center text-white" style={{ backgroundColor: "var(--accent)" }}>
                                <Check size={12} strokeWidth={3} />
                            </div>
                            <span>Faster access</span>
                        </div>
                        <div className="flex items-center gap-3 text-sm text-slate-600 dark:text-slate-300">
                            <div className="flex-shrink-0 w-5 h-5 rounded-full flex items-center justify-center text-white" style={{ backgroundColor: "var(--accent)" }}>
                                <Check size={12} strokeWidth={3} />
                            </div>
                            <span>Work offline</span>
                        </div>
                        <div className="flex items-center gap-3 text-sm text-slate-600 dark:text-slate-300">
                            <div className="flex-shrink-0 w-5 h-5 rounded-full flex items-center justify-center text-white" style={{ backgroundColor: "var(--accent)" }}>
                                <Check size={12} strokeWidth={3} />
                            </div>
                            <span>Immersive full-screen</span>
                        </div>
                    </div>

                    <div className="flex items-center gap-3 w-full">
                        <button
                            onClick={handlePostpone}
                            className="flex-1 py-3 text-sm font-medium text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white transition-colors"
                        >
                            Maybe Later
                        </button>
                        <button
                            onClick={handleInstall}
                            className="flex-[1.5] py-3 px-4 rounded-xl text-white text-sm font-bold shadow-lg shadow-black/5 hover:opacity-90 active:scale-[0.98] transition-all flex items-center justify-center gap-2"
                            style={{ backgroundColor: "var(--accent)" }}
                        >
                            <Download size={18} />
                            Install
                        </button>
                    </div>

                </div>
            </div>
        </div>
    );
}
