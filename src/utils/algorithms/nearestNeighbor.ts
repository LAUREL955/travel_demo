import { Destination } from '../../types';

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

// 计算两点之间的距离（使用Haversine公式）
export const calculateDistance = (point1: Coordinates, point2: Coordinates): number => {
  const R = 6371; // 地球半径（公里）
  const dLat = toRad(point2.latitude - point1.latitude);
  const dLon = toRad(point2.longitude - point1.longitude);
  const lat1 = toRad(point1.latitude);
  const lat2 = toRad(point2.latitude);

  const a = Math.sin(dLat/2) * Math.sin(dLat/2) +
    Math.sin(dLon/2) * Math.sin(dLon/2) * Math.cos(lat1) * Math.cos(lat2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
  const distance = R * c;
  return distance;
};

const toRad = (value: number): number => {
  return value * Math.PI / 180;
};

// 最近邻算法实现
export const nearestNeighborAlgorithm = (startPoint: Coordinates, destinations: LocationWithCoordinates[]): LocationWithCoordinates[] => {
  const unvisited = [...destinations];
  const route: LocationWithCoordinates[] = [];
  let currentPoint = startPoint;

  while (unvisited.length > 0) {
    let nearestIndex = 0;
    let nearestDistance = calculateDistance(currentPoint, {
      latitude: unvisited[0].latitude,
      longitude: unvisited[0].longitude
    });

    for (let i = 1; i < unvisited.length; i++) {
      const distance = calculateDistance(currentPoint, {
        latitude: unvisited[i].latitude,
        longitude: unvisited[i].longitude
      });

      if (distance < nearestDistance) {
        nearestDistance = distance;
        nearestIndex = i;
      }
    }

    const nearestDestination = unvisited.splice(nearestIndex, 1)[0];
    route.push(nearestDestination);
    currentPoint = {
      latitude: nearestDestination.latitude,
      longitude: nearestDestination.longitude
    };
  }

  return route;
};