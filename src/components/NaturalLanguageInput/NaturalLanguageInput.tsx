import React, { useState, useCallback } from 'react';
import { X, Mic, Globe, Sparkles, ChevronRight } from 'lucide-react';

interface NaturalLanguageInputProps {
  onClose: () => void;
  onParsed: (data: ParsedData) => void;
}

interface ParsedData {
  destination?: string;
  duration?: number;
  preferences?: string[];
  budget?: string;
  travelStyle?: string;
}

const NaturalLanguageInput: React.FC<NaturalLanguageInputProps> = ({ onClose, onParsed }) => {
  const [inputText, setInputText] = useState('');
  const [language, setLanguage] = useState<'zh' | 'en'>('zh');
  const [isProcessing, setIsProcessing] = useState(false);
  const [showSuggestions, setShowSuggestions] = useState(true);

  const suggestions = language === 'zh' 
    ? [
        '帮我规划一个3天2晚的北京之旅',
        '我想去杭州玩，喜欢历史文化景点',
        '周末两天成都美食之旅',
        '5天云南自驾游，预算5000元'
      ]
    : [
        'Plan a 3-day trip to Beijing',
        'I want to visit Hangzhou, love historical sites',
        'Weekend food tour in Chengdu',
        '5-day Yunnan road trip, budget $800'
      ];

  const handleInputChange = useCallback((e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setInputText(e.target.value);
    if (e.target.value.length > 0) {
      setShowSuggestions(false);
    } else {
      setShowSuggestions(true);
    }
  }, []);

  const parseInput = useCallback(async (text: string): Promise<ParsedData> => {
    await new Promise(resolve => setTimeout(resolve, 1000));

    const result: ParsedData = {};
    
    const destinationPatterns = language === 'zh'
      ? /(?:去|到|在|游玩|旅游|之旅)([\u4e00-\u9fa5]+)/
      : /(?:to|visit|in|trip to)\s+([A-Za-z]+)/;
    
    const destinationMatch = text.match(destinationPatterns);
    if (destinationMatch) {
      result.destination = destinationMatch[1];
    }

    const durationPatterns = language === 'zh'
      ? /(\d+)\s*天/
      : /(\d+)\s*day/;
    
    const durationMatch = text.match(durationPatterns);
    if (durationMatch) {
      result.duration = parseInt(durationMatch[1]);
    }

    const budgetPatterns = language === 'zh'
      ? /预算\s*(\d+)/
      : /budget\s*\$?(\d+)/;
    
    const budgetMatch = text.match(budgetPatterns);
    if (budgetMatch) {
      result.budget = budgetMatch[1];
    }

    const preferenceKeywords = language === 'zh'
      ? ['历史文化', '自然风光', '美食', '购物', '主题公园', '博物馆', '古镇', '山水']
      : ['historical', 'nature', 'food', 'shopping', 'theme park', 'museum', 'ancient town', 'landscape'];
    
    const foundPreferences: string[] = [];
    preferenceKeywords.forEach(keyword => {
      if (text.toLowerCase().includes(keyword.toLowerCase())) {
        foundPreferences.push(keyword);
      }
    });
    
    if (foundPreferences.length > 0) {
      result.preferences = foundPreferences;
    }

    return result;
  }, [language]);

  const handleSubmit = useCallback(async () => {
    if (!inputText.trim()) return;

    setIsProcessing(true);
    try {
      const parsedData = await parseInput(inputText);
      onParsed(parsedData);
    } catch (error) {
      console.error('解析失败:', error);
    } finally {
      setIsProcessing(false);
    }
  }, [inputText, parseInput, onParsed]);

  const handleSuggestionClick = useCallback((suggestion: string) => {
    setInputText(suggestion);
    setShowSuggestions(false);
  }, []);

  const toggleLanguage = useCallback(() => {
    setLanguage(prev => prev === 'zh' ? 'en' : 'zh');
    setInputText('');
    setShowSuggestions(true);
  }, []);

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white/90 dark:bg-gray-800/90 backdrop-blur-2xl rounded-3xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-hidden border border-white/20 dark:border-gray-700/20">
        <div className="p-6 border-b border-gray-200 dark:border-gray-700">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-pink-500 rounded-xl flex items-center justify-center shadow-lg">
                <Sparkles className="w-6 h-6 text-white" />
              </div>
              <div>
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                  {language === 'zh' ? '智能行程规划' : 'Smart Trip Planner'}
                </h2>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  {language === 'zh' ? '用自然语言描述您的旅行需求' : 'Describe your trip in natural language'}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={toggleLanguage}
                className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full transition-colors"
                title={language === 'zh' ? 'Switch to English' : '切换到中文'}
              >
                <Globe className="w-5 h-5 text-gray-600 dark:text-gray-400" />
              </button>
              <button
                onClick={onClose}
                className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full transition-colors"
              >
                <X className="w-6 h-6 text-gray-600 dark:text-gray-400" />
              </button>
            </div>
          </div>
        </div>

        <div className="p-6">
          <div className="mb-4">
            <div className="relative">
              <textarea
                value={inputText}
                onChange={handleInputChange}
                placeholder={language === 'zh' 
                  ? '例如：帮我规划一个3天2晚的北京之旅...' 
                  : 'e.g., Plan a 3-day trip to Beijing...'}
                className="w-full h-32 px-4 py-3 rounded-2xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-purple-500/50 focus:border-transparent transition-all duration-300 resize-none"
                disabled={isProcessing}
              />
              <div className="absolute bottom-3 right-3 flex items-center gap-2">
                <button
                  className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full transition-colors"
                  title={language === 'zh' ? '语音输入' : 'Voice Input'}
                >
                  <Mic className="w-5 h-5 text-gray-400" />
                </button>
                <span className="text-xs text-gray-400">
                  {inputText.length}/500
                </span>
              </div>
            </div>
          </div>

          {showSuggestions && (
            <div className="mb-6">
              <p className="text-sm text-gray-500 dark:text-gray-400 mb-3">
                {language === 'zh' ? '试试这些示例：' : 'Try these examples:'}
              </p>
              <div className="space-y-2">
                {suggestions.map((suggestion, index) => (
                  <button
                    key={index}
                    onClick={() => handleSuggestionClick(suggestion)}
                    className="w-full text-left px-4 py-3 rounded-xl bg-gray-50 dark:bg-gray-700/50 hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300 transition-colors flex items-center justify-between group"
                  >
                    <span>{suggestion}</span>
                    <ChevronRight className="w-4 h-4 text-gray-400 group-hover:text-gray-600 dark:group-hover:text-gray-200 transition-colors" />
                  </button>
                ))}
              </div>
            </div>
          )}

          <div className="flex gap-3">
            <button
              onClick={onClose}
              className="flex-1 px-6 py-3 rounded-xl border border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
            >
              {language === 'zh' ? '取消' : 'Cancel'}
            </button>
            <button
              onClick={handleSubmit}
              disabled={!inputText.trim() || isProcessing}
              className="flex-1 px-6 py-3 rounded-xl bg-gradient-to-r from-purple-500 to-pink-500 text-white font-semibold hover:from-purple-600 hover:to-pink-600 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300 flex items-center justify-center gap-2"
            >
              {isProcessing ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                  {language === 'zh' ? '解析中...' : 'Processing...'}
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4" />
                  {language === 'zh' ? '开始规划' : 'Start Planning'}
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default NaturalLanguageInput;
