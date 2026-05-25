import React, { useState, useEffect, useCallback } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { addDestination, setCurrentRoute, addRouteToHistory } from '../../store/slices/routeSlice';
import { RootState } from '../../store';
import { Search, MapPin, Star, X, Plus, Check } from 'lucide-react';
import { planOptimalRoute } from '../../utils/algorithms/routePlanner';

interface Attraction {
  id: string;
  name: string;
  description: string;
  address: string;
  latitude: number;
  longitude: number;
  rating: number;
  category: string;
  image: string;
  tags: string[];
}

interface Category {
  id: string;
  name: string;
}

const RouteCreator: React.FC<{ onClose: () => void }> = ({ onClose }) => {
  const dispatch = useDispatch();
  const { stickers, userLocation } = useSelector((state: RootState) => state.route);
  
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [attractions, setAttractions] = useState<Attraction[]>([]);
  const [popularAttractions, setPopularAttractions] = useState<Attraction[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [selectedAttractions, setSelectedAttractions] = useState<Set<string>>(new Set());
  const [attractionStickers, setAttractionStickers] = useState<Record<string, string>>({});
  const [attractionTimeSlots, setAttractionTimeSlots] = useState<Record<string, string>>({});
  const [isLoading, setIsLoading] = useState(false);
  const [showStickerSelector, setShowStickerSelector] = useState<string | null>(null);
  const [showTimeSlotSelector, setShowTimeSlotSelector] = useState<string | null>(null);
  const [showSuccessPage, setShowSuccessPage] = useState(false);
  const [successRouteData, setSuccessRouteData] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);

  const API_BASE_URL = 'http://localhost:5000/api';

  const fetchAttractions = useCallback(async () => {
    setIsLoading(true);
    try {
      const params = new URLSearchParams();
      if (searchQuery) params.append('query', searchQuery);
      if (selectedCategory !== 'all') params.append('category', selectedCategory);
      
      const response = await fetch(`${API_BASE_URL}/attractions?${params}`);
      const data = await response.json();
      
      if (data.success) {
        setError(null);
        setAttractions(data.data);
      }
    } catch (error) {
      setError('无法连接服务器');
      console.error('Error fetching attractions:', error);
    } finally {
      setIsLoading(false);
    }
  }, [searchQuery, selectedCategory]);

  const fetchPopularAttractions = useCallback(async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/attractions/popular`);
      const data = await response.json();
      
      if (data.success) {
        setError(null);
        setPopularAttractions(data.data);
      }
    } catch (error) {
      setError('无法连接服务器');
      console.error('Error fetching popular attractions:', error);
    }
  }, []);

  const fetchCategories = useCallback(async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/categories`);
      const data = await response.json();
      
      if (data.success) {
        setError(null);
        setCategories(data.data);
      }
    } catch (error) {
      setError('无法连接服务器');
      console.error('Error fetching categories:', error);
    }
  }, []);

  const handleRetry = useCallback(() => {
    setError(null);
    fetchCategories();
    fetchPopularAttractions();
    if (searchQuery || selectedCategory !== 'all') {
      fetchAttractions();
    }
  }, [fetchCategories, fetchPopularAttractions, fetchAttractions, searchQuery, selectedCategory]);

  useEffect(() => {
    fetchCategories();
    fetchPopularAttractions();
  }, [fetchCategories, fetchPopularAttractions]);

  useEffect(() => {
    const timeoutId = setTimeout(() => {
      if (searchQuery || selectedCategory !== 'all') {
        fetchAttractions();
      }
    }, 500);

    return () => clearTimeout(timeoutId);
  }, [searchQuery, selectedCategory, fetchAttractions]);

  useEffect(() => {
    setError(null);
  }, [searchQuery, selectedCategory]);

  const handleSelectAttraction = (attraction: Attraction) => {
    const newSelected = new Set(selectedAttractions);
    
    if (newSelected.has(attraction.id)) {
      newSelected.delete(attraction.id);
      const newStickers = { ...attractionStickers };
      delete newStickers[attraction.id];
      setAttractionStickers(newStickers);
    } else {
      newSelected.add(attraction.id);
    }
    
    setSelectedAttractions(newSelected);
  };

  const handleAssignSticker = (attractionId: string, stickerId: string) => {
    setAttractionStickers(prev => ({
      ...prev,
      [attractionId]: stickerId
    }));
    setShowStickerSelector(null);
  };

  const handleAssignTimeSlot = (attractionId: string, timeSlot: string) => {
    setAttractionTimeSlots(prev => ({
      ...prev,
      [attractionId]: timeSlot
    }));
    setShowTimeSlotSelector(null);
  };

  const handleCreateRoute = () => {
    const selectedAttractionData = [...attractions, ...popularAttractions].filter(
      attraction => selectedAttractions.has(attraction.id)
    );

    console.log('选中的景点数量:', selectedAttractionData.length);
    console.log('用户位置:', userLocation);

    if (selectedAttractionData.length === 0) {
      alert('请至少选择一个景点');
      return;
    }
    
    if (!userLocation) {
      alert('无法获取当前位置，请确保已授权位置访问');
      return;
    }

    console.log('开始路线规划...');
    const optimizedRoute = planOptimalRoute(userLocation, selectedAttractionData);
    console.log('优化后的路线:', optimizedRoute);
    
    const totalDistance = optimizedRoute.reduce((sum, dest, index) => {
      if (index === 0) {
        return calculateDistance(userLocation, dest);
      }
      return sum + calculateDistance(optimizedRoute[index - 1], dest);
    }, 0);

    const totalDuration = Math.round(totalDistance * 1.5);

    const routeData = {
      id: `route_${Date.now()}`,
      name: `路线 ${new Date().toLocaleDateString()}`,
      destinations: optimizedRoute.map(dest => ({
        id: dest.id,
        name: dest.name,
        latitude: dest.latitude,
        longitude: dest.longitude,
        description: dest.description,
        stickerId: attractionStickers[dest.id],
        timeSlot: attractionTimeSlots[dest.id] || '上午'
      })),
      totalDistance: Math.round(totalDistance),
      totalDuration,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    console.log('路线数据:', routeData);
    dispatch(setCurrentRoute(routeData));
    dispatch(addRouteToHistory(routeData));
    
    optimizedRoute.forEach(destination => {
      dispatch(addDestination({
        id: destination.id,
        name: destination.name,
        latitude: destination.latitude,
        longitude: destination.longitude,
        description: destination.description,
        stickerId: attractionStickers[destination.id],
        timeSlot: attractionTimeSlots[destination.id] || '上午'
      }));
    });

    setSuccessRouteData({
      totalDistance: Math.round(totalDistance),
      totalDuration,
      selectedCount: selectedAttractionData.length
    });
    setShowSuccessPage(true);
  };

  const calculateDistance = (point1: { latitude: number; longitude: number }, point2: { latitude: number; longitude: number }): number => {
    const R = 6371;
    const dLat = toRad(point2.latitude - point1.latitude);
    const dLon = toRad(point2.longitude - point1.longitude);
    const lat1 = toRad(point1.latitude);
    const lat2 = toRad(point2.latitude);

    const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.sin(dLon / 2) * Math.sin(dLon / 2) * Math.cos(lat1) * Math.cos(lat2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
  };

  const toRad = (value: number): number => {
    return value * Math.PI / 180;
  };

  const getStickerIcon = (stickerId: string) => {
    const sticker = stickers.find(s => s.id === stickerId);
    if (!sticker) return null;

    switch (stickerId) {
      case 'sticker1':
        return <MapPin className="w-6 h-6 text-blue-600" />;
      case 'sticker2':
        return <Star className="w-6 h-6 text-yellow-600" />;
      case 'sticker3':
        return <Plus className="w-6 h-6 text-green-600" />;
      case 'sticker4':
        return <Check className="w-6 h-6 text-purple-600" />;
      default:
        return null;
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className={`bg-white/70 dark:bg-gray-800/70 backdrop-blur-xl rounded-2xl shadow-xl max-w-4xl w-full overflow-hidden flex flex-col border border-white/20 dark:border-gray-700/20 ${showSuccessPage ? 'max-h-fit' : 'max-h-[90vh]'}`}>
        <div className="p-6 border-b border-gray-200/50 dark:border-gray-700/50">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-2xl font-bold text-gray-800 dark:text-white">
              {showSuccessPage ? '路线创建成功！' : '创建新路线'}
            </h2>
            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-100/50 dark:hover:bg-gray-700/50 rounded-full transition-colors"
            >
              <X className="w-6 h-6 text-gray-600 dark:text-gray-400" />
            </button>
          </div>

          <div className="relative mb-4">
            <input
              type="text"
              placeholder={showSuccessPage ? '路线已创建' : '搜索景点...'}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              disabled={showSuccessPage}
              className={`w-full px-4 py-3 pl-12 rounded-lg border border-gray-300/50 dark:border-gray-600/50 bg-white/70 dark:bg-gray-700/70 backdrop-blur-xl text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500/50 ${
                showSuccessPage ? 'opacity-50 cursor-not-allowed' : ''
              }`}
            />
            <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
          </div>

          <div className="flex gap-2 overflow-x-auto pb-2">
            {categories.map(category => (
              <button
                key={category.id}
                onClick={() => setSelectedCategory(category.id)}
                disabled={showSuccessPage}
                className={`px-4 py-2 rounded-full whitespace-nowrap transition-colors ${
                  selectedCategory === category.id && !showSuccessPage
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-100/70 dark:bg-gray-700/70 text-gray-700 dark:text-gray-300 hover:bg-gray-200/70 dark:hover:bg-gray-600/70'
                } ${showSuccessPage ? 'opacity-50 cursor-not-allowed' : ''}`}
              >
                {category.name}
              </button>
            ))}
          </div>
        </div>

        {error && (
          <div className="mx-6 p-4 bg-red-50/80 dark:bg-red-900/30 backdrop-blur-xl rounded-xl border border-red-200/50 dark:border-red-700/50 flex items-center justify-between">
            <span className="text-red-600 dark:text-red-400 text-sm font-medium">{error}</span>
            <button
              onClick={handleRetry}
              className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white text-sm font-medium rounded-lg transition-colors"
            >
              重试
            </button>
          </div>
        )}

        <div className={`p-6 ${showSuccessPage ? '' : 'flex-1 overflow-y-auto'}`}>
          {showSuccessPage && successRouteData ? (
            <div className="flex items-center justify-center">
              <div className="bg-white/70 dark:bg-gray-800/70 backdrop-blur-xl rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 p-8 border border-white/20 dark:border-gray-700/20 w-full max-w-md">
                <div className="flex flex-col items-center text-center">
                  <div className="w-20 h-20 bg-gradient-to-br from-green-400 to-green-600 rounded-full flex items-center justify-center shadow-lg mb-6">
                    <Check className="w-10 h-10 text-white" />
                  </div>
                  
                  <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">
                    路线创建成功！
                  </h3>
                  
                  <div className="flex gap-4 w-full">
                    <div className="flex-1 bg-blue-50/70 dark:bg-blue-900/30 rounded-xl p-4 border border-blue-100/50 dark:border-blue-800/30">
                      <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">总距离</p>
                      <p className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                        {successRouteData.totalDistance} 公里
                      </p>
                    </div>
                    
                    <div className="flex-1 bg-green-50/70 dark:bg-green-900/30 rounded-xl p-4 border border-green-100/50 dark:border-green-800/30">
                      <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">预计时间</p>
                      <p className="text-2xl font-bold text-green-600 dark:text-green-400">
                        {successRouteData.totalDuration} 分钟
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ) : isLoading ? (
            <div className="flex items-center justify-center h-64">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
            </div>
          ) : (
            <>
              {searchQuery || selectedCategory !== 'all' ? (
                <div>
                  <h3 className="text-lg font-semibold text-gray-800 dark:text-white mb-4">
                    搜索结果 ({attractions.length})
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {attractions.map(attraction => (
                      <AttractionCard
                        key={attraction.id}
                        attraction={attraction}
                        isSelected={selectedAttractions.has(attraction.id)}
                        stickerIcon={attractionStickers[attraction.id] ? getStickerIcon(attractionStickers[attraction.id]) : null}
                        timeSlot={attractionTimeSlots[attraction.id]}
                        onSelect={() => handleSelectAttraction(attraction)}
                        onShowStickerSelector={() => setShowStickerSelector(attraction.id)}
                        onShowTimeSlotSelector={() => setShowTimeSlotSelector(attraction.id)}
                      />
                    ))}
                  </div>
                </div>
              ) : (
                <div>
                  <h3 className="text-lg font-semibold text-gray-800 dark:text-white mb-4">
                    热门景点
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {popularAttractions.map(attraction => (
                      <AttractionCard
                        key={attraction.id}
                        attraction={attraction}
                        isSelected={selectedAttractions.has(attraction.id)}
                        stickerIcon={attractionStickers[attraction.id] ? getStickerIcon(attractionStickers[attraction.id]) : null}
                        timeSlot={attractionTimeSlots[attraction.id]}
                        onSelect={() => handleSelectAttraction(attraction)}
                        onShowStickerSelector={() => setShowStickerSelector(attraction.id)}
                        onShowTimeSlotSelector={() => setShowTimeSlotSelector(attraction.id)}
                      />
                    ))}
                  </div>
                </div>
              )}
            </>
          )}
        </div>

        {showStickerSelector && (
          <StickerSelector
            attractionId={showStickerSelector}
            stickers={stickers}
            onSelect={(stickerId) => handleAssignSticker(showStickerSelector, stickerId)}
            onClose={() => setShowStickerSelector(null)}
          />
        )}

        {showTimeSlotSelector && (
          <TimeSlotSelector
            attractionId={showTimeSlotSelector}
            onSelect={(timeSlot) => handleAssignTimeSlot(showTimeSlotSelector, timeSlot)}
            onClose={() => setShowTimeSlotSelector(null)}
          />
        )}

        <div className="p-6 border-t border-gray-200/50 dark:border-gray-700/50">
          <div className="flex justify-between items-center">
            <span className="text-gray-600 dark:text-gray-400">
              {showSuccessPage ? `已选择 ${successRouteData?.selectedCount || 0} 个景点` : `已选择 ${selectedAttractions.size} 个景点`}
            </span>
            {showSuccessPage ? (
              <button
                onClick={onClose}
                className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-semibold"
              >
                查看路线
              </button>
            ) : (
              <button
                onClick={handleCreateRoute}
                disabled={selectedAttractions.size === 0}
                className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors font-semibold"
              >
                创建路线
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

interface AttractionCardProps {
  attraction: Attraction;
  isSelected: boolean;
  stickerIcon: React.ReactNode;
  timeSlot?: string;
  onSelect: () => void;
  onShowStickerSelector: () => void;
  onShowTimeSlotSelector: () => void;
}

const AttractionCard: React.FC<AttractionCardProps> = ({
  attraction,
  isSelected,
  stickerIcon,
  timeSlot,
  onSelect,
  onShowStickerSelector,
  onShowTimeSlotSelector
}) => {
  return (
    <div
      className={`bg-white/70 dark:bg-gray-800/70 backdrop-blur-xl rounded-2xl shadow-lg overflow-hidden cursor-pointer transition-all hover:shadow-2xl ${
        isSelected ? 'ring-2 ring-blue-500' : ''
      }`}
    >
      <div className="relative h-40 bg-gray-200">
        <img
          src={attraction.image}
          alt={attraction.name}
          className="w-full h-full object-cover"
        />
        <div className="absolute top-2 right-2 bg-white/80 dark:bg-gray-800/80 backdrop-blur-xl rounded-full p-2 shadow">
          <Star className="w-4 h-4 text-yellow-500" />
        </div>
        {stickerIcon && (
          <div className="absolute bottom-2 right-2 bg-white/80 dark:bg-gray-800/80 backdrop-blur-xl rounded-full p-2 shadow">
            {stickerIcon}
          </div>
        )}
      </div>
      <div className="p-4">
        <div className="flex justify-between items-start mb-2">
          <h4 className="font-semibold text-gray-900 dark:text-white">{attraction.name}</h4>
          <span className="text-sm text-gray-600 dark:text-gray-400">
            {attraction.rating.toFixed(1)}
          </span>
        </div>
        <p className="text-sm text-gray-600 dark:text-gray-400 mb-2 overflow-hidden" style={{ display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical' }}>
          {attraction.description}
        </p>
        <div className="flex items-center gap-2 mb-3">
          <MapPin className="w-4 h-4 text-gray-500" />
          <span className="text-xs text-gray-500 dark:text-gray-400 truncate">
            {attraction.address}
          </span>
        </div>
        {isSelected && (
          <div className="flex gap-2 mb-3">
            <button
              onClick={onShowTimeSlotSelector}
              className="flex-1 py-2 px-3 bg-purple-100 dark:bg-purple-900/50 text-purple-700 dark:text-purple-300 rounded-lg text-sm font-medium hover:bg-purple-200 dark:hover:bg-purple-800/50 transition-colors"
            >
              {timeSlot || '上午'}
            </button>
          </div>
        )}
        <div className="flex gap-2">
          <button
            onClick={onSelect}
            className={`flex-1 py-2 px-4 rounded-xl text-sm font-medium transition-colors ${
              isSelected
                ? 'bg-blue-600 text-white'
                : 'bg-gray-100 dark:bg-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-500'
            }`}
          >
            {isSelected ? '已选择' : '选择'}
          </button>
          {isSelected && (
            <button
              onClick={onShowStickerSelector}
              className="px-4 py-2 bg-green-100 dark:bg-green-900/50 text-green-700 dark:text-green-300 rounded-xl text-sm font-medium hover:bg-green-200 dark:hover:bg-green-800/50 transition-colors"
            >
              贴纸
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

interface StickerSelectorProps {
  attractionId: string;
  stickers: Array<{ id: string; name: string; url: string }>;
  onSelect: (stickerId: string) => void;
  onClose: () => void;
}

const StickerSelector: React.FC<StickerSelectorProps> = ({
  stickers,
  onSelect,
  onClose
}) => {
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-md w-full p-6">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-xl font-bold text-gray-800 dark:text-white">选择贴纸</h3>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full transition-colors"
          >
            <X className="w-5 h-5 text-gray-600 dark:text-gray-400" />
          </button>
        </div>
        <div className="grid grid-cols-4 gap-4">
          {stickers.map(sticker => (
            <button
              key={sticker.id}
              onClick={() => onSelect(sticker.id)}
              className="flex flex-col items-center p-4 bg-gray-50 dark:bg-gray-700 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors"
            >
              {sticker.id === 'sticker1' && <MapPin className="w-8 h-8 text-blue-600 mb-2" />}
              {sticker.id === 'sticker2' && <Star className="w-8 h-8 text-yellow-600 mb-2" />}
              {sticker.id === 'sticker3' && <Plus className="w-8 h-8 text-green-600 mb-2" />}
              {sticker.id === 'sticker4' && <Check className="w-8 h-8 text-purple-600 mb-2" />}
              <span className="text-xs text-gray-700 dark:text-gray-300">{sticker.name}</span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};

interface TimeSlotSelectorProps {
  attractionId: string;
  onSelect: (timeSlot: string) => void;
  onClose: () => void;
}

const TimeSlotSelector: React.FC<TimeSlotSelectorProps> = ({
  onSelect,
  onClose
}) => {
  const timeSlots = [
    { value: '上午', label: '上午', icon: '🌞' },
    { value: '下午', label: '下午', icon: '🌙' }
  ];

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-md w-full p-6">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-xl font-bold text-gray-800 dark:text-white">选择时间</h3>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full transition-colors"
          >
            <X className="w-5 h-5 text-gray-600 dark:text-gray-400" />
          </button>
        </div>
        <div className="grid grid-cols-2 gap-4">
          {timeSlots.map(slot => (
            <button
              key={slot.value}
              onClick={() => onSelect(slot.value)}
              className="flex flex-col items-center p-6 bg-gray-50 dark:bg-gray-700 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors"
            >
              <span className="text-4xl mb-2">{slot.icon}</span>
              <span className="text-lg font-medium text-gray-700 dark:text-gray-300">{slot.label}</span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};

export default RouteCreator;