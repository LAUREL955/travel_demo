import { Destination, UserLocation } from '../../types';
import { nearestNeighborAlgorithm } from './nearestNeighbor';
import { twoOptAlgorithm } from './twoOpt';

interface Coordinates {
  latitude: number;
  longitude: number;
}

interface LocationWithCoordinates extends Coordinates {
  id: string;
  name: string;
  description?: string;
  [key: string]: any; // 允许其他属性
}

// 综合路线规划算法
export const planOptimalRoute = (startPoint: UserLocation, destinations: Destination[]): Destination[] => {
  // 使用最近邻算法生成初始路线
  const initialRoute = nearestNeighborAlgorithm(startPoint, destinations);
  
  // 使用2-opt算法优化路线
  const optimizedRoute = twoOptAlgorithm(initialRoute);
  
  return optimizedRoute as Destination[];
};