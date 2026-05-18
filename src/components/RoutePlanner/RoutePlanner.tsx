import React, { useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { RootState } from '../../store';
import { setCurrentRoute, setLoading, setError } from '../../store/slices/routeSlice';
import { planOptimalRoute } from '../../utils/algorithms/routePlanner';
import { Route } from '../../types';
import ColorPicker from '../ColorPicker/ColorPicker';
import StickerSelector from '../StickerSelector/StickerSelector';

const RoutePlanner: React.FC = () => {
  const { destinations: destinationsList, userLocation, stickers } = useSelector((state: RootState) => state.route);
  const dispatch = useDispatch();
  const [routeName, setRouteName] = useState('我的路线');
  const [routeColor, setRouteColor] = useState('#000000');
  const [stickerId, setStickerId] = useState<string | undefined>(undefined);

  const handlePlanRoute = () => {
    if (destinationsList.length === 0) {
      dispatch(setError('请先添加目的地'));
      return;
    }

    if (!userLocation) {
      dispatch(setError('无法获取您的位置'));
      return;
    }

    dispatch(setLoading(true));

    try {
      const optimizedDestinations = planOptimalRoute(userLocation, destinationsList);
      
      // 计算总距离和时间
      let totalDistance = 0;
      let totalDuration = 0;
      
      // 计算路线总距离和时间（这里简化处理，实际应调用地图API）
      for (let i = 0; i < optimizedDestinations.length - 1; i++) {
        // 实际项目中应调用地图API计算两点之间的距离和时间
        totalDistance += 1; // 简化处理
        totalDuration += 10; // 简化处理
      }

      const newRoute: Route = {
        id: Date.now().toString(),
        name: routeName,
        destinations: optimizedDestinations,
        totalDistance,
        totalDuration,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        backgroundColor: routeColor,
        stickerId,
      };

      dispatch(setCurrentRoute(newRoute));
      dispatch(setError(null));
    } catch (error) {
      dispatch(setError('路线规划失败'));
      console.error('Route planning error:', error);
    } finally {
      dispatch(setLoading(false));
    }
  };

  return (
    <div className="p-4 bg-white">
      <div className="mb-4">
        <label htmlFor="routeName" className="block text-sm font-medium text-gray-700 mb-1">
          路线名称
        </label>
        <input
          type="text"
          id="routeName"
          value={routeName}
          onChange={(e) => setRouteName(e.target.value)}
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-black"
        />
      </div>
      
      <ColorPicker selectedColor={routeColor} onSelectColor={setRouteColor} />
      
      <StickerSelector 
        stickers={stickers} 
        selectedStickerId={stickerId} 
        onSelectSticker={setStickerId} 
      />
      
      <button
        onClick={handlePlanRoute}
        className="w-full bg-black text-white py-2 px-4 rounded-md hover:bg-gray-800 transition-colors"
      >
        规划路线
      </button>
    </div>
  );
};

export default RoutePlanner;