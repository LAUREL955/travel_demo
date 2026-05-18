import React, { useState, useEffect, useCallback } from 'react';
import { X, MapPin, Clock, Calendar, Star, Check, ChevronRight, RefreshCw } from 'lucide-react';
import { UserPreferences } from '../PreferenceSettings/PreferenceSettings';

interface PersonalizedItineraryProps {
  onClose: () => void;
  preferences: UserPreferences;
  parsedData?: {
    destination?: string;
    duration?: number;
    preferences?: string[];
    budget?: string;
    travelStyle?: string;
  };
}

interface Attraction {
  id: string;
  name: string;
  description: string;
  address: string;
  rating: number;
  image: string;
  tags: string[];
  duration: number;
  type: string;
}

interface ScheduledAttraction extends Attraction {
  startTime: string;
  endTime: string;
}

interface HalfDayPlan {
  timeSlot: '上午' | '下午';
  attractions: ScheduledAttraction[];
}

interface DayItinerary {
  date: string;
  morning: HalfDayPlan;
  afternoon: HalfDayPlan;
  totalDuration: number;
  totalDistance: number;
}

const PersonalizedItinerary: React.FC<PersonalizedItineraryProps> = ({
  onClose,
  preferences,
  parsedData
}) => {
  const [isGenerating, setIsGenerating] = useState(true);
  const [itinerary, setItinerary] = useState<DayItinerary[]>([]);
  const [selectedAttractions, setSelectedAttractions] = useState<Set<string>>(new Set());
  const [showAttractionSelection, setShowAttractionSelection] = useState(true);
  const [recommendedAttractions, setRecommendedAttractions] = useState<Attraction[]>([]);

  useEffect(() => {
    generateRecommendations();
  }, [preferences, parsedData]);

  const generateRecommendations = useCallback(async () => {
    setIsGenerating(true);
    
    await new Promise(resolve => setTimeout(resolve, 1500));

    const mockAttractions: Attraction[] = [
      {
        id: '1',
        name: '故宫博物院',
        description: '中国明清两代的皇家宫殿，世界文化遗产',
        address: '北京市东城区景山前街4号',
        rating: 4.8,
        image: 'https://images.unsplash.com/photo-1599571234909-29ed5d1321d6?w=800&q=80',
        tags: ['世界遗产', '博物馆', '皇家宫殿'],
        duration: 3,
        type: 'historical'
      },
      {
        id: '2',
        name: '天坛公园',
        description: '明清两代皇帝祭天祈谷的场所',
        address: '北京市东城区天坛路甲1号',
        rating: 4.7,
        image: 'https://images.unsplash.com/photo-1508804185872-d7badad00f7d?w=800&q=80',
        tags: ['世界遗产', '公园', '古建筑'],
        duration: 2,
        type: 'historical'
      },
      {
        id: '3',
        name: '颐和园',
        description: '中国现存规模最大、保存最完整的皇家园林',
        address: '北京市海淀区新建宫门路19号',
        rating: 4.6,
        image: 'https://images.unsplash.com/photo-1563565375-f3fdfdbefa83?w=800&q=80',
        tags: ['世界遗产', '园林', '湖泊'],
        duration: 3,
        type: 'nature'
      },
      {
        id: '4',
        name: '长城（八达岭）',
        description: '中国古代伟大的防御工程，世界文化遗产',
        address: '北京市延庆区八达岭镇',
        rating: 4.9,
        image: 'https://images.unsplash.com/photo-1508804185872-d7badad00f7d?w=800&q=80',
        tags: ['世界遗产', '历史遗迹', '登山'],
        duration: 4,
        type: 'historical'
      },
      {
        id: '5',
        name: '南锣鼓巷',
        description: '北京最古老的街区之一，充满老北京风情',
        address: '北京市东城区南锣鼓巷',
        rating: 4.5,
        image: 'https://images.unsplash.com/photo-1599571234909-29ed5d1321d6?w=800&q=80',
        tags: ['古街', '购物', '美食'],
        duration: 2,
        type: 'ancient-town'
      },
      {
        id: '6',
        name: '798艺术区',
        description: '当代艺术与创意产业的聚集地',
        address: '北京市朝阳区酒仙桥路4号',
        rating: 4.4,
        image: 'https://images.unsplash.com/photo-1563565375-f3fdfdbefa83?w=800&q=80',
        tags: ['艺术', '创意', '拍照'],
        duration: 2,
        type: 'museum'
      }
    ];

    const filteredAttractions = mockAttractions.filter(attraction => {
      if (preferences.attractionTypes.length === 0) return true;
      return preferences.attractionTypes.some(type => attraction.type === type);
    });

    setRecommendedAttractions(filteredAttractions);
    setIsGenerating(false);
  }, [preferences]);

  const toggleAttractionSelection = useCallback((attractionId: string) => {
    setSelectedAttractions(prev => {
      const newSet = new Set(prev);
      if (newSet.has(attractionId)) {
        newSet.delete(attractionId);
      } else {
        newSet.add(attractionId);
      }
      return newSet;
    });
  }, []);

  const generateItinerary = useCallback((attractions: Attraction[]) => {
    const days = parsedData?.duration || 3;
    const generatedItinerary: DayItinerary[] = [];

    const morningStartTimes = ['08:00', '10:00', '12:00'];
    const afternoonStartTimes = ['14:00', '16:00', '18:00'];

    let attrIndex = 0;

    for (let i = 0; i < days; i++) {
      const date = new Date();
      date.setDate(date.getDate() + i);

      const morningAttractions: ScheduledAttraction[] = [];
      for (let j = 0; j < 3 && attrIndex < attractions.length; j++) {
        const attr = attractions[attrIndex];
        const startTime = morningStartTimes[j];
        const endHour = parseInt(startTime.split(':')[0]) + attr.duration;
        const endTime = `${String(endHour).padStart(2, '0')}:00`;
        morningAttractions.push({ ...attr, startTime, endTime });
        attrIndex++;
      }

      const afternoonAttractions: ScheduledAttraction[] = [];
      for (let j = 0; j < 3 && attrIndex < attractions.length; j++) {
        const attr = attractions[attrIndex];
        const startTime = afternoonStartTimes[j];
        const endHour = parseInt(startTime.split(':')[0]) + attr.duration;
        const endTime = `${String(endHour).padStart(2, '0')}:00`;
        afternoonAttractions.push({ ...attr, startTime, endTime });
        attrIndex++;
      }

      const allDayAttractions = [...morningAttractions, ...afternoonAttractions];

      generatedItinerary.push({
        date: date.toLocaleDateString('zh-CN', {
          month: 'long',
          day: 'numeric',
          weekday: 'long'
        }),
        morning: {
          timeSlot: '上午',
          attractions: morningAttractions
        },
        afternoon: {
          timeSlot: '下午',
          attractions: afternoonAttractions
        },
        totalDuration: allDayAttractions.reduce((sum, a) => sum + a.duration, 0),
        totalDistance: Math.floor(Math.random() * 30) + 10
      });
    }

    setItinerary(generatedItinerary);
  }, [parsedData]);

  const handleSkipSelection = useCallback(() => {
    setSelectedAttractions(new Set(recommendedAttractions.map(a => a.id)));
    setShowAttractionSelection(false);
    generateItinerary(recommendedAttractions);
  }, [recommendedAttractions, generateItinerary]);

  const handleConfirmSelection = useCallback(() => {
    const selected = recommendedAttractions.filter(a => selectedAttractions.has(a.id));
    setShowAttractionSelection(false);
    generateItinerary(selected);
  }, [recommendedAttractions, selectedAttractions, generateItinerary]);

  const handleRegenerate = useCallback(() => {
    setIsGenerating(true);
    generateRecommendations();
    setShowAttractionSelection(true);
    setSelectedAttractions(new Set());
  }, [generateRecommendations]);

  if (isGenerating) {
    return (
      <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
        <div className="bg-white/90 dark:bg-gray-800/90 backdrop-blur-2xl rounded-3xl shadow-2xl max-w-md w-full p-8 border border-white/20 dark:border-gray-700/20">
          <div className="text-center">
            <div className="w-16 h-16 mx-auto mb-4 bg-gradient-to-br from-purple-500 to-pink-500 rounded-full flex items-center justify-center animate-pulse">
              <RefreshCw className="w-8 h-8 text-white animate-spin" />
            </div>
            <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
              正在生成个性化行程
            </h3>
            <p className="text-gray-600 dark:text-gray-400">
              根据您的偏好和历史行为优化推荐...
            </p>
          </div>
        </div>
      </div>
    );
  }

  if (showAttractionSelection) {
    return (
      <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
        <div className="bg-white/90 dark:bg-gray-800/90 backdrop-blur-2xl rounded-3xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden border border-white/20 dark:border-gray-700/20">
          <div className="p-6 border-b border-gray-200 dark:border-gray-700">
            <div className="flex justify-between items-center">
              <div>
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                  选择感兴趣的景点
                </h2>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  我们为您推荐了 {recommendedAttractions.length} 个景点，请选择您感兴趣的
                </p>
              </div>
              <button
                onClick={onClose}
                className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full transition-colors"
              >
                <X className="w-6 h-6 text-gray-600 dark:text-gray-400" />
              </button>
            </div>
          </div>

          <div className="p-6 max-h-[60vh] overflow-y-auto">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {recommendedAttractions.map(attraction => {
                const isSelected = selectedAttractions.has(attraction.id);
                return (
                  <div
                    key={attraction.id}
                    onClick={() => toggleAttractionSelection(attraction.id)}
                    className={`relative rounded-2xl overflow-hidden cursor-pointer transition-all duration-300 transform hover:scale-105 ${
                      isSelected ? 'ring-4 ring-purple-500' : ''
                    }`}
                  >
                    <div className="relative h-48">
                      <img
                        src={attraction.image}
                        alt={attraction.name}
                        className="w-full h-full object-cover"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                      <div className="absolute bottom-0 left-0 right-0 p-4">
                        <h3 className="text-lg font-bold text-white mb-1">
                          {attraction.name}
                        </h3>
                        <div className="flex items-center gap-2">
                          <Star className="w-4 h-4 text-yellow-400 fill-current" />
                          <span className="text-white text-sm">{attraction.rating}</span>
                          <span className="text-white/70 text-sm">•</span>
                          <Clock className="w-4 h-4 text-white/70" />
                          <span className="text-white/70 text-sm">{attraction.duration}小时</span>
                        </div>
                      </div>
                      {isSelected && (
                        <div className="absolute top-3 right-3 w-8 h-8 bg-purple-500 rounded-full flex items-center justify-center">
                          <Check className="w-5 h-5 text-white" />
                        </div>
                      )}
                    </div>
                    <div className="p-4 bg-white dark:bg-gray-800">
                      <p className="text-sm text-gray-600 dark:text-gray-400 overflow-hidden" style={{ display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical' }}>
                        {attraction.description}
                      </p>
                      <div className="flex flex-wrap gap-2 mt-2">
                        {attraction.tags.slice(0, 3).map((tag, index) => (
                          <span
                            key={index}
                            className="px-2 py-1 bg-purple-50 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400 text-xs rounded-full"
                          >
                            {tag}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="p-6 border-t border-gray-200 dark:border-gray-700">
            <div className="flex gap-3">
              <button
                onClick={handleSkipSelection}
                className="flex-1 px-6 py-3 rounded-xl border border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
              >
                跳过
              </button>
              <button
                onClick={handleConfirmSelection}
                disabled={selectedAttractions.size === 0}
                className="flex-1 px-6 py-3 rounded-xl bg-gradient-to-r from-purple-500 to-pink-500 text-white font-semibold hover:from-purple-600 hover:to-pink-600 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300"
              >
                确认选择 ({selectedAttractions.size})
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white/90 dark:bg-gray-800/90 backdrop-blur-2xl rounded-3xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden border border-white/20 dark:border-gray-700/20">
        <div className="p-6 border-b border-gray-200 dark:border-gray-700">
          <div className="flex justify-between items-center">
            <div>
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                您的个性化行程
              </h2>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                {parsedData?.destination || '目的地'} · {itinerary.length}天行程
              </p>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={handleRegenerate}
                className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full transition-colors"
                title="重新生成"
              >
                <RefreshCw className="w-5 h-5 text-gray-600 dark:text-gray-400" />
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

        <div className="p-6 max-h-[60vh] overflow-y-auto">
          {itinerary.map((day, dayIndex) => (
            <div key={dayIndex} className="mb-8 last:mb-0">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-pink-500 rounded-xl flex items-center justify-center shadow-lg">
                  <Calendar className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-gray-900 dark:text-white">
                    第 {dayIndex + 1} 天
                  </h3>
                  <p className="text-sm text-gray-500 dark:text-gray-400">{day.date}</p>
                </div>
                <div className="ml-auto flex items-center gap-4 text-sm text-gray-600 dark:text-gray-400">
                  <span className="flex items-center gap-1">
                    <Clock className="w-4 h-4" />
                    {day.totalDuration}小时
                  </span>
                  <span className="flex items-center gap-1">
                    <MapPin className="w-4 h-4" />
                    {day.totalDistance}公里
                  </span>
                </div>
              </div>

              {/* 上午行程 */}
              {day.morning.attractions.length > 0 && (
                <div className="mb-4">
                  <div className="flex items-center gap-2 mb-3 ml-2">
                    <div className="w-8 h-8 bg-gradient-to-br from-orange-400 to-yellow-500 rounded-lg flex items-center justify-center shadow">
                      <span className="text-white text-sm font-bold">早</span>
                    </div>
                    <h4 className="font-semibold text-gray-800 dark:text-gray-200">
                      上午行程
                      <span className="ml-2 text-sm font-normal text-gray-500">({day.morning.attractions.length}/3 个景点)</span>
                    </h4>
                  </div>
                  <div className="space-y-3 ml-10">
                    {day.morning.attractions.map((attraction, attrIndex) => (
                      <div
                        key={attraction.id}
                        className="flex items-start gap-4 p-4 bg-orange-50/50 dark:bg-orange-900/10 rounded-xl hover:bg-orange-50 dark:hover:bg-orange-900/20 transition-all duration-300 border-l-4 border-orange-400"
                      >
                        <div className="flex-shrink-0 w-10 h-10 bg-gradient-to-br from-orange-400 to-yellow-500 text-white rounded-xl flex items-center justify-center font-bold shadow-lg">
                          {attrIndex + 1}
                        </div>
                        <div className="flex-1">
                          <div className="flex items-start justify-between mb-1">
                            <h4 className="font-semibold text-gray-900 dark:text-white">
                              {attraction.name}
                            </h4>
                            <div className="flex items-center gap-1">
                              <Star className="w-4 h-4 text-yellow-500 fill-current" />
                              <span className="text-sm text-gray-600 dark:text-gray-400">
                                {attraction.rating}
                              </span>
                            </div>
                          </div>
                          <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                            {attraction.description}
                          </p>
                          <div className="flex items-center gap-4 text-sm text-gray-500">
                            <span className="flex items-center gap-1">
                              <MapPin className="w-3 h-3" />
                              {attraction.address}
                            </span>
                          </div>
                          <div className="flex items-center gap-2 mt-1">
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-orange-100 dark:bg-orange-900/30 text-orange-700 dark:text-orange-300 text-xs rounded-full font-medium">
                              <Clock className="w-3 h-3" />
                              {attraction.startTime} - {attraction.endTime}
                            </span>
                            <span className="text-xs text-gray-500">游玩{attraction.duration}小时</span>
                          </div>
                        </div>
                        <ChevronRight className="w-5 h-5 text-gray-400 flex-shrink-0 mt-1" />
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* 下午行程 */}
              {day.afternoon.attractions.length > 0 && (
                <div>
                  <div className="flex items-center gap-2 mb-3 ml-2">
                    <div className="w-8 h-8 bg-gradient-to-br from-blue-400 to-indigo-500 rounded-lg flex items-center justify-center shadow">
                      <span className="text-white text-sm font-bold">午</span>
                    </div>
                    <h4 className="font-semibold text-gray-800 dark:text-gray-200">
                      下午行程
                      <span className="ml-2 text-sm font-normal text-gray-500">({day.afternoon.attractions.length}/3 个景点)</span>
                    </h4>
                  </div>
                  <div className="space-y-3 ml-10">
                    {day.afternoon.attractions.map((attraction, attrIndex) => (
                      <div
                        key={attraction.id}
                        className="flex items-start gap-4 p-4 bg-blue-50/50 dark:bg-blue-900/10 rounded-xl hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-all duration-300 border-l-4 border-blue-400"
                      >
                        <div className="flex-shrink-0 w-10 h-10 bg-gradient-to-br from-blue-400 to-indigo-500 text-white rounded-xl flex items-center justify-center font-bold shadow-lg">
                          {attrIndex + 1}
                        </div>
                        <div className="flex-1">
                          <div className="flex items-start justify-between mb-1">
                            <h4 className="font-semibold text-gray-900 dark:text-white">
                              {attraction.name}
                            </h4>
                            <div className="flex items-center gap-1">
                              <Star className="w-4 h-4 text-yellow-500 fill-current" />
                              <span className="text-sm text-gray-600 dark:text-gray-400">
                                {attraction.rating}
                              </span>
                            </div>
                          </div>
                          <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                            {attraction.description}
                          </p>
                          <div className="flex items-center gap-4 text-sm text-gray-500">
                            <span className="flex items-center gap-1">
                              <MapPin className="w-3 h-3" />
                              {attraction.address}
                            </span>
                          </div>
                          <div className="flex items-center gap-2 mt-1">
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 text-xs rounded-full font-medium">
                              <Clock className="w-3 h-3" />
                              {attraction.startTime} - {attraction.endTime}
                            </span>
                            <span className="text-xs text-gray-500">游玩{attraction.duration}小时</span>
                          </div>
                        </div>
                        <ChevronRight className="w-5 h-5 text-gray-400 flex-shrink-0 mt-1" />
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>

        <div className="p-6 border-t border-gray-200 dark:border-gray-700">
          <div className="flex gap-3">
            <button
              onClick={onClose}
              className="flex-1 px-6 py-3 rounded-xl border border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
            >
              保存行程
            </button>
            <button
              onClick={onClose}
              className="flex-1 px-6 py-3 rounded-xl bg-gradient-to-r from-purple-500 to-pink-500 text-white font-semibold hover:from-purple-600 hover:to-pink-600 transition-all duration-300"
            >
              开始导航
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PersonalizedItinerary;
