import React, { useState, useEffect } from 'react';

interface OverrideModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (newName: string) => void;
  title: string; // 提示要修改的是寶可夢還是招式
  originalEnName: string; // 英文原文，供對照
  currentZhName: string; // 目前的中文翻譯
}

export const OverrideModal: React.FC<OverrideModalProps> = ({
  isOpen,
  onClose,
  onSave,
  title,
  originalEnName,
  currentZhName,
}) => {
  const [inputValue, setInputValue] = useState('');

  // 當彈窗打開時，把目前的翻譯帶入輸入框
  useEffect(() => {
    if (isOpen) {
      setInputValue(currentZhName);
    }
  }, [isOpen, currentZhName]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-gray-900/60 backdrop-blur-sm transition-opacity">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm overflow-hidden flex flex-col animate-fade-in-up">
        
        <div className="px-6 py-4 border-b border-gray-100 bg-gray-50">
          <h3 className="text-lg font-bold text-gray-800">編輯{title}翻譯</h3>
          <p className="text-xs text-gray-500 mt-1">英文原文：{originalEnName}</p>
        </div>

        <div className="p-6 flex flex-col gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              自訂中文名稱
            </label>
            <input
              type="text"
              autoFocus
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              placeholder="請輸入正確的中文名稱..."
              className="w-full px-4 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
            />
            <p className="text-[11px] text-gray-400 mt-2">
              💡 提示：若將此欄位留白並儲存，將會清除自訂紀錄並恢復系統預設翻譯。
            </p>
          </div>
        </div>

        <div className="px-6 py-4 border-t border-gray-100 bg-gray-50 flex justify-end gap-3">
          <button
            onClick={onClose}
            className="px-4 py-2 text-sm font-bold text-gray-600 bg-white border border-gray-300 hover:bg-gray-100 rounded-xl transition-colors"
          >
            取消
          </button>
          <button
            onClick={() => onSave(inputValue)}
            className="px-4 py-2 text-sm font-bold text-white bg-blue-600 hover:bg-blue-700 rounded-xl shadow-sm transition-colors"
          >
            儲存變更
          </button>
        </div>
        
      </div>
    </div>
  );
};
