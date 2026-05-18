import React from 'react';
import { Sticker } from '../../types';

interface StickerSelectorProps {
  stickers: Sticker[];
  selectedStickerId: string | undefined;
  onSelectSticker: (stickerId: string | undefined) => void;
}

const StickerSelector: React.FC<StickerSelectorProps> = ({
  stickers,
  selectedStickerId,
  onSelectSticker,
}) => {
  return (
    <div className="mb-4">
      <label className="block text-sm font-medium text-gray-700 mb-1">
        选择贴纸
      </label>
      <div className="flex gap-2 overflow-x-auto pb-2">
        {stickers.map((sticker) => (
          <div
            key={sticker.id}
            className={`w-12 h-12 rounded-full bg-gray-100 flex items-center justify-center cursor-pointer ${
              selectedStickerId === sticker.id ? 'ring-2 ring-black' : ''
            }`}
            onClick={() => onSelectSticker(selectedStickerId === sticker.id ? undefined : sticker.id)}
          >
            <img src={sticker.url} alt={sticker.name} className="w-8 h-8 object-contain" />
          </div>
        ))}
      </div>
    </div>
  );
};

export default StickerSelector;