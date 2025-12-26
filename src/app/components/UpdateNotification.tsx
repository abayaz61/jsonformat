
"use client";

import { useEffect, useState } from "react";
import { RefreshCw } from "lucide-react";

export default function UpdateNotification() {
    const [showReload, setShowReload] = useState(false);
    const [waitingWorker, setWaitingWorker] = useState<ServiceWorker | null>(null);

    useEffect(() => {
        if (typeof window !== "undefined" && "serviceWorker" in navigator) {
            // Register the service worker
            navigator.serviceWorker
                .register("/sw.js")
                .then((registration) => {
                    // Check if there's already a waiting worker
                    if (registration.waiting) {
                        setWaitingWorker(registration.waiting);
                        setShowReload(true);
                    }

                    // Listener for new updates found
                    registration.addEventListener("updatefound", () => {
                        const newWorker = registration.installing;
                        if (newWorker) {
                            newWorker.addEventListener("statechange", () => {
                                if (newWorker.state === "installed" && navigator.serviceWorker.controller) {
                                    // New update available and ready to activate
                                    setWaitingWorker(newWorker);
                                    setShowReload(true);
                                }
                            });
                        }
                    });
                })
                .catch((error) => {
                    console.error("Service Worker registration failed:", error);
                });

            // Listen for controller change (reload page when new SW takes control)
            let refreshing = false;
            navigator.serviceWorker.addEventListener("controllerchange", () => {
                if (!refreshing) {
                    window.location.reload();
                    refreshing = true;
                }
            });
        }
    }, []);

    const reloadPage = () => {
        if (waitingWorker) {
            waitingWorker.postMessage({ type: "SKIP_WAITING" });
        }
        setShowReload(false);
    };

    if (!showReload) return null;

    return (
        <div className="fixed bottom-4 right-4 z-50 animate-in fade-in slide-in-from-bottom-4 duration-300">
            <div className="bg-slate-800 border border-slate-700 rounded-lg shadow-lg p-4 flex items-center gap-4 max-w-md">
                <div className="flex-1">
                    <h3 className="text-sm font-semibold text-white">Update Available</h3>
                    <p className="text-xs text-slate-400 mt-1">
                        A new version of the app is available.
                    </p>
                </div>
                <button
                    onClick={reloadPage}
                    className="flex items-center gap-2 px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-medium rounded-md transition-colors"
                >
                    <RefreshCw className="w-3 h-3" />
                    Refresh
                </button>
            </div>
        </div>
    );
}
