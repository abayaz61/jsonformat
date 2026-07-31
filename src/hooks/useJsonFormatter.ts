'use client';

import { useState, useCallback } from 'react';
import { formatJson, minifyJson, validateJson, partialFormatJson } from '@/utils/jsonOperations';
import { parseJwt } from '@/utils/jwt';
import type { JsonValidationResult } from '@/types';
import type { FormatOptions } from '@/utils/jsonOperations';

interface UseJsonFormatterReturn {
    content: string;
    setContent: (content: string) => void;
    validation: JsonValidationResult;
    format: (indent?: number, options?: FormatOptions) => 'full' | 'partial' | false;
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
        let isRealJsonObjectOrArray = false;
        try {
            const parsed = JSON.parse(newContent);
            if (parsed && typeof parsed === 'object') {
                isRealJsonObjectOrArray = true;
            }
        } catch {
            isRealJsonObjectOrArray = false;
        }

        if (!isRealJsonObjectOrArray) {
            const jwtParsed = parseJwt(newContent);
            if (jwtParsed) {
                const formatted = JSON.stringify(jwtParsed, null, 2);
                setContent(formatted);
                setValidation({ valid: true });
                return;
            }
        }

        setContent(newContent);
        setValidation(validateJson(newContent));
    }, []);

    // Format JSON with specified indentation
    const format = useCallback((indent: number = 2, options: FormatOptions = {}): 'full' | 'partial' | false => {
        try {
            const formatted = formatJson(content, indent, options);
            setContent(formatted);
            setValidation({ valid: true });
            return 'full';
        } catch {
            // Try partial formatting as fallback
            try {
                const { result, isPartial } = partialFormatJson(content, indent, options);
                setContent(result);
                if (isPartial) {
                    setValidation(validateJson(result));
                    return 'partial';
                }
                setValidation({ valid: true });
                return 'full';
            } catch {
                setValidation(validateJson(content));
                return false;
            }
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
