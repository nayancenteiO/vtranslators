import { useState, useCallback, useEffect, useRef } from 'react';
import translationService from '../lib/translator';

interface TranslationError {
  message: string;
  code?: string;
}

export function useTranslation() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<TranslationError | null>(null);
  const [supportedLanguages, setSupportedLanguages] = useState<string[]>([]);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Fetch supported languages on mount
  useEffect(() => {
    const fetchLanguages = async () => {
      try {
        const languages = await translationService.getSupportedLanguages();
        setSupportedLanguages(languages);
      } catch (err) {
        console.error('Failed to fetch supported languages:', err);
        // Set default languages if API call fails
        setSupportedLanguages([
          'English', 'Spanish', 'French', 'German', 'Italian', 'Portuguese',
          'Russian', 'Japanese', 'Korean', 'Chinese', 'Arabic', 'Hindi'
        ]);
      }
    };
    fetchLanguages();
  }, []);

  // Cleanup function for the timeout
  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  const translate = useCallback(async (text: string, targetLang: string): Promise<string> => {
    // Clear any existing error
    setError(null);

    // If text is empty, return empty string without making API call
    if (!text.trim()) {
      return '';
    }

    try {
      setLoading(true);
      const result = await translationService.translate(text, targetLang);
      return result;
    } catch (err) {
      const error = err as Error;
      setError({
        message: error.message || 'Translation failed. Please try again.',
        code: 'TRANSLATION_ERROR'
      });
      throw error;
    } finally {
      setLoading(false);
    }
  }, []);

  const debouncedTranslate = useCallback((
    text: string,
    targetLang: string,
    callback: (translation: string) => void
  ) => {
    // Clear any existing timeout
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }

    // Clear any existing error
    setError(null);

    // Don't set loading state for empty text
    if (!text.trim()) {
      callback('');
      return;
    }

    // Set loading state immediately for better UX
    setLoading(true);

    // Set a new timeout
    timeoutRef.current = setTimeout(async () => {
      try {
        const translation = await translate(text, targetLang);
        callback(translation);
      } catch (error) {
        // Error is already handled in translate function
        callback('');
      } finally {
        setLoading(false);
      }
    }, 500); // 500ms debounce delay
  }, [translate]);

  const detectLanguage = useCallback(async (text: string): Promise<string> => {
    if (!text.trim()) {
      return 'en';
    }

    try {
      setLoading(true);
      return await translationService.detectLanguage(text);
    } catch (err) {
      const error = err as Error;
      setError({
        message: error.message || 'Language detection failed',
        code: 'DETECTION_ERROR'
      });
      throw error;
    } finally {
      setLoading(false);
    }
  }, []);

  return {
    translate,
    debouncedTranslate,
    detectLanguage,
    supportedLanguages,
    loading,
    error
  };
}
