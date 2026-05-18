import React, { useMemo } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { RootState } from '../../store';
import { removeDestination } from '../../store/slices/routeSlice';
import { Destination } from '../../types';
import { VirtualList } from '../VirtualList/VirtualList';
import { useDebounce } from '../../utils/eventOptimizer';

const DestinationList: React.FC = () => {
  const { destinations } = useSelector((state: RootState) => state.route);
  const dispatch = useDispatch();

  const handleRemove = useDebounce((id: string) => {
    dispatch(removeDestination(id));
  }, 300);

  const renderDestination = useMemo(() => {
    return (dest: Destination) => (
      <li 
        className="flex justify-between items-center py-2 border-b border-gray-100"
        style={{ borderLeft: dest.color ? `4px solid ${dest.color}` : '4px solid #000' }}
      >
        <div className="flex items-center">
          {dest.stickerId && (
            <div className="mr-3 w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center">
              <span className="text-sm">贴纸</span>
            </div>
          )}
          <div>
            <h4 className="font-medium text-black">{dest.name}</h4>
            {dest.description && (
              <p className="text-sm text-gray-500">{dest.description}</p>
            )}
          </div>
        </div>
        <button 
          onClick={() => handleRemove(dest.id)}
          className="text-red-500 hover:text-red-700 transition-colors"
        >
          删除
        </button>
      </li>
    );
  }, [handleRemove]);

  const keyExtractor = (dest: Destination) => dest.id;

  if (destinations.length === 0) {
    return (
      <div className="bg-white rounded-t-lg shadow-lg p-4">
        <h3 className="text-lg font-semibold mb-3 text-black">目的地</h3>
        <p className="text-gray-500 text-center py-4">请添加目的地</p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-t-lg shadow-lg p-4">
      <h3 className="text-lg font-semibold mb-3 text-black">目的地</h3>
      <VirtualList
        items={destinations}
        itemHeight={80}
        containerHeight={240}
        renderItem={renderDestination}
        keyExtractor={keyExtractor}
      />
    </div>
  );
};

export default DestinationList;