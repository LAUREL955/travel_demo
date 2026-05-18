import React from 'react';

interface ColorPickerProps {
  selectedColor: string;
  onSelectColor: (color: string) => void;
}

const ColorPicker: React.FC<ColorPickerProps> = ({
  selectedColor,
  onSelectColor,
}) => {
  const colors = [
    '#000000', // 黑色
    '#FFFFFF', // 白色
    '#FF0000', // 红色
    '#00FF00', // 绿色
    '#0000FF', // 蓝色
    '#FFFF00', // 黄色
    '#FF00FF', // 洋红
    '#00FFFF', // 青色
    '#808080', // 灰色
    '#FFA500', // 橙色
  ];

  return (
    <div className="mb-4">
      <label className="block text-sm font-medium text-gray-700 mb-1">
        选择颜色
      </label>
      <div className="flex gap-2 flex-wrap">
        {colors.map((color) => (
          <div
            key={color}
            className={`w-8 h-8 rounded-full cursor-pointer border-2 ${
              selectedColor === color ? 'border-black' : 'border-transparent'
            }`}
            style={{ backgroundColor: color }}
            onClick={() => onSelectColor(color)}
          />
        ))}
        <input
          type="color"
          value={selectedColor}
          onChange={(e) => onSelectColor(e.target.value)}
          className="w-8 h-8 rounded-full cursor-pointer"
        />
      </div>
    </div>
  );
};

export default ColorPicker;