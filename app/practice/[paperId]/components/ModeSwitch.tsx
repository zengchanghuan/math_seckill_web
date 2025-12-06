'use client';

interface ModeSwitchProps {
  currentMode: 'objective' | 'solution';
  onModeChange: (mode: 'objective' | 'solution') => void;
}

export default function ModeSwitch({ currentMode, onModeChange }: ModeSwitchProps) {
  return (
    <div className="flex items-center space-x-2 bg-gray-100 dark:bg-gray-700 p-1 rounded-lg">
      <button
        onClick={() => onModeChange('objective')}
        className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
          currentMode === 'objective'
            ? 'bg-white dark:bg-gray-800 text-primary-600 dark:text-primary-400 shadow-sm'
            : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200'
        }`}
      >
        客观题（选择 + 填空）
      </button>
      <button
        onClick={() => onModeChange('solution')}
        className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
          currentMode === 'solution'
            ? 'bg-white dark:bg-gray-800 text-primary-600 dark:text-primary-400 shadow-sm'
            : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200'
        }`}
      >
        解答题
      </button>
    </div>
  );
}
