import React, { useEffect, useRef } from 'react';
import { useSelector } from 'react-redux';
import { RootState } from '../../store';
import { initMap, addMarker, drawRoute } from '../../services/map';

const Map: React.FC = () => {
  const mapRef = useRef<HTMLDivElement>(null);
  const { destinations, currentRoute, userLocation } = useSelector((state: RootState) => state.route);

  useEffect(() => {
    if (mapRef.current) {
      const map = initMap(mapRef.current);
      
      // 添加用户位置标记
      if (userLocation) {
        addMarker(map, userLocation.latitude, userLocation.longitude, '您的位置');
      }
      
      // 添加目的地标记
      destinations.forEach(dest => {
        addMarker(map, dest.latitude, dest.longitude, dest.name, dest.stickerId, dest.color);
      });
      
      // 绘制路线
      if (currentRoute) {
        drawRoute(map, currentRoute.destinations, currentRoute.backgroundColor);
      }
    }
  }, [destinations, currentRoute, userLocation]);

  return (
    <div ref={mapRef} className="w-full h-full bg-gray-100"></div>
  );
};

export default Map;