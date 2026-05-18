export interface Destination {
  id: string;
  name: string;
  latitude: number;
  longitude: number;
  description?: string;
  duration?: number; // 预计停留时间（分钟）
  priority?: number; // 优先级（1-5）
  stickerId?: string; // 贴纸ID
  color?: string; // 颜色
}

export interface Route {
  id: string;
  name: string;
  destinations: Destination[];
  totalDistance: number;
  totalDuration: number;
  createdAt: string;
  updatedAt: string;
  backgroundColor?: string; // 背景颜色
  stickerId?: string; // 路线贴纸
}

export interface UserLocation {
  latitude: number;
  longitude: number;
  accuracy?: number;
}

export interface Sticker {
  id: string;
  name: string;
  url: string;
}