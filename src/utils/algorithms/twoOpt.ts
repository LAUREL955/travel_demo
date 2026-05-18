import { calculateDistance } from './nearestNeighbor';

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

// 计算路线的总距离
export const calculateTotalDistance = (route: LocationWithCoordinates[]): number => {
  let totalDistance = 0;
  for (let i = 0; i < route.length - 1; i++) {
    totalDistance += calculateDistance(
      { latitude: route[i].latitude, longitude: route[i].longitude },
      { latitude: route[i + 1].latitude, longitude: route[i + 1].longitude }
    );
  }
  return totalDistance;
};

// 2-opt算法优化
export const twoOptAlgorithm = (route: LocationWithCoordinates[]): LocationWithCoordinates[] => {
  let improved = true;
  let bestRoute = [...route];
  let bestDistance = calculateTotalDistance(bestRoute);

  while (improved) {
    improved = false;

    for (let i = 0; i < bestRoute.length - 1; i++) {
      for (let j = i + 1; j < bestRoute.length; j++) {
        // 生成新路线
        const newRoute = [...bestRoute];
        // 反转i到j之间的路线
        newRoute.splice(i, j - i + 1, ...bestRoute.slice(i, j + 1).reverse());
        
        // 计算新路线的距离
        const newDistance = calculateTotalDistance(newRoute);
        
        // 如果新路线更优，则更新
        if (newDistance < bestDistance) {
          bestRoute = newRoute;
          bestDistance = newDistance;
          improved = true;
        }
      }
    }
  }

  return bestRoute;
};