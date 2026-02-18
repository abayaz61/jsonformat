"use client";

import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import {
    Sparkles,
    Code,
    Minimize2,
    GitBranch,
    FileCode2,
    Wrench,
    Filter,
    Palette,
    Keyboard,
    Monitor,
    X,
    ArrowRight,
} from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";

const WELCOME_SHOWN_KEY = "json-formatter-welcome-shown";

const featureIcons = [
    Code,
    Minimize2,
    GitBranch,
    FileCode2,
    Wrench,
    Filter,
    Palette,
    Keyboard,
    Monitor,
];

const featureColors = [
    "#667eea",
    "#f093fb",
    "#4fd1c5",
    "#f6ad55",
    "#fc8181",
    "#68d391",
    "#b794f4",
    "#63b3ed",
    "#fbd38d",
];

export default function WelcomePopup() {
    const { t } = useLanguage();
    const [showPopup, setShowPopup] = useState(false);
    const [isClosing, setIsClosing] = useState(false);
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
        const shown = localStorage.getItem(WELCOME_SHOWN_KEY);
        if (!shown) {
            setTimeout(() => setShowPopup(true), 800);
        }
    }, []);

    const handleClose = () => {
        setIsClosing(true);
        setTimeout(() => {
            localStorage.setItem(WELCOME_SHOWN_KEY, "true");
            setShowPopup(false);
        }, 400);
    };

    if (!showPopup || !mounted) return null;

    const features = Array.from({ length: 9 }, (_, i) => {
        const n = i + 1;
        const wp = t.welcomePopup;
        return {
            title: wp?.[`feature${n}Title` as keyof typeof wp] || `Feature ${n}`,
            desc: wp?.[`feature${n}Desc` as keyof typeof wp] || "",
            Icon: featureIcons[i],
            color: featureColors[i],
        };
    });

    const modalContent = (
        <>
            {/* Backdrop */}
            <div
                style={{
                    position: "fixed",
                    inset: 0,
                    background: "rgba(0, 0, 0, 0.7)",
                    backdropFilter: "blur(8px)",
                    WebkitBackdropFilter: "blur(8px)",
                    zIndex: 2000,
                    animation: isClosing
                        ? "welcomeFadeOut 0.4s ease forwards"
                        : "welcomeFadeIn 0.3s ease",
                }}
                onClick={handleClose}
            />

            {/* Modal */}
            <div
                style={{
                    position: "fixed",
                    top: "50%",
                    left: "50%",
                    transform: "translate(-50%, -50%)",
                    width: "min(680px, 92vw)",
                    maxHeight: "88vh",
                    background:
                        "linear-gradient(135deg, var(--bg-secondary) 0%, color-mix(in srgb, var(--bg-secondary) 90%, var(--accent) 10%) 100%)",
                    border: "1px solid color-mix(in srgb, var(--border) 80%, var(--accent) 20%)",
                    borderRadius: "20px",
                    boxShadow:
                        "0 25px 60px -12px rgba(0, 0, 0, 0.5), 0 0 40px -8px color-mix(in srgb, var(--accent) 30%, transparent)",
                    zIndex: 2001,
                    display: "flex",
                    flexDirection: "column",
                    overflow: "hidden",
                    animation: isClosing
                        ? "welcomeModalOut 0.4s ease forwards"
                        : "welcomeModalIn 0.5s cubic-bezier(0.16, 1, 0.3, 1)",
                }}
            >
                {/* Header */}
                <div
                    style={{
                        position: "relative",
                        padding: "28px 28px 20px",
                        background:
                            "linear-gradient(135deg, var(--accent) 0%, color-mix(in srgb, var(--accent) 70%, #000 30%) 100%)",
                        overflow: "hidden",
                    }}
                >
                    {/* Background pattern */}
                    <div
                        style={{
                            position: "absolute",
                            inset: 0,
                            opacity: 0.08,
                            backgroundImage:
                                "radial-gradient(circle at 20% 50%, white 1px, transparent 1px), radial-gradient(circle at 80% 20%, white 1px, transparent 1px)",
                            backgroundSize: "40px 40px, 60px 60px",
                        }}
                    />

                    {/* Close button */}
                    <button
                        onClick={handleClose}
                        style={{
                            position: "absolute",
                            top: "16px",
                            right: "16px",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            width: "32px",
                            height: "32px",
                            background: "rgba(255, 255, 255, 0.15)",
                            border: "none",
                            borderRadius: "8px",
                            color: "white",
                            cursor: "pointer",
                            transition: "background 0.2s",
                            zIndex: 1,
                        }}
                        onMouseEnter={(e) =>
                            (e.currentTarget.style.background = "rgba(255, 255, 255, 0.25)")
                        }
                        onMouseLeave={(e) =>
                            (e.currentTarget.style.background = "rgba(255, 255, 255, 0.15)")
                        }
                    >
                        <X size={18} />
                    </button>

                    <div
                        style={{
                            display: "flex",
                            alignItems: "center",
                            gap: "14px",
                            position: "relative",
                        }}
                    >
                        <div
                            style={{
                                width: "48px",
                                height: "48px",
                                borderRadius: "14px",
                                background: "rgba(255, 255, 255, 0.2)",
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "center",
                                flexShrink: 0,
                            }}
                        >
                            <Sparkles size={26} color="white" />
                        </div>
                        <div>
                            <h2
                                style={{
                                    fontSize: "20px",
                                    fontWeight: 700,
                                    color: "white",
                                    margin: 0,
                                    letterSpacing: "-0.3px",
                                }}
                            >
                                {t.welcomePopup?.title || "Welcome to JSON Formatter"}
                            </h2>
                            <p
                                style={{
                                    fontSize: "13px",
                                    color: "rgba(255, 255, 255, 0.75)",
                                    margin: "4px 0 0",
                                }}
                            >
                                {t.welcomePopup?.subtitle || "Discover what you can do"}
                            </p>
                        </div>
                    </div>
                </div>

                {/* Features Grid */}
                <div
                    style={{
                        padding: "20px 24px",
                        overflowY: "auto",
                        flex: 1,
                    }}
                >
                    <div
                        style={{
                            display: "grid",
                            gridTemplateColumns: "repeat(3, 1fr)",
                            gap: "12px",
                        }}
                    >
                        {features.map((feature, idx) => (
                            <div
                                key={idx}
                                className="welcome-feature-card"
                                style={{
                                    padding: "16px 14px",
                                    borderRadius: "14px",
                                    background: "var(--bg-tertiary)",
                                    border: "1px solid var(--border)",
                                    transition: "all 0.25s ease",
                                    cursor: "default",
                                    animation: `welcomeFeatureIn 0.4s cubic-bezier(0.16, 1, 0.3, 1) ${0.1 + idx * 0.05}s both`,
                                }}
                            >
                                <div
                                    style={{
                                        width: "36px",
                                        height: "36px",
                                        borderRadius: "10px",
                                        background: `${feature.color}18`,
                                        display: "flex",
                                        alignItems: "center",
                                        justifyContent: "center",
                                        marginBottom: "10px",
                                    }}
                                >
                                    <feature.Icon size={18} color={feature.color} />
                                </div>
                                <h3
                                    style={{
                                        fontSize: "13px",
                                        fontWeight: 600,
                                        color: "var(--text-primary)",
                                        margin: "0 0 4px",
                                        lineHeight: 1.3,
                                    }}
                                >
                                    {feature.title}
                                </h3>
                                <p
                                    style={{
                                        fontSize: "11px",
                                        color: "var(--text-secondary)",
                                        margin: 0,
                                        lineHeight: 1.45,
                                    }}
                                >
                                    {feature.desc}
                                </p>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Footer */}
                <div
                    style={{
                        padding: "16px 24px 20px",
                        borderTop: "1px solid var(--border)",
                    }}
                >
                    <button
                        onClick={handleClose}
                        style={{
                            width: "100%",
                            padding: "14px",
                            background:
                                "linear-gradient(135deg, var(--accent) 0%, color-mix(in srgb, var(--accent) 80%, #000 20%) 100%)",
                            border: "none",
                            borderRadius: "12px",
                            color: "white",
                            fontSize: "14px",
                            fontWeight: 600,
                            cursor: "pointer",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            gap: "8px",
                            transition: "all 0.2s ease",
                            boxShadow:
                                "0 8px 24px -4px color-mix(in srgb, var(--accent) 40%, transparent)",
                        }}
                        onMouseEnter={(e) => {
                            e.currentTarget.style.filter = "brightness(1.1)";
                            e.currentTarget.style.transform = "translateY(-1px)";
                        }}
                        onMouseLeave={(e) => {
                            e.currentTarget.style.filter = "brightness(1)";
                            e.currentTarget.style.transform = "translateY(0)";
                        }}
                    >
                        {t.welcomePopup?.button || "Get Started"}
                        <ArrowRight size={18} />
                    </button>
                </div>
            </div>

            {/* Keyframe styles */}
            <style>{`
                @keyframes welcomeFadeIn {
                    from { opacity: 0; }
                    to { opacity: 1; }
                }
                @keyframes welcomeFadeOut {
                    from { opacity: 1; }
                    to { opacity: 0; }
                }
                @keyframes welcomeModalIn {
                    from {
                        opacity: 0;
                        transform: translate(-50%, -48%) scale(0.92);
                    }
                    to {
                        opacity: 1;
                        transform: translate(-50%, -50%) scale(1);
                    }
                }
                @keyframes welcomeModalOut {
                    from {
                        opacity: 1;
                        transform: translate(-50%, -50%) scale(1);
                    }
                    to {
                        opacity: 0;
                        transform: translate(-50%, -48%) scale(0.92);
                    }
                }
                @keyframes welcomeFeatureIn {
                    from {
                        opacity: 0;
                        transform: translateY(12px);
                    }
                    to {
                        opacity: 1;
                        transform: translateY(0);
                    }
                }
                .welcome-feature-card:hover {
                    border-color: color-mix(in srgb, var(--accent) 40%, var(--border) 60%) !important;
                    background: color-mix(in srgb, var(--bg-tertiary) 90%, var(--accent) 10%) !important;
                    transform: translateY(-2px);
                    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
                }

                @media (max-width: 560px) {
                    .welcome-feature-card {
                        padding: 12px 10px !important;
                    }
                }
            `}</style>
        </>
    );

    return createPortal(modalContent, document.body);
}
