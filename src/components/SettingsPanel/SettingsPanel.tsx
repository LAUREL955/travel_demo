import React, { useCallback } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { setTheme, setSelectedColor } from '../../store/slices/routeSlice';
import { RootState } from '../../store';
import { X, Sun, Moon } from 'lucide-react';
import { cacheManager } from '../../utils/cacheManager';

interface SettingsPanelProps {
  onClose: () => void;
}

const SettingsPanel: React.FC<SettingsPanelProps> = ({ onClose }) => {
  const dispatch = useDispatch();
  const { theme, selectedColor } = useSelector((state: RootState) => state.route);

  const colors = [
    '#3B82F6', '#EF4444', '#10B981', '#F59E0B', '#8B5CF6', '#EC4899'
  ];

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

  const handleColorSelect = useCallback((color: string) => {
    dispatch(setSelectedColor(color));
    cacheManager.set('selectedColor', color, 86400000);
    
    document.documentElement.style.setProperty('--primary-color', color);
    document.documentElement.style.setProperty('--primary-color-hover', adjustColorBrightness(color, -10));
  }, [dispatch]);

  const adjustColorBrightness = (hex: string, percent: number): string => {
    const num = parseInt(hex.replace('#', ''), 16);
    const amt = Math.round(2.55 * percent);
    const R = (num >> 16) + amt;
    const G = (num >> 8 & 0x00FF) + amt;
    const B = (num & 0x0000FF) + amt;
    return '#' + (0x1000000 + 
      (R < 255 ? R < 1 ? 0 : R : 255) * 0x10000 + 
      (G < 255 ? G < 1 ? 0 : G : 255) * 0x100 + 
      (B < 255 ? B < 1 ? 0 : B : 255)
    ).toString(16).slice(1);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-md w-full max-h-[90vh] overflow-hidden flex flex-col">
        <div className="p-6 border-b border-gray-200 dark:border-gray-700">
          <div className="flex justify-between items-center">
            <h2 className="text-2xl font-bold text-gray-800 dark:text-white">设置</h2>
            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full transition-colors"
            >
              <X className="w-6 h-6 text-gray-600 dark:text-gray-400" />
            </button>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          <div>
            <h3 className="text-lg font-semibold text-gray-800 dark:text-white mb-4">主题设置</h3>
            <button
              onClick={handleThemeToggle}
              className="w-full flex items-center justify-center gap-3 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 text-gray-800 dark:text-white font-semibold py-4 px-6 rounded-xl transition-colors"
            >
              {theme === 'light' ? (
                <>
                  <Moon className="w-6 h-6" />
                  切换到深色模式
                </>
              ) : (
                <>
                  <Sun className="w-6 h-6" />
                  切换到浅色模式
                </>
              )}
            </button>
          </div>

          <div>
            <h3 className="text-lg font-semibold text-gray-800 dark:text-white mb-4">个性化设置</h3>
            <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-6">
              <h4 className="text-md font-medium text-gray-700 dark:text-gray-300 mb-4">选择主题颜色</h4>
              <div className="flex flex-wrap gap-3">
                {colors.map((color) => (
                  <button
                    key={color}
                    onClick={() => handleColorSelect(color)}
                    className={`w-12 h-12 rounded-full transition-all transform hover:scale-110 ${
                      selectedColor === color ? 'ring-4 ring-offset-2 ring-blue-500' : ''
                    }`}
                    style={{ backgroundColor: color }}
                    aria-label={`选择颜色 ${color}`}
                  />
                ))}
              </div>
            </div>
          </div>

          <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-4">
            <h4 className="text-sm font-semibold text-blue-800 dark:text-blue-300 mb-2">关于应用</h4>
            <p className="text-xs text-blue-600 dark:text-blue-400">
              旅行路线规划小程序 - 基于最近路线原则的智能路线规划应用
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SettingsPanel;