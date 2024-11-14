'use client'

import * as React from 'react'
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import {
  Sheet,
  SheetContent,
  SheetTrigger,
} from "@/components/ui/sheet"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { ScrollArea } from "@/components/ui/scroll-area"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { 
  History as HistoryIcon, 
  Image as ImageIcon, 
  Star, 
  Text as TextIcon, 
  Upload, 
  Zap, 
  MoreVertical, 
  Trash, 
  Loader2, 
  Plus, 
  X, 
  Search,
  Mic,
  Volume2
} from 'lucide-react'
import { useTranslation } from "@/hooks/use-translation"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { cn } from "@/lib/utils"
import { Input } from "@/components/ui/input"
import { PaymentForm } from "@/components/PaymentForm"

// All interfaces and types remain the same
interface HistoryItem {
  id: string
  sourceLanguage: string
  sourceText: string
  translations: {
    [key: string]: string
  }
  isFavorite: boolean
  timestamp: Date
}

interface FavoriteItem {
  id: string
  sourceLanguage: string
  sourceText: string
  translations: {
    [key: string]: string
  }
  timestamp: Date
}

interface TranslationCardProps {
  language: string
  value?: string
  loading?: boolean
  error?: string | null
  placeholder?: string
  readOnly?: boolean
  onLanguageChange?: (value: string) => void
  onRemove?: () => void
  isSource?: boolean
  excludeLanguages?: string[]
}

interface LanguageSelectProps {
  value: string
  onValueChange?: (value: string) => void
  excludeLanguages?: string[]
}

interface HistoryDrawerProps {
  onClose: () => void
  onToggleFavorite: (item: HistoryItem) => void
}

interface FavoriteDrawerProps {
  onClose: () => void
  onRemoveFavorite: (item: FavoriteItem) => void
}

// Languages array
const ALL_LANGUAGES = [
  'Afrikaans', 'Albanian', 'Amharic', 'Arabic', 'Armenian', 'Assamese',
  'Aymara', 'Azerbaijani', 'Bambara', 'Basque', 'Belarusian', 'Bengali',
  'Bhojpuri', 'Bosnian', 'Bulgarian', 'Catalan', 'Cebuano', 'Chichewa',
  'Chinese (Simplified)', 'Chinese (Traditional)', 'Corsican', 'Croatian',
  'Czech', 'Danish', 'Dhivehi', 'Dogri', 'Dutch', 'English', 'Esperanto',
  'Estonian', 'Ewe', 'Filipino', 'Finnish', 'French', 'Frisian', 'Galician',
  'Georgian', 'German', 'Greek', 'Guarani', 'Gujarati', 'Haitian Creole',
  'Hausa', 'Hawaiian', 'Hebrew', 'Hindi', 'Hmong', 'Hungarian', 'Icelandic',
  'Igbo', 'Ilocano', 'Indonesian', 'Irish', 'Italian', 'Japanese', 'Javanese',
  'Kannada', 'Kazakh', 'Khmer', 'Kinyarwanda', 'Konkani', 'Korean', 'Krio',
  'Kurdish (Kurmanji)', 'Kurdish (Sorani)', 'Kyrgyz', 'Lao', 'Latin',
  'Latvian', 'Lingala', 'Lithuanian', 'Luganda', 'Luxembourgish', 'Macedonian',
  'Maithili', 'Malagasy', 'Malay', 'Malayalam', 'Maltese', 'Maori', 'Marathi',
  'Meiteilon (Manipuri)', 'Mizo', 'Mongolian', 'Myanmar (Burmese)', 'Nepali',
  'Norwegian', 'Odia (Oriya)', 'Oromo', 'Pashto', 'Persian', 'Polish',
  'Portuguese', 'Punjabi', 'Quechua', 'Romanian', 'Russian', 'Samoan',
  'Sanskrit', 'Scots Gaelic', 'Sepedi', 'Serbian', 'Sesotho', 'Shona',
  'Sindhi', 'Sinhala', 'Slovak', 'Slovenian', 'Somali', 'Spanish', 'Sundanese',
  'Swahili', 'Swedish', 'Tajik', 'Tamil', 'Tatar', 'Telugu', 'Thai', 'Tigrinya',
  'Tsonga', 'Turkish', 'Turkmen', 'Twi', 'Ukrainian', 'Urdu', 'Uyghur', 'Uzbek',
  'Vietnamese', 'Welsh', 'Xhosa', 'Yiddish', 'Yoruba', 'Zulu'
].sort()

