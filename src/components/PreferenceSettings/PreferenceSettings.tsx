import React, { useState, useCallback } from 'react';
import { X, Heart, Car, Utensils, ShoppingBag, Activity, DollarSign, Check } from 'lucide-react';

interface PreferenceSettingsProps {
  onClose: () => void;
  onSave: (preferences: UserPreferences) => void;
  initialPreferences?: UserPreferences;
}

export interface UserPreferences {
  attractionTypes: string[];
  transportation: string[];
  cuisine: string[];
  shopping: string[];
  physicalLevel: 'low' | 'medium' | 'high';
  budget: 'economy' | 'comfort' | 'luxury';
}

const PreferenceSettings: React.FC<PreferenceSettingsProps> = ({ 
  onClose, 
  onSave, 
  initialPreferences 
}) => {
  const [preferences, setPreferences] = useState<UserPreferences>(
    initialPreferences || {
      attractionTypes: [],
      transportation: [],
      cuisine: [],
      shopping: [],
      physicalLevel: 'medium',
      budget: 'comfort'
    }
  );

  const [currentStep, setCurrentStep] = useState(0);

  const steps = [
    { title: '景点类型', icon: Heart, field: 'attractionTypes' },
    { title: '出行方式', icon: Car, field: 'transportation' },
    { title: '餐饮偏好', icon: Utensils, field: 'cuisine' },
    { title: '购物需求', icon: ShoppingBag, field: 'shopping' },
    { title: '体力水平', icon: Activity, field: 'physicalLevel' },
    { title: '预算范围', icon: DollarSign, field: 'budget' }
  ];

  const options = {
    attractionTypes: [
      { id: 'historical', label: '历史文化', icon: '🏛️' },
      { id: 'nature', label: '自然风光', icon: '🏔️' },
      { id: 'theme-park', label: '主题公园', icon: '🎢' },
      { id: 'museum', label: '博物馆', icon: '🏛️' },
      { id: 'ancient-town', label: '古镇', icon: '🏘️' },
      { id: 'beach', label: '海滨', icon: '🏖️' },
      { id: 'mountain', label: '山岳', icon: '⛰️' },
      { id: 'temple', label: '寺庙', icon: '⛩️' }
    ],
    transportation: [
      { id: 'public', label: '公共交通', icon: '🚇' },
      { id: 'driving', label: '自驾', icon: '🚗' },
      { id: 'walking', label: '步行', icon: '🚶' },
      { id: 'cycling', label: '骑行', icon: '🚴' },
      { id: 'taxi', label: '打车', icon: '🚕' }
    ],
    cuisine: [
      { id: 'local', label: '当地特色', icon: '🍜' },
      { id: 'international', label: '国际美食', icon: '🌍' },
      { id: 'fast-food', label: '快餐', icon: '🍔' },
      { id: 'vegetarian', label: '素食', icon: '🥗' },
      { id: 'seafood', label: '海鲜', icon: '🦐' },
      { id: 'dessert', label: '甜点', icon: '🍰' }
    ],
    shopping: [
      { id: 'souvenir', label: '纪念品', icon: '🎁' },
      { id: 'luxury', label: '奢侈品', icon: '👜' },
      { id: 'local-products', label: '特产', icon: '🛍️' },
      { id: 'electronics', label: '电子产品', icon: '📱' },
      { id: 'clothing', label: '服装', icon: '👔' },
      { id: 'no-shopping', label: '不需要购物', icon: '❌' }
    ]
  };

  const handleMultiSelect = useCallback((field: keyof UserPreferences, value: string) => {
    setPreferences(prev => {
      const currentValues = prev[field] as string[];
      const newValues = currentValues.includes(value)
        ? currentValues.filter(v => v !== value)
        : [...currentValues, value];
      return { ...prev, [field]: newValues };
    });
  }, []);

  const handleSingleSelect = useCallback((field: keyof UserPreferences, value: string) => {
    setPreferences(prev => ({ ...prev, [field]: value }));
  }, []);

  const handleNext = useCallback(() => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(prev => prev + 1);
    } else {
      onSave(preferences);
    }
  }, [currentStep, steps.length, onSave, preferences]);

  const handleBack = useCallback(() => {
    if (currentStep > 0) {
      setCurrentStep(prev => prev - 1);
    }
  }, [currentStep]);

  const handleSkip = useCallback(() => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(prev => prev + 1);
    } else {
      onSave(preferences);
    }
  }, [currentStep, steps.length, onSave, preferences]);

  const renderStepContent = () => {
    const step = steps[currentStep];
    const field = step.field as keyof typeof options;

    if (field === 'physicalLevel') {
      return (
        <div className="space-y-4">
          <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
            选择您的体力水平，我们将为您安排合适的行程节奏
          </p>
          {[
            { id: 'low', label: '轻松', desc: '悠闲漫步，适合休闲游', icon: '🚶' },
            { id: 'medium', label: '中等', desc: '适度运动，平衡体验', icon: '🏃' },
            { id: 'high', label: '高强度', desc: '充实紧凑，挑战极限', icon: '💪' }
          ].map(option => (
            <button
              key={option.id}
              onClick={() => handleSingleSelect('physicalLevel', option.id)}
              className={`w-full p-4 rounded-xl border-2 transition-all duration-300 flex items-center gap-4 ${
                preferences.physicalLevel === option.id
                  ? 'border-purple-500 bg-purple-50 dark:bg-purple-900/30'
                  : 'border-gray-200 dark:border-gray-700 hover:border-purple-300'
              }`}
            >
              <span className="text-3xl">{option.icon}</span>
              <div className="flex-1 text-left">
                <p className="font-semibold text-gray-900 dark:text-white">{option.label}</p>
                <p className="text-sm text-gray-600 dark:text-gray-400">{option.desc}</p>
              </div>
              {preferences.physicalLevel === option.id && (
                <Check className="w-5 h-5 text-purple-500" />
              )}
            </button>
          ))}
        </div>
      );
    }

    if (field === 'budget') {
      return (
        <div className="space-y-4">
          <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
            选择您的预算范围，我们将为您推荐合适的体验
          </p>
          {[
            { id: 'economy', label: '经济型', desc: '性价比优先，精打细算', icon: '💰' },
            { id: 'comfort', label: '舒适型', desc: '品质体验，适度消费', icon: '💎' },
            { id: 'luxury', label: '豪华型', desc: '顶级享受，不设上限', icon: '👑' }
          ].map(option => (
            <button
              key={option.id}
              onClick={() => handleSingleSelect('budget', option.id)}
              className={`w-full p-4 rounded-xl border-2 transition-all duration-300 flex items-center gap-4 ${
                preferences.budget === option.id
                  ? 'border-purple-500 bg-purple-50 dark:bg-purple-900/30'
                  : 'border-gray-200 dark:border-gray-700 hover:border-purple-300'
              }`}
            >
              <span className="text-3xl">{option.icon}</span>
              <div className="flex-1 text-left">
                <p className="font-semibold text-gray-900 dark:text-white">{option.label}</p>
                <p className="text-sm text-gray-600 dark:text-gray-400">{option.desc}</p>
              </div>
              {preferences.budget === option.id && (
                <Check className="w-5 h-5 text-purple-500" />
              )}
            </button>
          ))}
        </div>
      );
    }

    const currentOptions = options[field];
    if (!currentOptions) return null;

    return (
      <div className="grid grid-cols-2 gap-3">
        {currentOptions.map(option => {
          const isSelected = (preferences[field] as string[]).includes(option.id);
          return (
            <button
              key={option.id}
              onClick={() => handleMultiSelect(field, option.id)}
              className={`p-4 rounded-xl border-2 transition-all duration-300 flex flex-col items-center gap-2 ${
                isSelected
                  ? 'border-purple-500 bg-purple-50 dark:bg-purple-900/30'
                  : 'border-gray-200 dark:border-gray-700 hover:border-purple-300'
              }`}
            >
              <span className="text-3xl">{option.icon}</span>
              <span className="text-sm font-medium text-gray-900 dark:text-white">
                {option.label}
              </span>
              {isSelected && (
                <div className="absolute top-2 right-2">
                  <Check className="w-4 h-4 text-purple-500" />
                </div>
              )}
            </button>
          );
        })}
      </div>
    );
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white/90 dark:bg-gray-800/90 backdrop-blur-2xl rounded-3xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-hidden border border-white/20 dark:border-gray-700/20">
        <div className="p-6 border-b border-gray-200 dark:border-gray-700">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-gradient-to-br from-pink-500 to-rose-500 rounded-xl flex items-center justify-center shadow-lg">
                <Heart className="w-6 h-6 text-white" />
              </div>
              <div>
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white">偏好设置</h2>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  告诉我们您的旅行偏好，获得个性化推荐
                </p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full transition-colors"
            >
              <X className="w-6 h-6 text-gray-600 dark:text-gray-400" />
            </button>
          </div>

          <div className="mt-6">
            <div className="flex items-center justify-between mb-2">
              {steps.map((step, index) => {
                const Icon = step.icon;
                return (
                  <div key={index} className="flex items-center">
                    <div
                      className={`w-10 h-10 rounded-full flex items-center justify-center transition-all duration-300 ${
                        index <= currentStep
                          ? 'bg-gradient-to-r from-purple-500 to-pink-500 text-white'
                          : 'bg-gray-200 dark:bg-gray-700 text-gray-400'
                      }`}
                    >
                      <Icon className="w-5 h-5" />
                    </div>
                    {index < steps.length - 1 && (
                      <div
                        className={`w-12 h-1 mx-1 rounded transition-all duration-300 ${
                          index < currentStep
                            ? 'bg-gradient-to-r from-purple-500 to-pink-500'
                            : 'bg-gray-200 dark:bg-gray-700'
                        }`}
                      />
                    )}
                  </div>
                );
              })}
            </div>
            <p className="text-center text-sm text-gray-600 dark:text-gray-400">
              步骤 {currentStep + 1} / {steps.length}：{steps[currentStep].title}
            </p>
          </div>
        </div>

        <div className="p-6 max-h-[50vh] overflow-y-auto">
          {renderStepContent()}
        </div>

        <div className="p-6 border-t border-gray-200 dark:border-gray-700">
          <div className="flex gap-3">
            {currentStep > 0 && (
              <button
                onClick={handleBack}
                className="px-6 py-3 rounded-xl border border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
              >
                上一步
              </button>
            )}
            <button
              onClick={handleSkip}
              className="flex-1 px-6 py-3 rounded-xl border border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
            >
              跳过
            </button>
            <button
              onClick={handleNext}
              className="flex-1 px-6 py-3 rounded-xl bg-gradient-to-r from-purple-500 to-pink-500 text-white font-semibold hover:from-purple-600 hover:to-pink-600 transition-all duration-300"
            >
              {currentStep === steps.length - 1 ? '完成' : '下一步'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PreferenceSettings;
