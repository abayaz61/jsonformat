'use client';

import { useState, useCallback } from 'react';
import { formatJson, minifyJson, validateJson } from '@/utils/jsonOperations';
import type { JsonValidationResult } from '@/types';

interface UseJsonFormatterReturn {
    content: string;
    setContent: (content: string) => void;
    validation: JsonValidationResult;
    format: (indent?: number) => boolean;
    minify: () => boolean;
    clear: () => void;
}

/**
 * Hook for JSON formatting operations
 */
export function useJsonFormatter(initialContent: string = ''): UseJsonFormatterReturn {
    const [content, setContent] = useState(initialContent);
    const [validation, setValidation] = useState<JsonValidationResult>({ valid: true });

    // Update content and validate
    const handleSetContent = useCallback((newContent: string) => {
        setContent(newContent);
        setValidation(validateJson(newContent));
    }, []);

    // Format JSON with specified indentation
    const format = useCallback((indent: number = 2): boolean => {
        try {
            const formatted = formatJson(content, indent);
            setContent(formatted);
            setValidation({ valid: true });
            return true;
        } catch {
            setValidation(validateJson(content));
            return false;
        }
    }, [content]);

    // Minify JSON
    const minify = useCallback((): boolean => {
        try {
            const minified = minifyJson(content);
            setContent(minified);
            setValidation({ valid: true });
            return true;
        } catch {
            setValidation(validateJson(content));
            return false;
        }
    }, [content]);

    // Clear content
    const clear = useCallback(() => {
        setContent('');
        setValidation({ valid: true });
    }, []);

    return {
        content,
        setContent: handleSetContent,
        validation,
        format,
        minify,
        clear
    };
}
