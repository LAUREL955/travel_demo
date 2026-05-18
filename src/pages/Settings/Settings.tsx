import React from 'react';

const Settings: React.FC = () => {
  return (
    <div className="flex flex-col h-screen bg-white">
      {/* 顶部标题栏 */}
      <header className="bg-white shadow-sm py-3 px-4 flex items-center">
        <button className="mr-4">返回</button>
        <h1 className="text-xl font-bold text-black">设置</h1>
      </header>

      {/* 设置选项 */}
      <div className="flex-1 p-4">
        <div className="mb-6">
          <h2 className="text-lg font-semibold mb-3 text-black">地图服务</h2>
          <div className="space-y-2">
            <div className="flex items-center justify-between p-3 border border-gray-200 rounded-md">
              <span>高德地图</span>
              <input type="radio" name="mapService" defaultChecked />
            </div>
            <div className="flex items-center justify-between p-3 border border-gray-200 rounded-md">
              <span>百度地图</span>
              <input type="radio" name="mapService" />
            </div>
          </div>
        </div>

        <div className="mb-6">
          <h2 className="text-lg font-semibold mb-3 text-black">路线规划偏好</h2>
          <div className="space-y-2">
            <div className="flex items-center justify-between p-3 border border-gray-200 rounded-md">
              <span>最快路线</span>
              <input type="radio" name="routePreference" defaultChecked />
            </div>
            <div className="flex items-center justify-between p-3 border border-gray-200 rounded-md">
              <span>最短路线</span>
              <input type="radio" name="routePreference" />
            </div>
          </div>
        </div>

        <div className="mb-6">
          <h2 className="text-lg font-semibold mb-3 text-black">单位设置</h2>
          <div className="space-y-2">
            <div className="flex items-center justify-between p-3 border border-gray-200 rounded-md">
              <span>公里</span>
              <input type="radio" name="unit" defaultChecked />
            </div>
            <div className="flex items-center justify-between p-3 border border-gray-200 rounded-md">
              <span>英里</span>
              <input type="radio" name="unit" />
            </div>
          </div>
        </div>

        <div className="mb-6">
          <h2 className="text-lg font-semibold mb-3 text-black">个性化设置</h2>
          <div className="space-y-2">
            <div className="flex items-center justify-between p-3 border border-gray-200 rounded-md">
              <span>启用贴纸</span>
              <input type="checkbox" defaultChecked />
            </div>
            <div className="flex items-center justify-between p-3 border border-gray-200 rounded-md">
              <span>启用颜色自定义</span>
              <input type="checkbox" defaultChecked />
            </div>
          </div>
        </div>

        <div className="mb-6">
          <button className="w-full bg-black text-white py-2 px-4 rounded-md hover:bg-gray-800 transition-colors">
            清除缓存
          </button>
        </div>
      </div>
    </div>
  );
};

export default Settings;