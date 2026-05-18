import React, { useEffect, useState, useCallback } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { 
  setUserLocation, 
  setStickers, 
  setTheme, 
  setSearchQuery, 
  setShowSettings, 
  setSelectedColor,
  setUserPreferences,
  setParsedInputData,
  setShowNaturalLanguageInput,
  setShowPreferenceSettings,
  setShowPersonalizedItinerary,
  setShowRouteHistory,
  addRouteToHistory,
  setCurrentRoute,
  setAuthenticated,
  setUser,
  setShowAuth
} from '../../store/slices/routeSlice';
import { RootState } from '../../store';
import { cacheManager } from '../../utils/cacheManager';
import { performanceMonitor } from '../../utils/performanceMonitor';
import { 
  Settings, 
  Search, 
  Plus, 
  Sun, 
  Moon,
  MapPin,
  Navigation,
  Star,
  ShoppingBag,
  Home as HomeIcon,
  Sparkles,
  X,
  ChevronRight
} from 'lucide-react';
import RouteCreator from '../../components/RouteCreator/RouteCreator';
import SettingsPanel from '../../components/SettingsPanel/SettingsPanel';
import NaturalLanguageInput from '../../components/NaturalLanguageInput/NaturalLanguageInput';
import PreferenceSettings from '../../components/PreferenceSettings/PreferenceSettings';
import PersonalizedItinerary from '../../components/PersonalizedItinerary/PersonalizedItinerary';
import AuthPage from '../Auth/AuthPage';

