const API_KEY = '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';
const API_URL = 'https://openrouter.ai/api/v1/chat/completions';

interface TranslationResponse {
  choices: {
    message: {
      content: string;
    };
  }[];
}

interface LanguageDetectionResponse {
  choices: {
    message: {
      content: string;
    };
  }[];
}

class TranslationService {
  private async makeRequest<T>(messages: any[]): Promise<T> {
    try {
      const response = await fetch(API_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${API_KEY}`,
          'HTTP-Referer': typeof window !== 'undefined' ? window.location.href : 'https://vtranslate.com',
          'X-Title': 'VTranslate'
        },
        body: JSON.stringify({
          model: 'gpt-4o-mini',
          messages: messages,
          temperature: 0.3 // Lower temperature for more consistent translations
        })
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || `HTTP error! status: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error('API request failed:', error);
      throw error;
    }
  }

  async translate(text: string, targetLang: string): Promise<string> {
    try {
      // Get the language code and special instructions
      const langConfig = this.getLanguageConfig(targetLang);

      const messages = [
        {
          role: 'system',
          content: `You are a professional translator. Translate the following text to ${langConfig.name}. ${langConfig.instructions || ''} Only provide the translation, no explanations or additional text.`
        },
        {
          role: 'user',
          content: text
        }
      ];

      const data = await this.makeRequest<TranslationResponse>(messages);

      if (!data.choices || !data.choices[0] || !data.choices[0].message) {
        throw new Error('Translation failed');
      }

      return data.choices[0].message.content.trim();
    } catch (error) {
      console.error('Translation error:', error);
      throw error;
    }
  }

  private getLanguageConfig(lang: string) {
    const configs: { [key: string]: { name: string; instructions?: string } } = {
      'Japanese': {
        name: '日本語',
        instructions: 'Use appropriate keigo and natural Japanese expressions. Include kanji where appropriate.'
      },
      'Spanish': {
        name: 'Español',
        instructions: 'Consider regional variations and use neutral Spanish.'
      },
      'Hindi': {
        name: 'हिंदी',
        instructions: 'Use Devanagari script and maintain formal Hindi.'
      },
      'Chinese': {
        name: '中文',
        instructions: 'Use Simplified Chinese characters and maintain formal tone.'
      },
      'Korean': {
        name: '한국어',
        instructions: 'Use appropriate honorifics and maintain formal Korean.'
      },
      'French': {
        name: 'Français',
        instructions: 'Use proper French grammar and maintain formal tone.'
      },
      'German': {
        name: 'Deutsch',
        instructions: 'Use proper German grammar and formal "Sie" form.'
      },
      'Italian': {
        name: 'Italiano',
        instructions: 'Use proper Italian grammar and maintain formal tone.'
      },
      'Portuguese': {
        name: 'Português',
        instructions: 'Use proper Portuguese grammar and maintain formal tone.'
      },
      'Russian': {
        name: 'Русский',
        instructions: 'Use proper Russian grammar and maintain formal tone.'
      },
      'Arabic': {
        name: 'العربية',
        instructions: 'Use Modern Standard Arabic and proper diacritics.'
      },
      'English': {
        name: 'English',
        instructions: 'Use proper grammar and maintain formal tone.'
      }
    };

    return configs[lang] || { name: lang };
  }

  async detectLanguage(text: string): Promise<string> {
    try {
      const messages = [
        {
          role: 'system',
          content: 'You are a language detector. Detect the language of the following text. Only respond with the language name in English, no explanations or additional text.'
        },
        {
          role: 'user',
          content: text
        }
      ];

      const data = await this.makeRequest<LanguageDetectionResponse>(messages);

      if (!data.choices || !data.choices[0] || !data.choices[0].message) {
        throw new Error('Language detection failed');
      }

      return data.choices[0].message.content.trim();
    } catch (error) {
      console.error('Language detection error:', error);
      throw error;
    }
  }

  async getSupportedLanguages(): Promise<string[]> {
    return [
      'English',
      'Japanese',
      'Spanish',
      'Hindi',
      'Chinese',
      'Korean',
      'French',
      'German',
      'Italian',
      'Portuguese',
      'Russian',
      'Arabic'
    ];
  }
}

// Create a singleton instance
const translationService = new TranslationService();

export default translationService;
