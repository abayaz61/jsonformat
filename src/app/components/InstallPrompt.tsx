"use client";

import { useEffect, useState } from "react";
import { Download, X, Zap, WifiOff, Maximize } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";

interface BeforeInstallPromptEvent extends Event {
    prompt: () => Promise<void>;
    userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
}

const POSTPONE_KEY = "pwa-install-postponed-until";

export default function InstallPrompt() {
    const { t } = useLanguage();
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

    const closePrompt = () => {
        setIsClosing(true);
        setTimeout(() => setShowPrompt(false), 300);
    };

    const handleInstall = async () => {
        if (!deferredPrompt) {
            if (process.env.NODE_ENV === "development") {
                alert("In production, this triggers the native install dialog.");
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

    if (!showPrompt) return null;

    return (
        <div
            className={`fixed bottom-8 left-8 z-50 w-[420px] max-w-[calc(100vw-64px)] transform transition-all duration-300 ease-out ${isClosing
                ? "opacity-0 translate-y-4 scale-95"
                : "opacity-100 translate-y-0 scale-100"
                }`}
            style={{ animation: isClosing ? undefined : "slideInFromLeft 0.5s ease-out" }}
        >
            <style>{`
        @keyframes slideInFromLeft {
          from { opacity: 0; transform: translateX(-30px) scale(0.95); }
          to { opacity: 1; transform: translateX(0) scale(1); }
        }
      `}</style>

            <div
                className="relative overflow-hidden rounded-3xl shadow-2xl"
                style={{
                    backgroundColor: "var(--bg-secondary)",
                    border: "1px solid var(--border)",
                    boxShadow: "0 25px 50px -12px rgba(0, 0, 0, 0.4)",
                }}
            >
                {/* Header with accent color */}
                <div
                    className="h-10 w-full relative flex items-center justify-end"
                    style={{ backgroundColor: "var(--accent)", paddingRight: "10px" }}
                >
                    {/* Close Button */}
                    <button
                        onClick={handlePostpone}
                        className="w-7 h-7 flex items-center justify-center text-white/70 hover:text-white hover:bg-white/20 rounded-full transition-all"
                    >
                        <X size={18} />
                    </button>
                </div>

                {/* Content */}
                <div className="relative flex flex-col items-center text-center" style={{ padding: "16px 24px 24px 24px" }}>
                    {/* Overlapping Logo */}
                    <div
                        className="w-24 h-24 -mt-12 mb-5 rounded-2xl shadow-xl flex items-center justify-center"
                        style={{
                            backgroundColor: "var(--bg-secondary)",
                            border: "4px solid var(--bg-secondary)",
                        }}
                    >
                        <div
                            className="w-full h-full rounded-xl flex items-center justify-center font-mono text-4xl font-bold"
                            style={{
                                backgroundColor: "var(--accent)",
                                color: "white",
                            }}
                        >
                            {"{ }"}
                        </div>
                    </div>

                    {/* Title */}
                    <h2
                        className="text-2xl font-bold mb-3"
                        style={{ color: "var(--text-primary)" }}
                    >
                        {t.installPrompt.title}
                    </h2>

                    {/* Description */}
                    <p
                        className="text-base mb-8 leading-relaxed max-w-[320px]"
                        style={{ color: "var(--text-secondary)" }}
                    >
                        {t.installPrompt.description}
                    </p>

                    {/* Benefits List */}
                    <div className="w-full text-left" style={{ marginTop: "8px", marginBottom: "16px", padding: "0 8px" }}>
                        <div
                            className="flex items-start"
                            style={{ marginBottom: "12px", gap: "12px" }}
                        >
                            <div
                                className="flex-shrink-0 rounded-lg flex items-center justify-center"
                                style={{ backgroundColor: "var(--accent-light)", color: "var(--accent)", width: "32px", height: "32px" }}
                            >
                                <Zap size={16} />
                            </div>
                            <div>
                                <h4 className="font-semibold text-sm" style={{ color: "var(--text-primary)" }}>
                                    {t.installPrompt.benefit1Title}
                                </h4>
                                <p className="text-xs" style={{ color: "var(--text-secondary)", marginTop: "2px" }}>
                                    {t.installPrompt.benefit1Desc}
                                </p>
                            </div>
                        </div>
                        <div
                            className="flex items-start"
                            style={{ marginBottom: "12px", gap: "12px" }}
                        >
                            <div
                                className="flex-shrink-0 rounded-lg flex items-center justify-center"
                                style={{ backgroundColor: "var(--accent-light)", color: "var(--accent)", width: "32px", height: "32px" }}
                            >
                                <WifiOff size={16} />
                            </div>
                            <div>
                                <h4 className="font-semibold text-sm" style={{ color: "var(--text-primary)" }}>
                                    {t.installPrompt.benefit2Title}
                                </h4>
                                <p className="text-xs" style={{ color: "var(--text-secondary)", marginTop: "2px" }}>
                                    {t.installPrompt.benefit2Desc}
                                </p>
                            </div>
                        </div>
                        <div
                            className="flex items-start"
                            style={{ gap: "12px" }}
                        >
                            <div
                                className="flex-shrink-0 rounded-lg flex items-center justify-center"
                                style={{ backgroundColor: "var(--accent-light)", color: "var(--accent)", width: "32px", height: "32px" }}
                            >
                                <Maximize size={16} />
                            </div>
                            <div>
                                <h4 className="font-semibold text-sm" style={{ color: "var(--text-primary)" }}>
                                    {t.installPrompt.benefit3Title}
                                </h4>
                                <p className="text-xs" style={{ color: "var(--text-secondary)", marginTop: "2px" }}>
                                    {t.installPrompt.benefit3Desc}
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex items-center w-[90%]" style={{ marginBottom: "12px", marginTop: "16px", gap: "16px" }}>
                        <button
                            onClick={handlePostpone}
                            className="flex-1 text-base font-semibold rounded-2xl transition-all border-2 hover:border-current"
                            style={{
                                color: "var(--text-secondary)",
                                backgroundColor: "var(--bg-tertiary)",
                                borderColor: "var(--border)",
                                padding: "12px",
                            }}
                            onMouseOver={(e) => {
                                e.currentTarget.style.color = "var(--text-primary)";
                                e.currentTarget.style.borderColor = "var(--text-muted)";
                            }}
                            onMouseOut={(e) => {
                                e.currentTarget.style.color = "var(--text-secondary)";
                                e.currentTarget.style.borderColor = "var(--border)";
                            }}
                        >
                            {t.installPrompt.later}
                        </button>
                        <button
                            onClick={handleInstall}
                            className="flex-[1.5] rounded-2xl text-white text-base font-bold transition-all flex items-center justify-center border-2 hover:brightness-110 active:scale-[0.98]"
                            style={{
                                backgroundColor: "var(--accent)",
                                borderColor: "var(--accent)",
                                boxShadow: "0 8px 24px -4px color-mix(in srgb, var(--accent) 40%, transparent)",
                                padding: "12px 20px",
                                gap: "12px",
                            }}
                        >
                            <Download size={20} />
                            {t.installPrompt.install}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
