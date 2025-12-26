"use client";

import { useEffect, useState } from "react";
import { Shield, Lock, Eye, Check } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";

const PRIVACY_ACKNOWLEDGED_KEY = "json-formatter-privacy-acknowledged";

export default function PrivacyNotice() {
    const { t } = useLanguage();
    const [showNotice, setShowNotice] = useState(false);
    const [isClosing, setIsClosing] = useState(false);

    useEffect(() => {
        // Check if user has already acknowledged the privacy notice
        const acknowledged = localStorage.getItem(PRIVACY_ACKNOWLEDGED_KEY);
        if (!acknowledged) {
            // Small delay to let the page load first
            setTimeout(() => setShowNotice(true), 500);
        }
    }, []);

    const handleAcknowledge = () => {
        setIsClosing(true);
        setTimeout(() => {
            localStorage.setItem(PRIVACY_ACKNOWLEDGED_KEY, "true");
            setShowNotice(false);
        }, 300);
    };

    if (!showNotice) return null;

    return (
        <div
            className={`fixed bottom-8 right-8 z-50 w-[420px] max-w-[calc(100vw-64px)] transform transition-all duration-300 ease-out ${isClosing
                ? "opacity-0 translate-y-4 scale-95"
                : "opacity-100 translate-y-0 scale-100"
                }`}
            style={{ animation: isClosing ? undefined : "slideInFromRight 0.5s ease-out" }}
        >
            <style>{`
                @keyframes slideInFromRight {
                    from { opacity: 0; transform: translateX(30px) scale(0.95); }
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
                {/* Header */}
                <div
                    className="flex items-center gap-4"
                    style={{ backgroundColor: "var(--accent)", padding: "20px 24px" }}
                >
                    <div className="w-12 h-12 rounded-xl bg-white/20 flex items-center justify-center flex-shrink-0">
                        <Shield className="w-6 h-6 text-white" />
                    </div>
                    <div>
                        <h2 className="text-xl font-bold text-white">
                            {t.privacyNotice?.title || "Your Privacy Matters"}
                        </h2>
                        <p className="text-white/80 text-sm mt-0.5">
                            {t.privacyNotice?.subtitle || "100% Client-Side Processing"}
                        </p>
                    </div>
                </div>

                {/* Content */}
                <div style={{ padding: "20px 24px" }}>
                    <p
                        className="text-sm leading-relaxed mb-5"
                        style={{ color: "var(--text-secondary)" }}
                    >
                        {t.privacyNotice?.description || "We care deeply about your data privacy. This application processes all your JSON data entirely in your browser."}
                    </p>

                    {/* Features */}
                    <div className="space-y-3 mb-6">
                        <div className="flex items-start gap-3">
                            <div
                                className="flex-shrink-0 w-8 h-8 rounded-lg flex items-center justify-center"
                                style={{ backgroundColor: "var(--accent-light)", color: "var(--accent)" }}
                            >
                                <Lock size={16} />
                            </div>
                            <div>
                                <h3
                                    className="font-semibold text-sm"
                                    style={{ color: "var(--text-primary)" }}
                                >
                                    {t.privacyNotice?.feature1Title || "No Server Uploads"}
                                </h3>
                                <p
                                    className="text-xs mt-0.5"
                                    style={{ color: "var(--text-secondary)" }}
                                >
                                    {t.privacyNotice?.feature1Desc || "Your JSON data is never sent to any server."}
                                </p>
                            </div>
                        </div>

                        <div className="flex items-start gap-3">
                            <div
                                className="flex-shrink-0 w-8 h-8 rounded-lg flex items-center justify-center"
                                style={{ backgroundColor: "var(--accent-light)", color: "var(--accent)" }}
                            >
                                <Eye size={16} />
                            </div>
                            <div>
                                <h3
                                    className="font-semibold text-sm"
                                    style={{ color: "var(--text-primary)" }}
                                >
                                    {t.privacyNotice?.feature2Title || "No Tracking"}
                                </h3>
                                <p
                                    className="text-xs mt-0.5"
                                    style={{ color: "var(--text-secondary)" }}
                                >
                                    {t.privacyNotice?.feature2Desc || "We don't use analytics or tracking."}
                                </p>
                            </div>
                        </div>

                        <div className="flex items-start gap-3">
                            <div
                                className="flex-shrink-0 w-8 h-8 rounded-lg flex items-center justify-center"
                                style={{ backgroundColor: "var(--accent-light)", color: "var(--accent)" }}
                            >
                                <Shield size={16} />
                            </div>
                            <div>
                                <h3
                                    className="font-semibold text-sm"
                                    style={{ color: "var(--text-primary)" }}
                                >
                                    {t.privacyNotice?.feature3Title || "Offline Capable"}
                                </h3>
                                <p
                                    className="text-xs mt-0.5"
                                    style={{ color: "var(--text-secondary)" }}
                                >
                                    {t.privacyNotice?.feature3Desc || "Once loaded, the app works offline."}
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* Button */}
                    <button
                        onClick={handleAcknowledge}
                        className="w-full rounded-xl text-white text-sm font-bold transition-all flex items-center justify-center hover:brightness-110 active:scale-[0.98]"
                        style={{
                            backgroundColor: "var(--accent)",
                            boxShadow: "0 8px 24px -4px color-mix(in srgb, var(--accent) 40%, transparent)",
                            padding: "16px",
                            marginTop: "16px",
                            gap: "8px",
                        }}
                    >
                        <Check size={18} />
                        {t.privacyNotice?.button || "Got it, thanks!"}
                    </button>
                </div>
            </div>
        </div>
    );
}
