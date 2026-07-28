import React from 'react';

interface UpdateToastProps {
  needRefresh: boolean;
  updateServiceWorker: (reloadPage?: boolean) => Promise<void>;
  closeToast: () => void;
}

export const UpdateToast: React.FC<UpdateToastProps> = ({ 
  needRefresh, 
  updateServiceWorker, 
  closeToast 
}) => {
  if (!needRefresh) return null;

  return (
    <div className="fixed bottom-6 right-6 z-50 bg-white border border-gray-200 shadow-2xl rounded-2xl p-5 max-w-sm w-full">
      <div className="flex flex-col gap-3">
        <div>
          <h3 className="text-gray-900 font-bold text-lg">✨ 發現新版本資料</h3>
          <p className="text-gray-500 text-sm mt-1">
            寶可夢招式與屬性資料庫已有更新，是否立即載入最新資料？
          </p>
        </div>
        <div className="flex gap-3 justify-end mt-2">
          <button 
            onClick={closeToast}
            className="px-4 py-2 text-sm font-bold text-gray-500 bg-gray-100 hover:bg-gray-200 rounded-xl transition-colors"
          >
            稍後再說
          </button>
          <button 
            onClick={() => updateServiceWorker(true)}
            className="px-4 py-2 text-sm font-bold text-white bg-blue-600 hover:bg-blue-700 rounded-xl transition-colors shadow-sm"
          >
            立即更新
          </button>
        </div>
      </div>
    </div>
  );
};