// Component definitions (LanguageSelect, TranslationCard, HistoryDrawer, FavoriteDrawer)
const LanguageSelect = React.memo(function LanguageSelect({ value, onValueChange, excludeLanguages = [] }: LanguageSelectProps) {
  const [searchQuery, setSearchQuery] = React.useState('')
  const filteredLanguages = React.useMemo(() => 
    ALL_LANGUAGES.filter((lang: string) => 
      !excludeLanguages.includes(lang) &&
      lang.toLowerCase().includes(searchQuery.toLowerCase())
    ), [excludeLanguages, searchQuery]
  )

  return (
    <Select value={value} onValueChange={onValueChange}>
      <SelectTrigger className="w-[180px]">
        <SelectValue>{value}</SelectValue>
      </SelectTrigger>
      <SelectContent>
        <div className="flex items-center gap-2 px-2 pb-2">
          <Search className="h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search languages..."
            value={searchQuery}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => setSearchQuery(e.target.value)}
            className="h-8"
          />
        </div>
        <ScrollArea className="h-80">
          {filteredLanguages.map(lang => (
            <SelectItem key={lang} value={lang}>{lang}</SelectItem>
          ))}
        </ScrollArea>
      </SelectContent>
    </Select>
  )
})

const TranslationCard = React.memo(function TranslationCard({
  language,
  value,
  loading,
  error,
  placeholder,
  readOnly = false,
  onLanguageChange,
  onRemove,
  isSource = false,
  excludeLanguages = [],
  onTranslate,
  isTranslating,
}: TranslationCardProps & { 
  onTranslate?: () => void;
  isTranslating?: boolean;
}) {
  const [wordCount, setWordCount] = React.useState(0)
  const [isListening, setIsListening] = React.useState(false)
  const textareaRef = React.useRef<HTMLTextAreaElement>(null)

  const handleTextareaChange = React.useCallback(() => {
    if (textareaRef.current) {
      const text = textareaRef.current.value
      const words = text.trim() ? text.trim().split(/\s+/).length : 0
      setWordCount(words)
    }
  }, [])

  const handleSpeak = React.useCallback(() => {
    const text = isSource ? textareaRef.current?.value : value
    if (text && 'speechSynthesis' in window) {
      const utterance = new SpeechSynthesisUtterance(text)
      utterance.lang = language.toLowerCase()
      window.speechSynthesis.speak(utterance)
    }
  }, [isSource, value, language])

  const handleVoiceInput = React.useCallback(() => {
    if (!isSource) return
    
    if ('webkitSpeechRecognition' in window) {
      const recognition = new (window as any).webkitSpeechRecognition()
      recognition.continuous = false
      recognition.interimResults = false
      recognition.lang = language.toLowerCase()

      recognition.onstart = () => {
        setIsListening(true)
      }

      recognition.onend = () => {
        setIsListening(false)
      }

      recognition.onresult = (event: any) => {
        const transcript = event.results[0][0].transcript
        if (textareaRef.current) {
          textareaRef.current.value = transcript
          handleTextareaChange()
        }
      }

      recognition.start()
    }
  }, [isSource, language, handleTextareaChange])

  return (
    <Card className="p-4">
      <div className="mb-4 flex items-center justify-between gap-1">
        <LanguageSelect 
          value={language} 
          onValueChange={onLanguageChange}
          excludeLanguages={excludeLanguages}
        />
        {isSource && onTranslate && (
          <Button 
            onClick={onTranslate}
            disabled={isTranslating}
            variant="default"
            size="sm"
            className="ml-2"
          >
            {isTranslating ? (
              <Loader2 className="h-4 w-4 animate-spin mr-2" />
            ) : null}
            translate
          </Button>
        )}
        {!isSource && onRemove && (
          <Button variant="ghost" size="icon" onClick={onRemove}>
            <X className="h-4 w-4" />
          </Button>
        )}
      </div>
      <div className="relative">
        <Textarea
          ref={textareaRef}
          placeholder={placeholder}
          className="min-h-[200px] resize-none"
          value={isSource ? undefined : value}
          readOnly={readOnly}
          onChange={isSource ? handleTextareaChange : undefined}
          maxLength={5000}
        />
        <div className="mt-2 flex items-center justify-between text-sm text-muted-foreground">
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="sm"
              className="h-8 w-8 p-0"
              onClick={handleSpeak}
            >
              <Volume2 className="h-4 w-4" />
            </Button>
            {isSource && (
              <Button
                variant="ghost"
                size="sm"
                className={cn("h-8 w-8 p-0", isListening && "text-red-500")}
                onClick={handleVoiceInput}
              >
                <Mic className="h-4 w-4" />
              </Button>
            )}
          </div>
          {isSource && (
            <span>{wordCount}/5,000</span>
          )}
        </div>
        {error && (
          <Alert variant="destructive" className="mt-2">
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}
      </div>
    </Card>
  )
})

const HistoryDrawer = React.memo(function HistoryDrawer({ onClose, onToggleFavorite }: HistoryDrawerProps) {
  const [historyItems, setHistoryItems] = React.useState<HistoryItem[]>([])
  const [activeLanguages, setActiveLanguages] = React.useState<{ [key: string]: string }>({})

  React.useEffect(() => {
    const savedHistory = localStorage.getItem('translationHistory')
    if (savedHistory) {
      const items = JSON.parse(savedHistory)
      setHistoryItems(items)
      const initialActiveLanguages = items.reduce((acc: any, item: HistoryItem) => {
        acc[item.id] = Object.keys(item.translations)[0] || ''
        return acc
      }, {})
      setActiveLanguages(initialActiveLanguages)
    }
  }, [])

  const toggleFavorite = React.useCallback((item: HistoryItem) => {
    onToggleFavorite(item)
    const updatedItems = historyItems.map(i =>
      i.id === item.id ? { ...i, isFavorite: !i.isFavorite } : i
    )
    setHistoryItems(updatedItems)
    localStorage.setItem('translationHistory', JSON.stringify(updatedItems))
  }, [historyItems, onToggleFavorite])

  const deleteItem = React.useCallback((id: string) => {
    const updatedItems = historyItems.filter(item => item.id !== id)
    setHistoryItems(updatedItems)
    localStorage.setItem('translationHistory', JSON.stringify(updatedItems))
  }, [historyItems])

  const clearAllHistory = React.useCallback(() => {
    setHistoryItems([])
    localStorage.removeItem('translationHistory')
  }, [])

  const setActiveLanguage = React.useCallback((itemId: string, lang: string) => {
    setActiveLanguages(prev => ({
      ...prev,
      [itemId]: lang
    }))
  }, [])

  return (
    <div className="flex h-full flex-col">
      <div className="flex items-center justify-between border-b px-4 py-2">
        <h2 className="text-lg font-semibold">History</h2>
        <Button
          variant="ghost"
          size="sm"
          className="text-sm text-blue-500 hover:text-blue-600"
          onClick={clearAllHistory}
        >
          Clear all history
        </Button>
      </div>

      <ScrollArea className="flex-1">
        <div className="p-4">
          {historyItems.map((item) => (
            <div key={item.id} className="mb-6 last:mb-0">
              <div className="mb-2 flex items-start justify-between">
                <div className="flex-1">
                  <p className="text-sm font-medium">{item.sourceLanguage}</p>
                  <p className="text-sm">{item.sourceText}</p>
                  <div className="mt-2 flex gap-2">
                    {Object.keys(item.translations).map((lang) => (
                      <Button
                        key={lang}
                        variant={activeLanguages[item.id] === lang ? "default" : "outline"}
                        size="sm"
                        className="text-xs"
                        onClick={() => setActiveLanguage(item.id, lang)}
                      >
                        {lang}
                      </Button>
                    ))}
                  </div>
                  <p className="mt-2 text-sm text-muted-foreground">
                    {item.translations[activeLanguages[item.id]]}
                  </p>
                </div>
                <div className="flex items-center gap-1">
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8"
                    onClick={() => toggleFavorite(item)}
                  >
                    <Star
                      className="h-4 w-4"
                      fill={item.isFavorite ? "currentColor" : "none"}
                    />
                  </Button>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon" className="h-8 w-8">
                        <MoreVertical className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem
                        className="text-destructive"
                        onClick={() => deleteItem(item.id)}
                      >
                        <Trash className="mr-2 h-4 w-4" />
                        Delete
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </div>
              <div className="mt-2 text-xs text-muted-foreground">
                {new Date(item.timestamp).toLocaleString()}
              </div>
            </div>
          ))}
        </div>
      </ScrollArea>
    </div>
  )
})

const FavoriteDrawer = React.memo(function FavoriteDrawer({ onClose, onRemoveFavorite }: FavoriteDrawerProps) {
  const [activeLanguage, setActiveLanguage] = React.useState('Spanish')
  const [favoriteItems, setFavoriteItems] = React.useState<FavoriteItem[]>([])

  React.useEffect(() => {
    const savedFavorites = localStorage.getItem('translationFavorites')
    if (savedFavorites) {
      setFavoriteItems(JSON.parse(savedFavorites))
    }
  }, [])

  const removeFavorite = React.useCallback((item: FavoriteItem) => {
    onRemoveFavorite(item)
    const updatedItems = favoriteItems.filter(i => i.id !== item.id)
    setFavoriteItems(updatedItems)
    localStorage.setItem('translationFavorites', JSON.stringify(updatedItems))
  }, [favoriteItems, onRemoveFavorite])

  const clearAllFavorites = React.useCallback(() => {
    setFavoriteItems([])
    localStorage.removeItem('translationFavorites')
  }, [])

  return (
    <div className="flex h-full flex-col">
      <div className="flex items-center justify-between border-b px-4 py-2">
        <h2 className="text-lg font-semibold">Favorites</h2>
        <Button
          variant="ghost"
          size="sm"
          className="text-sm text-blue-500 hover:text-blue-600"
          onClick={clearAllFavorites}
        >
          Clear all favorites
        </Button>
      </div>

      <ScrollArea className="flex-1">
        <div className="p-4">
          {favoriteItems.map((item) => (
            <div key={item.id} className="mb-6 last:mb-0">
              <div className="mb-2 flex items-start justify-between">
                <div className="flex-1">
                  <p className="text-sm font-medium">{item.sourceLanguage}</p>
                  <p className="text-sm">{item.sourceText}</p>
                  <div className="mt-2 flex gap-2">
                    {Object.keys(item.translations).map((lang) => (
                      <Button
                        key={lang}
                        variant={activeLanguage === lang ? "default" : "outline"}
                        size="sm"
                        className="text-xs"
                        onClick={() => setActiveLanguage(lang)}
                      >
                        {lang}
                      </Button>
                    ))}
                  </div>
                  <p className="mt-2 text-sm text-muted-foreground">
                    {item.translations[activeLanguage]}
                  </p>
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8"
                  onClick={() => removeFavorite(item)}
                >
                  <Star className="h-4 w-4 fill-current" />
                </Button>
              </div>
              <div className="mt-2 text-xs text-muted-foreground">
                {new Date(item.timestamp).toLocaleString()}
              </div>
            </div>
          ))}
        </div>
      </ScrollArea>
    </div>
  )
})

export default function Component() {
  
  const { translate, loading, error } = useTranslation()
  const [translations, setTranslations] = React.useState<{ [key: string]: string }>({})
  const [selectedTab, setSelectedTab] = React.useState<'text' | 'images'>('text')
  const [sourceLanguage, setSourceLanguage] = React.useState('English')
  const [targetLanguages, setTargetLanguages] = React.useState(['Spanish', 'French'])
  const [isHistoryOpen, setIsHistoryOpen] = React.useState(false)
  const [isFavoriteOpen, setIsFavoriteOpen] = React.useState(false)
  const [translationLoading, setTranslationLoading] = React.useState<{ [key: string]: boolean }>({})
  const [isTranslating, setIsTranslating] = React.useState(false)
  const [showPayment, setShowPayment] = React.useState(false)

  const translateText = React.useCallback(async (text: string, targetLang: string) => {
    try {
      setTranslationLoading(prev => ({ ...prev, [targetLang]: true }))
      const translation = await translate(text, targetLang)
      setTranslations(prev => ({
        ...prev,
        [targetLang]: translation
      }))
      return translation
    } catch (error) {
      console.error(`Translation error for ${targetLang}:`, error)
      return ''
    } finally {
      setTranslationLoading(prev => ({ ...prev, [targetLang]: false }))
    }
  }, [translate])

  const handleTranslate = React.useCallback(async () => {
    const sourceTextarea = document.querySelector('textarea') as HTMLTextAreaElement
    const inputText = sourceTextarea?.value || ''
    
    if (!inputText.trim()) {
      setTranslations({})
      return
    }

    setIsTranslating(true)
    try {
      const translationPromises = targetLanguages.map(lang => translateText(inputText, lang))
      await Promise.all(translationPromises)

      // Save to history after all translations are complete
      const historyItem: HistoryItem = {
        id: Date.now().toString(),
        sourceLanguage,
        sourceText: inputText,
        translations,
        isFavorite: false,
        timestamp: new Date()
      }

      const savedHistory = localStorage.getItem('translationHistory')
      const history = savedHistory ? JSON.parse(savedHistory) : []
      history.unshift(historyItem)
      localStorage.setItem('translationHistory', JSON.stringify(history.slice(0, 100)))
    } finally {
      setIsTranslating(false)
    }
  }, [targetLanguages, sourceLanguage, translations, translateText])

  const handleLanguageChange = React.useCallback(async (index: number, newLang: string) => {
    setTargetLanguages(prev => {
      const newTargetLanguages = [...prev]
      newTargetLanguages[index] = newLang
      return newTargetLanguages
    })

    // Get the current source text and translate it for the new language
    const sourceTextarea = document.querySelector('textarea') as HTMLTextAreaElement
    const inputText = sourceTextarea?.value || ''
    
    if (inputText.trim()) {
      await translateText(inputText, newLang)
    }
  }, [translateText])

  const handleAddLanguage = React.useCallback(async () => {
    const availableLanguages = ALL_LANGUAGES.filter(
      lang => lang !== sourceLanguage && !targetLanguages.includes(lang)
    )
    if (availableLanguages.length > 0) {
      const newLang = availableLanguages[0]
      setTargetLanguages(prev => [...prev, newLang])
      
      // Get the current source text and translate it for the new language
      const sourceTextarea = document.querySelector('textarea') as HTMLTextAreaElement
      const inputText = sourceTextarea?.value || ''
      
      if (inputText.trim()) {
        await translateText(inputText, newLang)
      }
    }
  }, [sourceLanguage, targetLanguages, translateText])

  const handleRemoveLanguage = React.useCallback((index: number) => {
    const langToRemove = targetLanguages[index]
    setTargetLanguages(prev => prev.filter((_, i) => i !== index))
    setTranslations(prev => {
      const newTranslations = { ...prev }
      delete newTranslations[langToRemove]
      return newTranslations
    })
  }, [targetLanguages])

  const handleSourceLanguageChange = React.useCallback(async (newLang: string) => {
    setSourceLanguage(newLang)
    
    // Get the current source text and retranslate for all target languages
    const sourceTextarea = document.querySelector('textarea') as HTMLTextAreaElement
    const inputText = sourceTextarea?.value || ''
    
    if (inputText.trim()) {
      const translationPromises = targetLanguages.map(lang => translateText(inputText, lang))
      await Promise.all(translationPromises)
    }
  }, [targetLanguages, translateText])

  const handleToggleFavorite = React.useCallback((item: HistoryItem) => {
    const savedHistory = localStorage.getItem('translationHistory')
    if (savedHistory) {
      const history = JSON.parse(savedHistory)
      const updatedHistory = history.map((h: HistoryItem) =>
        h.id === item.id ? { ...h, isFavorite: !h.isFavorite } : h
      )
      localStorage.setItem('translationHistory', JSON.stringify(updatedHistory))

      if (!item.isFavorite) {
        const favoriteItem: FavoriteItem = {
          id: item.id,
          sourceLanguage: item.sourceLanguage,
          sourceText: item.sourceText,
          translations: item.translations,
          timestamp: item.timestamp
        }
        const savedFavorites = localStorage.getItem('translationFavorites')
        const favorites = savedFavorites ? JSON.parse(savedFavorites) : []
        favorites.unshift(favoriteItem)
        localStorage.setItem('translationFavorites', JSON.stringify(favorites))
      } else {
        const savedFavorites = localStorage.getItem('translationFavorites')
        if (savedFavorites) {
          const favorites = JSON.parse(savedFavorites)
          const updatedFavorites = favorites.filter((f: FavoriteItem) => f.id !== item.id)
          localStorage.setItem('translationFavorites', JSON.stringify(updatedFavorites))
        }
      }
    }
  }, [])

  const handleRemoveFavorite = React.useCallback((item: FavoriteItem) => {
    const savedFavorites = localStorage.getItem('translationFavorites')
    if (savedFavorites) {
      const favorites = JSON.parse(savedFavorites)
      const updatedFavorites = favorites.filter((f: FavoriteItem) => f.id !== item.id)
      localStorage.setItem('translationFavorites', JSON.stringify(updatedFavorites))
    }
  }, [])

  return (
    <div className={cn("flex min-h-screen flex-col bg-background")}>
      <header className="flex items-center justify-between border-b px-4 py-2">
        <div className="flex items-center gap-2">
          <h1 className="text-xl font-semibold">VTranslate</h1>
        </div>
        <div className="flex items-center gap-2">
          <Select defaultValue="GPT-4o">
            <SelectTrigger className="w-[100px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="GPT-4o">GPT-4o</SelectItem>
              <SelectItem value="GPT-3">GPT-3</SelectItem>
            </SelectContent>
          </Select>
          <Sheet open={showPayment} onOpenChange={setShowPayment}>
            <SheetTrigger asChild>
              <Button variant="default" size="sm" className="gap-2">
                <Zap className="h-4 w-4" />
                Subscribe
              </Button>
            </SheetTrigger>
            <SheetContent>
              <div className="flex flex-col gap-4">
                <h2 className="text-lg font-semibold">Subscribe to VTranslate Pro</h2>
                <p className="text-sm text-muted-foreground">
                  Get unlimited translations and access to all premium features.
                </p>
                <PaymentForm />
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </header>

      <div className="flex flex-1">
        <main className="flex-1 p-4">
          <div className="flex items-center gap-2 mb-4">
            <Button
              variant={selectedTab === 'text' ? 'default' : 'ghost'}
              onClick={() => setSelectedTab('text')}
              className="gap-2"
              size="sm"
            >
              <TextIcon className="h-4 w-4" />
              Text
            </Button>
            <Button
              variant={selectedTab === 'images' ? 'default' : 'ghost'}
              onClick={() => setSelectedTab('images')}
              className="gap-2"
              size="sm"
            >
              <ImageIcon className="h-4 w-4" />
              Images
            </Button>
            <div className="ml-auto flex items-center gap-2">
              <Sheet open={isHistoryOpen} onOpenChange={setIsHistoryOpen}>
                <SheetTrigger asChild>
                  <Button variant="ghost" size="sm">
                    <HistoryIcon className="h-4 w-4 mr-2" />
                    History
                  </Button>
                </SheetTrigger>
                <SheetContent side="right" className="w-1/2 max-w-2xl sm:w-[540px]">
                  <HistoryDrawer 
                    onClose={() => setIsHistoryOpen(false)} 
                    onToggleFavorite={handleToggleFavorite}
                  />
                </SheetContent>
              </Sheet>
              <Sheet open={isFavoriteOpen} onOpenChange={setIsFavoriteOpen}>
                <SheetTrigger asChild>
                  <Button variant="ghost" size="sm">
                    <Star className="h-4 w-4 mr-2" />
                    Favorite
                  </Button>
                </SheetTrigger>
                <SheetContent side="right" className="w-1/2 max-w-2xl sm:w-[540px]">
                  <FavoriteDrawer 
                    onClose={() => setIsFavoriteOpen(false)}
                    onRemoveFavorite={handleRemoveFavorite}
                  />
                </SheetContent>
              </Sheet>
            </div>
          </div>

          <div className="grid gap-4">
            {/* Source language card */}
            <div className="col-span-full">
              <TranslationCard
                language={sourceLanguage}
                loading={loading}
                error={error?.message}
                placeholder="Enter text"
                onLanguageChange={handleSourceLanguageChange}
                excludeLanguages={targetLanguages}
                isSource
                onTranslate={handleTranslate}
                isTranslating={isTranslating}
              />
            </div>

            {/* Target language cards - 2 per row */}
            <div className="grid grid-cols-2 gap-4">
              {targetLanguages.map((lang, index) => (
                <TranslationCard
                  key={lang}
                  language={lang}
                  value={translations[lang] || ''}
                  loading={translationLoading[lang]}
                  error={error?.message}
                  placeholder="Translation"
                  readOnly
                  onLanguageChange={(newLang: string) => handleLanguageChange(index, newLang)}
                  onRemove={() => handleRemoveLanguage(index)}
                  excludeLanguages={[sourceLanguage, ...targetLanguages.filter((_, i) => i !== index)]}
                />
              ))}
            </div>
  
            {/* Add Language button */}
            {targetLanguages.length < ALL_LANGUAGES.length - 1 && (
              <div className="flex justify-center mt-4">
                <Button 
                  variant="outline" 
                  onClick={handleAddLanguage}
                  className="w-full max-w-xs"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Add Language
                </Button>
              </div>
            )}
          </div>
        </main>
      </div>
    </div>
  )
}

