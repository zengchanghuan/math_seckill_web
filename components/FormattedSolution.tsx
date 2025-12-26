'use client';

import MathText from './MathText';

interface FormattedSolutionProps {
  content: string;
  className?: string;
}

/**
 * 智能格式化数学解析内容
 * - 自动识别小题编号 (1)(2)(3) 并分块显示
 * - 保持公式完整性
 * - 优化排版和可读性
 */
export default function FormattedSolution({ content, className = '' }: FormattedSolutionProps) {
  if (!content) return null;

  // 去掉【精析】标识（由外层组件显示）
  let processedContent = content.replace(/^【精析】\s*/, '');

  // 检测是否有小题编号 (1)(2) 或 （1）（2）
  const hasSubQuestions = /[（(]\d+[）)]/.test(processedContent);

  if (hasSubQuestions) {
    // 按小题编号分割
    const parts = processedContent.split(/(?=[（(]\d+[）)])/);
    
    return (
      <div className={`space-y-4 ${className}`}>
        {parts.map((part, index) => {
          if (!part.trim()) return null;
          
          // 提取小题编号
          const match = part.match(/^[（(](\d+)[）)]\s*/);
          if (match) {
            const questionNum = match[1];
            const questionContent = part.substring(match[0].length);
            
            return (
              <div 
                key={index} 
                className="pl-6 relative border-l-2 border-primary-200 dark:border-primary-800"
              >
                {/* 小题编号 */}
                <div className="absolute -left-[1px] top-0 bg-primary-100 dark:bg-primary-900 text-primary-700 dark:text-primary-300 px-2 py-0.5 rounded-r text-sm font-medium">
                  ({questionNum})
                </div>
                {/* 小题内容 */}
                <div className="pt-7 text-gray-800 dark:text-gray-200 text-base leading-relaxed">
                  <MathText content={questionContent} enhanced={true} />
                </div>
              </div>
            );
          }
          
          // 非小题部分（可能是前言）
          return (
            <div key={index} className="text-gray-800 dark:text-gray-200 text-base leading-relaxed">
              <MathText content={part} enhanced={true} />
            </div>
          );
        })}
      </div>
    );
  }

  // 无小题编号的普通解析
  return (
    <div className={`text-gray-800 dark:text-gray-200 text-base leading-relaxed ${className}`}>
      <MathText content={processedContent} enhanced={true} />
    </div>
  );
}