const Home: React.FC = () => {
  const dispatch = useDispatch();
  const { 
    userLocation, 
    stickers, 
    theme, 
    searchQuery, 
    showSettings,
    currentRoute,
    userPreferences,
    showNaturalLanguageInput,
    showPreferenceSettings,
    showPersonalizedItinerary,
    parsedInputData,
    routeHistory,
    showRouteHistory,
    isAuthenticated,
    user,
    showAuth
  } = useSelector((state: RootState) => state.route);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showRouteCreator, setShowRouteCreator] = useState(false);
  const [locationInfo, setLocationInfo] = useState<{ city: string; province: string } | null>(null);
  const [selectedAttraction, setSelectedAttraction] = useState<any>(null);
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [tempParsedData, setTempParsedData] = useState<any>(null);

  const getUserLocation = useCallback(async () => {
    performanceMonitor.mark('locationFetchStart');
    
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        async (position) => {
          const locationData = {
            latitude: position.coords.latitude,
            longitude: position.coords.longitude,
            accuracy: position.coords.accuracy
          };
          
          dispatch(setUserLocation(locationData));
          cacheManager.set('userLocation', locationData, 3600000);

          try {
            const response = await fetch(
              `https://nominatim.openstreetmap.org/reverse?format=json&lat=${locationData.latitude}&lon=${locationData.longitude}&accept-language=zh-CN`
            );
            const data = await response.json();
            
            if (data.address) {
              const city = data.address.city || data.address.town || data.address.village || '未知城市';
              const province = data.address.state || data.address.province || '未知省份';
              setLocationInfo({ city, province });
              cacheManager.set('locationInfo', { city, province }, 3600000);
            }
          } catch (error) {
            console.error('Error getting location info:', error);
            const cachedLocationInfo = cacheManager.get('locationInfo');
            if (cachedLocationInfo) {
              setLocationInfo(cachedLocationInfo);
            } else {
              setLocationInfo({ city: '北京市', province: '北京市' });
            }
          }
          
          performanceMonitor.mark('locationFetchEnd');
          performanceMonitor.measure('locationFetch', 'locationFetchStart', 'locationFetchEnd');
          
          setIsLoading(false);
        },
        (error) => {
          console.error('Error getting location:', error);
          setError('无法获取位置信息，使用默认位置');
          
          const cachedLocation = cacheManager.get('userLocation');
          if (cachedLocation) {
            dispatch(setUserLocation(cachedLocation));
            console.log('使用缓存的位置数据');
          } else {
            const defaultLocation = {
              latitude: 39.9042,
              longitude: 116.4074
            };
            dispatch(setUserLocation(defaultLocation));
            cacheManager.set('userLocation', defaultLocation, 3600000);
          }

          const cachedLocationInfo = cacheManager.get('locationInfo');
          if (cachedLocationInfo) {
            setLocationInfo(cachedLocationInfo);
          } else {
            setLocationInfo({ city: '北京市', province: '北京市' });
          }

          setIsLoading(false);
        },
        {
          enableHighAccuracy: true,
          timeout: 10000,
          maximumAge: 300000
        }
      );
    } else {
      setError('您的浏览器不支持地理定位');
      setIsLoading(false);
    }
  }, [dispatch]);

  const loadStickers = useCallback(() => {
    performanceMonitor.mark('stickersLoadStart');
    
    const mockStickers = [
      { id: 'sticker1', name: '景点', url: 'https://via.placeholder.com/32' },
      { id: 'sticker2', name: '美食', url: 'https://via.placeholder.com/32' },
      { id: 'sticker3', name: '购物', url: 'https://via.placeholder.com/32' },
      { id: 'sticker4', name: '住宿', url: 'https://via.placeholder.com/32' },
    ];
    
    const cachedStickers = cacheManager.get('stickers');
    if (cachedStickers) {
      dispatch(setStickers(cachedStickers));
      console.log('使用缓存的贴纸数据');
    }
    
    dispatch(setStickers(mockStickers));
    cacheManager.set('stickers', mockStickers, 86400000);
    
    performanceMonitor.mark('stickersLoadEnd');
    performanceMonitor.measure('stickersLoad', 'stickersLoadStart', 'stickersLoadEnd');
  }, [dispatch]);

  useEffect(() => {
    getUserLocation();
    loadStickers();
  }, [getUserLocation, loadStickers]);

  useEffect(() => {
    if (theme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [theme]);

  const handleThemeToggle = useCallback(() => {
    const newTheme = theme === 'light' ? 'dark' : 'light';
    dispatch(setTheme(newTheme));
    
    if (newTheme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
    
    cacheManager.set('theme', newTheme, 86400000);
  }, [theme, dispatch]);

  const handleSearchChange = useCallback(async (e: React.ChangeEvent<HTMLInputElement>) => {
    const query = e.target.value;
    dispatch(setSearchQuery(query));
    
    if (query.trim().length > 0) {
      setIsSearching(true);
      try {
        const response = await fetch(`http://localhost:5000/api/attractions?query=${encodeURIComponent(query)}`);
        const data = await response.json();
        
        if (data.success) {
          setSearchResults(data.data);
        } else {
          setSearchResults([]);
        }
      } catch (error) {
        console.error('搜索失败:', error);
        setSearchResults([]);
      } finally {
        setIsSearching(false);
      }
    } else {
      setSearchResults([]);
    }
  }, [dispatch]);

  const handleCreateRoute = useCallback(() => {
    setShowRouteCreator(true);
  }, []);

  const handleOpenNaturalLanguage = useCallback(() => {
    dispatch(setShowNaturalLanguageInput(true));
  }, [dispatch]);

  const handleParsedData = useCallback((data: any) => {
    dispatch(setShowNaturalLanguageInput(false));
    setTempParsedData(data);
    dispatch(setParsedInputData(data));
    dispatch(setShowPreferenceSettings(true));
  }, [dispatch]);

  const handlePreferenceSave = useCallback((preferences: any) => {
    dispatch(setUserPreferences(preferences));
    dispatch(setShowPreferenceSettings(false));
    dispatch(setShowPersonalizedItinerary(true));
  }, [dispatch]);

  const handleCloseNaturalLanguage = useCallback(() => {
    dispatch(setShowNaturalLanguageInput(false));
  }, [dispatch]);

  const handleClosePreference = useCallback(() => {
    dispatch(setShowPreferenceSettings(false));
  }, [dispatch]);

  const handleCloseItinerary = useCallback(() => {
    dispatch(setShowPersonalizedItinerary(false));
  }, [dispatch]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-screen bg-gray-100 dark:bg-gray-900">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-gray-400">正在加载...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-screen bg-gray-100 dark:bg-gray-900">
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6 max-w-md w-full">
          <h2 className="text-xl font-bold text-red-600 mb-4">加载失败</h2>
          <p className="text-gray-600 dark:text-gray-400 mb-4">{error}</p>
          <button
            onClick={() => {
              setError(null);
              setIsLoading(true);
              getUserLocation();
            }}
            className="w-full bg-blue-600 text-white py-2 px-4 rounded hover:bg-blue-700 transition-colors"
          >
            重试
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className={`min-h-screen transition-colors duration-300 ${theme === 'dark' ? 'dark' : ''}`}>
      <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-100 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 transition-colors duration-300 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-blue-50/30 via-purple-50/20 to-pink-50/30 dark:from-blue-900/10 dark:via-purple-900/10 dark:to-pink-900/10 pointer-events-none" />
        <div className="container mx-auto px-4 py-8 relative z-10">
          <div className="max-w-4xl mx-auto">
            <div className="flex justify-between items-center mb-12">
              <div></div>
              <button
                onClick={() => dispatch(setShowSettings(!showSettings))}
                className="p-3 rounded-2xl bg-white/70 dark:bg-gray-800/70 backdrop-blur-xl border border-white/20 dark:border-gray-700/20 shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105 active:scale-95"
                aria-label="设置"
              >
                <Settings className="w-6 h-6 text-gray-700 dark:text-gray-300" />
              </button>
            </div>

            <div className="flex flex-col items-center justify-center mb-16">
              <div className="relative w-40 h-40 sm:w-48 sm:h-48 md:w-56 md:h-56 mb-8">
                <div className="absolute inset-0 bg-gradient-to-br from-blue-500/20 to-purple-500/20 rounded-3xl blur-2xl" />
                <img
                  src="/logo.svg"
                  alt="旅行路线规划 Logo"
                  className="relative w-full h-full object-contain drop-shadow-2xl"
                />
              </div>
              <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 dark:text-white mb-3 tracking-tight">
                旅行路线规划
              </h1>
              <p className="text-gray-600 dark:text-gray-400 text-center text-lg font-normal">
                发现精彩目的地，规划完美旅程
              </p>
            </div>

            <div className="mb-12">
              <div className="relative max-w-md mx-auto">
                <input
                  type="text"
                  placeholder="搜索景点、美食、住宿..."
                  value={searchQuery}
                  onChange={handleSearchChange}
                  className="w-full px-5 py-4 pl-14 rounded-2xl border border-white/20 dark:border-gray-700/20 bg-white/70 dark:bg-gray-800/70 backdrop-blur-xl text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-transparent transition-all duration-300 shadow-lg hover:shadow-xl text-base"
                />
                <Search className="absolute left-5 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-500 dark:text-gray-400" />
                
                {searchResults.length > 0 && (
                  <div className="absolute top-full left-0 right-0 mt-2 bg-white/90 dark:bg-gray-800/90 backdrop-blur-xl rounded-2xl shadow-2xl border border-white/20 dark:border-gray-700/20 overflow-hidden z-50 max-h-96 overflow-y-auto">
                    {searchResults.map((attraction) => (
                      <div
                        key={attraction.id}
                        onClick={() => setSelectedAttraction(attraction)}
                        className="p-4 hover:bg-white/50 dark:hover:bg-gray-700/50 cursor-pointer transition-colors border-b border-gray-100 dark:border-gray-700/50 last:border-0"
                      >
                        <div className="flex items-start gap-3">
                          <div className="w-16 h-16 rounded-xl overflow-hidden flex-shrink-0">
                            <img
                              src={attraction.image}
                              alt={attraction.name}
                              className="w-full h-full object-cover"
                            />
                          </div>
                          <div className="flex-1 min-w-0">
                            <h4 className="font-semibold text-gray-900 dark:text-white text-base mb-1 truncate">{attraction.name}</h4>
                            <p className="text-sm text-gray-600 dark:text-gray-400 mb-1 overflow-hidden text-ellipsis whitespace-nowrap">{attraction.description}</p>
                            <div className="flex items-center gap-2">
                              <Star className="w-3 h-3 text-yellow-500 fill-current" />
                              <span className="text-xs text-gray-600 dark:text-gray-400">{attraction.rating}</span>
                              <span className="text-xs text-gray-500 dark:text-gray-500">•</span>
                              <span className="text-xs text-gray-500 dark:text-gray-500 truncate">{attraction.address}</span>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
                
                {isSearching && (
                  <div className="absolute top-full left-0 right-0 mt-2 bg-white/90 dark:bg-gray-800/90 backdrop-blur-xl rounded-2xl shadow-2xl border border-white/20 dark:border-gray-700/20 p-4 z-50">
                    <div className="flex items-center justify-center">
                      <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
                      <span className="ml-3 text-sm text-gray-600 dark:text-gray-400">搜索中...</span>
                    </div>
                  </div>
                )}
              </div>
            </div>

            <div className="flex justify-center mb-12">
              <button
                onClick={handleOpenNaturalLanguage}
                className="flex items-center justify-center gap-3 bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white font-semibold py-5 px-8 rounded-2xl shadow-xl hover:shadow-2xl transition-all duration-300 transform hover:scale-105 active:scale-95 backdrop-blur-xl border border-white/20"
              >
                <Sparkles className="w-6 h-6" />
                智能规划行程
              </button>
            </div>

            <div className="mb-12">
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6 tracking-tight">创建路线</h2>
              <button
                onClick={handleCreateRoute}
                className="w-full flex items-center justify-center gap-3 bg-[#007AFF]/80 hover:bg-[#007AFF]/90 text-white font-semibold py-5 px-8 rounded-2xl shadow-xl hover:shadow-2xl transition-all duration-300 transform hover:scale-105 active:scale-95 backdrop-blur-xl border border-white/20"
              >
                <Plus className="w-6 h-6" />
                创建新路线
              </button>
            </div>

            <div className="mb-12">
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6 tracking-tight">热门目的地</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                <div 
                  onClick={() => setSelectedAttraction({
                    id: '1',
                    name: '故宫博物院',
                    description: '中国明清两代的皇家宫殿，世界文化遗产',
                    address: '北京市东城区景山前街4号',
                    rating: 4.8,
                    image: 'https://images.unsplash.com/photo-1599571234909-29ed5d1321d6?w=800&q=80',
                    tags: ['世界遗产', '博物馆', '皇家宫殿']
                  })}
                  className="bg-white/70 dark:bg-gray-800/70 backdrop-blur-xl rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 transform hover:scale-105 active:scale-95 p-6 border border-white/20 dark:border-gray-700/20 cursor-pointer"
                >
                  <div className="flex items-center gap-3 mb-3">
                    <div className="w-10 h-10 bg-blue-500/20 rounded-full flex items-center justify-center">
                      <MapPin className="w-5 h-5 text-blue-600" />
                    </div>
                    <h3 className="font-semibold text-gray-900 dark:text-white text-lg">故宫博物院</h3>
                  </div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">北京市东城区景山前街4号</p>
                </div>

                <div 
                  onClick={() => setSelectedAttraction({
                    id: '2',
                    name: '天坛公园',
                    description: '明清两代皇帝祭天祈谷的场所',
                    address: '北京市东城区天坛路甲1号',
                    rating: 4.7,
                    image: 'https://images.unsplash.com/photo-1508804185872-d7badad00f7d?w=800&q=80',
                    tags: ['世界遗产', '公园', '古建筑']
                  })}
                  className="bg-white/70 dark:bg-gray-800/70 backdrop-blur-xl rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 transform hover:scale-105 active:scale-95 p-6 border border-white/20 dark:border-gray-700/20 cursor-pointer"
                >
                  <div className="flex items-center gap-3 mb-3">
                    <div className="w-10 h-10 bg-blue-500/20 rounded-full flex items-center justify-center">
                      <MapPin className="w-5 h-5 text-blue-600" />
                    </div>
                    <h3 className="font-semibold text-gray-900 dark:text-white text-lg">天坛公园</h3>
                  </div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">北京市东城区天坛路甲1号</p>
                </div>

                <div 
                  onClick={() => setSelectedAttraction({
                    id: '3',
                    name: '颐和园',
                    description: '中国现存规模最大、保存最完整的皇家园林',
                    address: '北京市海淀区新建宫门路19号',
                    rating: 4.6,
                    image: 'https://images.unsplash.com/photo-1563565375-f3fdfdbefa83?w=800&q=80',
                    tags: ['世界遗产', '园林', '湖泊']
                  })}
                  className="bg-white/70 dark:bg-gray-800/70 backdrop-blur-xl rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 transform hover:scale-105 active:scale-95 p-6 border border-white/20 dark:border-gray-700/20 cursor-pointer"
                >
                  <div className="flex items-center gap-3 mb-3">
                    <div className="w-10 h-10 bg-blue-500/20 rounded-full flex items-center justify-center">
                      <MapPin className="w-5 h-5 text-blue-600" />
                    </div>
                    <h3 className="font-semibold text-gray-900 dark:text-white text-lg">颐和园</h3>
                  </div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">北京市海淀区新建宫门路19号</p>
                </div>
              </div>
            </div>

            {(currentRoute || routeHistory.length > 0) && (
              <div className="mb-12">
                <div className="flex gap-4 mb-6">
                  <button
                    onClick={() => dispatch(setShowRouteHistory(false))}
                    className={`px-6 py-3 rounded-xl font-semibold transition-all duration-300 ${
                      !showRouteHistory
                        ? 'bg-gradient-to-r from-blue-500 to-blue-600 text-white shadow-lg'
                        : 'bg-white/70 dark:bg-gray-800/70 text-gray-700 dark:text-gray-300 hover:bg-white/90 dark:hover:bg-gray-700/90'
                    }`}
                  >
                    当前路线
                  </button>
                  <button
                    onClick={() => dispatch(setShowRouteHistory(true))}
                    className={`px-6 py-3 rounded-xl font-semibold transition-all duration-300 ${
                      showRouteHistory
                        ? 'bg-gradient-to-r from-purple-500 to-pink-500 text-white shadow-lg'
                        : 'bg-white/70 dark:bg-gray-800/70 text-gray-700 dark:text-gray-300 hover:bg-white/90 dark:hover:bg-gray-700/90'
                    }`}
                  >
                    历史路线 ({routeHistory.length})
                  </button>
                </div>

                {!showRouteHistory && currentRoute && (
                  <div className="bg-white/70 dark:bg-gray-800/70 backdrop-blur-xl rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 p-8 border border-white/20 dark:border-gray-700/20">
                    <div className="flex justify-between items-center mb-6">
                      <h3 className="text-xl font-bold text-gray-900 dark:text-white">
                        {currentRoute.name}
                      </h3>
                      <div className="flex gap-6 text-sm text-gray-600 dark:text-gray-400">
                        <span className="bg-blue-50 dark:bg-blue-900/30 px-3 py-1 rounded-full text-blue-700 dark:text-blue-300">总距离: {currentRoute.totalDistance} 公里</span>
                        <span className="bg-green-50 dark:bg-green-900/30 px-3 py-1 rounded-full text-green-700 dark:text-green-300">预计时间: {currentRoute.totalDuration} 分钟</span>
                      </div>
                    </div>
                  
                  {(() => {
                    const morningDestinations = currentRoute.destinations.filter(dest => dest.timeSlot === '上午');
                    const afternoonDestinations = currentRoute.destinations.filter(dest => dest.timeSlot === '下午');
                    
                    return (
                      <div className="space-y-8">
                        {morningDestinations.length > 0 && (
                          <div>
                            <div className="flex items-center gap-3 mb-4">
                              <div className="w-10 h-10 bg-gradient-to-br from-orange-400 to-yellow-500 rounded-xl flex items-center justify-center shadow-lg">
                                <Sun className="w-5 h-5 text-white" />
                              </div>
                              <h4 className="text-lg font-bold text-gray-900 dark:text-white">上午行程</h4>
                              <span className="text-sm text-gray-500 dark:text-gray-400">({morningDestinations.length} 个景点)</span>
                            </div>
                            <div className="space-y-3 ml-13">
                              {morningDestinations.map((dest, index) => (
                                <div key={dest.id} className="flex items-start gap-4 p-4 bg-white/30 dark:bg-gray-700/30 rounded-xl hover:bg-white/50 dark:hover:bg-gray-700/50 transition-all duration-300">
                                  <div className="flex-shrink-0 w-10 h-10 bg-gradient-to-br from-orange-400 to-yellow-500 text-white rounded-xl flex items-center justify-center font-bold shadow-lg">
                                    {index + 1}
                                  </div>
                                  <div className="flex-1">
                                    <h5 className="font-semibold text-gray-900 dark:text-white text-lg mb-1">{dest.name}</h5>
                                    <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">{dest.description}</p>
                                    {dest.stickerId && (
                                      <span className="inline-block px-3 py-1 bg-orange-100 dark:bg-orange-900/50 text-orange-700 dark:text-orange-300 text-xs rounded-full font-medium">
                                        {dest.stickerId}
                                      </span>
                                    )}
                                  </div>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}
                        
                        {afternoonDestinations.length > 0 && (
                          <div>
                            <div className="flex items-center gap-3 mb-4">
                              <div className="w-10 h-10 bg-gradient-to-br from-blue-400 to-indigo-500 rounded-xl flex items-center justify-center shadow-lg">
                                <Moon className="w-5 h-5 text-white" />
                              </div>
                              <h4 className="text-lg font-bold text-gray-900 dark:text-white">下午行程</h4>
                              <span className="text-sm text-gray-500 dark:text-gray-400">({afternoonDestinations.length} 个景点)</span>
                            </div>
                            <div className="space-y-3 ml-13">
                              {afternoonDestinations.map((dest, index) => (
                                <div key={dest.id} className="flex items-start gap-4 p-4 bg-white/30 dark:bg-gray-700/30 rounded-xl hover:bg-white/50 dark:hover:bg-gray-700/50 transition-all duration-300">
                                  <div className="flex-shrink-0 w-10 h-10 bg-gradient-to-br from-blue-400 to-indigo-500 text-white rounded-xl flex items-center justify-center font-bold shadow-lg">
                                    {index + 1}
                                  </div>
                                  <div className="flex-1">
                                    <h5 className="font-semibold text-gray-900 dark:text-white text-lg mb-1">{dest.name}</h5>
                                    <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">{dest.description}</p>
                                    {dest.stickerId && (
                                      <span className="inline-block px-3 py-1 bg-blue-100 dark:bg-blue-900/50 text-blue-700 dark:text-blue-300 text-xs rounded-full font-medium">
                                        {dest.stickerId}
                                      </span>
                                    )}
                                  </div>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    );
                  })()}
                </div>
                )}

                {showRouteHistory && (
                  <div className="space-y-4">
                    {routeHistory.length === 0 ? (
                      <div className="bg-white/70 dark:bg-gray-800/70 backdrop-blur-xl rounded-2xl shadow-lg p-8 border border-white/20 dark:border-gray-700/20 text-center">
                        <p className="text-gray-600 dark:text-gray-400">暂无历史路线</p>
                      </div>
                    ) : (
                      routeHistory.map((route, index) => (
                        <div
                          key={route.id}
                          onClick={() => dispatch(setCurrentRoute(route))}
                          className="bg-white/70 dark:bg-gray-800/70 backdrop-blur-xl rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 p-6 border border-white/20 dark:border-gray-700/20 cursor-pointer"
                        >
                          <div className="flex justify-between items-center mb-4">
                            <div className="flex items-center gap-3">
                              <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-pink-500 rounded-xl flex items-center justify-center shadow-lg">
                                <span className="text-white font-bold">{index + 1}</span>
                              </div>
                              <h3 className="text-lg font-bold text-gray-900 dark:text-white">
                                {route.name}
                              </h3>
                            </div>
                            <div className="flex gap-4 text-sm text-gray-600 dark:text-gray-400">
                              <span className="bg-blue-50 dark:bg-blue-900/30 px-3 py-1 rounded-full text-blue-700 dark:text-blue-300">{route.totalDistance} 公里</span>
                              <span className="bg-green-50 dark:bg-green-900/30 px-3 py-1 rounded-full text-green-700 dark:text-green-300">{route.totalDuration} 分钟</span>
                            </div>
                          </div>
                          <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                            {route.destinations.length} 个景点 • {route.destinations.filter(d => d.timeSlot === '上午').length} 个上午景点 • {route.destinations.filter(d => d.timeSlot === '下午').length} 个下午景点
                          </p>
                          
                          {(() => {
                            const morningAttractions = route.destinations.filter(d => d.timeSlot === '上午');
                            const afternoonAttractions = route.destinations.filter(d => d.timeSlot === '下午');
                            
                            return (
                              <div className="space-y-6">
                                {morningAttractions.length > 0 && (
                                  <div>
                                    <div className="flex items-center gap-2 mb-3">
                                      <div className="w-8 h-8 bg-gradient-to-br from-yellow-400 to-yellow-600 rounded-full flex items-center justify-center shadow-lg">
                                        <span className="text-white font-bold">🌞</span>
                                      </div>
                                      <h4 className="font-semibold text-gray-900 dark:text-white">上午行程 ({morningAttractions.length} 个景点)</h4>
                                    </div>
                                    <div className="ml-10 space-y-3">
                                      {morningAttractions.map((destination, idx) => (
                                        <div key={destination.id} className="flex items-start gap-3">
                                          <div className="w-6 h-6 bg-blue-100 dark:bg-blue-900/30 rounded-full flex items-center justify-center flex-shrink-0">
                                            <span className="text-sm font-semibold text-blue-600 dark:text-blue-400">{idx + 1}</span>
                                          </div>
                                          <div>
                                            <h5 className="font-medium text-gray-900 dark:text-white">{destination.name}</h5>
                                            <p className="text-sm text-gray-600 dark:text-gray-400">{destination.description}</p>
                                          </div>
                                        </div>
                                      ))}
                                    </div>
                                  </div>
                                )}
                                
                                {afternoonAttractions.length > 0 && (
                                  <div>
                                    <div className="flex items-center gap-2 mb-3">
                                      <div className="w-8 h-8 bg-gradient-to-br from-orange-400 to-orange-600 rounded-full flex items-center justify-center shadow-lg">
                                        <span className="text-white font-bold">🌙</span>
                                      </div>
                                      <h4 className="font-semibold text-gray-900 dark:text-white">下午行程 ({afternoonAttractions.length} 个景点)</h4>
                                    </div>
                                    <div className="ml-10 space-y-3">
                                      {afternoonAttractions.map((destination, idx) => (
                                        <div key={destination.id} className="flex items-start gap-3">
                                          <div className="w-6 h-6 bg-purple-100 dark:bg-purple-900/30 rounded-full flex items-center justify-center flex-shrink-0">
                                            <span className="text-sm font-semibold text-purple-600 dark:text-purple-400">{idx + 1}</span>
                                          </div>
                                          <div>
                                            <h5 className="font-medium text-gray-900 dark:text-white">{destination.name}</h5>
                                            <p className="text-sm text-gray-600 dark:text-gray-400">{destination.description}</p>
                                          </div>
                                        </div>
                                      ))}
                                    </div>
                                  </div>
                                )}
                              </div>
                            );
                          })()}
                        </div>
                      ))
                    )}
                  </div>
                )}
              </div>
            )}

            <div className="mb-12">
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6 tracking-tight">当前位置</h2>
              <div className="bg-white/70 dark:bg-gray-800/70 backdrop-blur-xl rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 p-8 border border-white/20 dark:border-gray-700/20">
                <div className="flex items-center gap-4 mb-4">
                  <div className="w-12 h-12 bg-gradient-to-br from-green-500 to-green-600 rounded-xl flex items-center justify-center shadow-lg">
                    <Navigation className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <p className="text-xl font-bold text-gray-900 dark:text-white">
                      {locationInfo ? `${locationInfo.province} ${locationInfo.city}` : '正在获取位置信息...'}
                    </p>
                    {locationInfo && (
                      <p className="text-sm text-gray-500 dark:text-gray-400 mt-1 flex items-center gap-1">
                        <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
                        已定位
                      </p>
                    )}
                  </div>
                </div>
                <div className="ml-16 space-y-2">
                  <div className="bg-gray-50 dark:bg-gray-700/50 rounded-lg px-4 py-2">
                    <p className="text-sm text-gray-600 dark:text-gray-400 font-mono">
                      纬度: {userLocation?.latitude?.toFixed(4) || '未知'}
                    </p>
                  </div>
                  <div className="bg-gray-50 dark:bg-gray-700/50 rounded-lg px-4 py-2">
                    <p className="text-sm text-gray-600 dark:text-gray-400 font-mono">
                      经度: {userLocation?.longitude?.toFixed(4) || '未知'}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {routeHistory.length > 0 && (
              <div className="mb-12">
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6 tracking-tight">历史路线记录</h2>
                <div className="space-y-4">
                  {routeHistory.map((route, index) => (
                    <div
                      key={route.id}
                      className="bg-white/70 dark:bg-gray-800/70 backdrop-blur-xl rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 p-6 border border-white/20 dark:border-gray-700/20 cursor-pointer"
                      onClick={() => dispatch(setCurrentRoute(route))}
                    >
                      <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-pink-500 rounded-xl flex items-center justify-center shadow-lg">
                            <span className="text-white font-bold text-sm">{index + 1}</span>
                          </div>
                          <div>
                            <h3 className="font-semibold text-gray-900 dark:text-white">
                              {route.name || `路线 ${index + 1}`}
                            </h3>
                            <p className="text-xs text-gray-500 dark:text-gray-400">
                              {new Date(route.createdAt).toLocaleDateString('zh-CN', {
                                year: 'numeric',
                                month: 'long',
                                day: 'numeric',
                                hour: '2-digit',
                                minute: '2-digit'
                              })}
                            </p>
                          </div>
                        </div>
                        <ChevronRight className="w-5 h-5 text-gray-400" />
                      </div>
                      <div className="ml-13 flex items-center gap-4 text-sm">
                        <span className="px-3 py-1 bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 rounded-full font-medium">
                          {route.destinations.length} 个景点
                        </span>
                        <span className="px-3 py-1 bg-green-50 dark:bg-green-900/30 text-green-700 dark:text-green-300 rounded-full font-medium">
                          {route.totalDistance} 公里
                        </span>
                        <span className="px-3 py-1 bg-orange-50 dark:bg-orange-900/30 text-orange-700 dark:text-orange-300 rounded-full font-medium">
                          {route.totalDuration} 分钟
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div className="text-center text-gray-600 dark:text-gray-400 text-sm">
              <p>© 2024 旅行路线规划. All rights reserved.</p>
            </div>
          </div>
        </div>
      </div>
      
      {showRouteCreator && (
        <RouteCreator onClose={() => setShowRouteCreator(false)} />
      )}
      
      {showSettings && (
        <SettingsPanel onClose={() => dispatch(setShowSettings(false))} />
      )}
      
      {selectedAttraction && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4" onClick={() => setSelectedAttraction(null)}>
          <div className="bg-white/90 dark:bg-gray-800/90 backdrop-blur-2xl rounded-3xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-hidden border border-white/20 dark:border-gray-700/20" onClick={(e) => e.stopPropagation()}>
            <div className="relative h-64 sm:h-80">
              <img
                src={selectedAttraction.image}
                alt={selectedAttraction.name}
                className="w-full h-full object-cover"
              />
              <button
                onClick={() => setSelectedAttraction(null)}
                className="absolute top-4 right-4 w-10 h-10 bg-white/80 dark:bg-gray-800/80 backdrop-blur-xl rounded-full flex items-center justify-center shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-110"
              >
                <X className="w-5 h-5 text-gray-700 dark:text-gray-300" />
              </button>
              <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/60 to-transparent p-6">
                <h2 className="text-2xl sm:text-3xl font-bold text-white mb-2">{selectedAttraction.name}</h2>
                <div className="flex items-center gap-2">
                  <Star className="w-5 h-5 text-yellow-400 fill-current" />
                  <span className="text-white font-semibold">{selectedAttraction.rating}</span>
                </div>
              </div>
            </div>
            
            <div className="p-6 sm:p-8 overflow-y-auto max-h-[calc(90vh-20rem)]">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-12 h-12 bg-blue-500/20 rounded-full flex items-center justify-center">
                  <MapPin className="w-6 h-6 text-blue-600" />
                </div>
                <div>
                  <p className="text-sm text-gray-500 dark:text-gray-400">地址</p>
                  <p className="text-base font-semibold text-gray-900 dark:text-white">{selectedAttraction.address}</p>
                </div>
              </div>
              
              <div className="mb-6">
                <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-3">景点介绍</h3>
                <p className="text-gray-700 dark:text-gray-300 leading-relaxed">{selectedAttraction.description}</p>
              </div>
              
              <div className="mb-6">
                <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-3">景点类型</h3>
                <div className="flex flex-wrap gap-2">
                  {selectedAttraction.tags && selectedAttraction.tags.map((tag: string, index: number) => (
                    <span key={index} className="px-4 py-2 bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 rounded-full text-sm font-medium">
                      {tag}
                    </span>
                  ))}
                </div>
              </div>
              
              <div className="flex gap-4">
                <button
                  onClick={() => {
                    setSelectedAttraction(null);
                    setShowRouteCreator(true);
                  }}
                  className="flex-1 flex items-center justify-center gap-2 bg-[#007AFF]/80 hover:bg-[#007AFF]/90 text-white font-semibold py-4 px-6 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105 active:scale-95"
                >
                  <Plus className="w-5 h-5" />
                  添加到路线
                </button>
                <button
                  onClick={() => setSelectedAttraction(null)}
                  className="flex-1 bg-white/70 dark:bg-gray-800/70 hover:bg-white/80 dark:hover:bg-gray-700/80 text-gray-700 dark:text-gray-300 font-semibold py-4 px-6 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105 active:scale-95"
                >
                  关闭
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {showNaturalLanguageInput && (
        <NaturalLanguageInput
          onClose={handleCloseNaturalLanguage}
          onParsed={handleParsedData}
        />
      )}

      {showPreferenceSettings && (
        <PreferenceSettings
          onClose={handleClosePreference}
          onSave={handlePreferenceSave}
          initialPreferences={userPreferences || undefined}
        />
      )}

      {showPersonalizedItinerary && (
        <PersonalizedItinerary
          onClose={handleCloseItinerary}
          preferences={userPreferences || {
            attractionTypes: [],
            transportation: [],
            cuisine: [],
            shopping: [],
            physicalLevel: 'medium',
            budget: 'comfort'
          }}
          parsedData={parsedInputData || undefined}
        />
      )}

      {showAuth && !isAuthenticated && (
        <AuthPage
          onClose={() => dispatch(setShowAuth(false))}
          onLoginSuccess={() => {
            dispatch(setAuthenticated(true));
            dispatch(setShowAuth(false));
          }}
        />
      )}
    </div>
  );
};

export default Home;
