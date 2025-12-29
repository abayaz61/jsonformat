'use client';

import React from 'react';

/**
 * EditorSkeleton
 * 
 * Monaco Editor yüklenirken gösterilen iskelet yükleme ekranı.
 * Kullanıcıya görsel geri bildirim sağlar ve algılanan performansı iyileştirir.
 */
export function EditorSkeleton() {
    return (
        <div className="editor-skeleton">
            {/* Status Bar Skeleton */}
            <div className="skeleton-status-bar">
                <div className="skeleton-pulse skeleton-status-text" />
            </div>

            {/* Editor Area Skeleton */}
            <div className="skeleton-editor-area">
                {/* Line Numbers */}
                <div className="skeleton-line-numbers">
                    {[...Array(15)].map((_, i) => (
                        <div key={i} className="skeleton-line-number">
                            <div className="skeleton-pulse" style={{ width: `${20 + (i % 3) * 5}px` }} />
                        </div>
                    ))}
                </div>

                {/* Code Lines */}
                <div className="skeleton-code-area">
                    {[...Array(15)].map((_, i) => (
                        <div key={i} className="skeleton-code-line">
                            <div
                                className="skeleton-pulse"
                                style={{
                                    width: `${30 + Math.random() * 50}%`,
                                    marginLeft: `${(i % 4) * 20}px`
                                }}
                            />
                        </div>
                    ))}
                </div>
            </div>

            {/* Loading Indicator */}
            <div className="skeleton-loading-overlay">
                <div className="skeleton-spinner" />
                <span className="skeleton-loading-text">Loading Editor...</span>
            </div>
        </div>
    );
}

/**
 * HeaderSkeleton
 * 
 * Header yüklenirken gösterilen iskelet.
 */
export function HeaderSkeleton() {
    return (
        <div className="header-skeleton">
            <div className="skeleton-logo">
                <div className="skeleton-pulse skeleton-icon" />
                <div className="skeleton-pulse skeleton-title" />
            </div>
            <div className="skeleton-toolbar">
                {[...Array(6)].map((_, i) => (
                    <div key={i} className="skeleton-pulse skeleton-button" />
                ))}
            </div>
        </div>
    );
}

export default EditorSkeleton;
