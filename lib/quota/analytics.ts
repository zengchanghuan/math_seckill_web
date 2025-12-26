/**
 * 埋点管理器
 */

type EventName = 
  | 'mcq_click'
  | 'mcq_cache_hit'
  | 'mcq_cache_miss'
  | 'mcq_generate_success'
  | 'mcq_generate_fail'
  | 'mcq_quota_deduct_success'
  | 'paywall_open'
  | 'unlock_success';

interface EventData {
  questionId?: string;
  reason?: string; // 失败原因：timeout/json_invalid/judge_fail/network_error
  quotaRemaining?: number;
  plan?: string;
  [key: string]: any;
}

// 埋点函数
export function trackEvent(event: EventName, data?: EventData): void {
  const timestamp = Date.now();
  const payload = {
    event,
    timestamp,
    data: data || {},
  };

  // 控制台输出（开发环境）
  if (process.env.NODE_ENV === 'development') {
    console.log('[Analytics]', payload);
  }

  // 保存到localStorage用于调试/统计
  try {
    const logs = getEventLogs();
    logs.push(payload);
    
    // 只保留最近1000条
    if (logs.length > 1000) {
      logs.splice(0, logs.length - 1000);
    }
    
    localStorage.setItem('analytics_logs', JSON.stringify(logs));
  } catch (e) {
    console.error('保存埋点失败:', e);
  }

  // TODO: 发送到真实的分析服务（如Google Analytics、Mixpanel等）
  // 示例：
  // if (typeof window !== 'undefined' && window.gtag) {
  //   window.gtag('event', event, data);
  // }
}

// 获取事件日志
export function getEventLogs(): any[] {
  if (typeof window === 'undefined') return [];
  
  try {
    const stored = localStorage.getItem('analytics_logs');
    return stored ? JSON.parse(stored) : [];
  } catch (e) {
    return [];
  }
}

// 清空日志
export function clearEventLogs(): void {
  if (typeof window === 'undefined') return;
  localStorage.removeItem('analytics_logs');
}

// 获取统计摘要
export function getEventStats(): Record<EventName, number> {
  const logs = getEventLogs();
  const stats: Record<string, number> = {};

  for (const log of logs) {
    const event = log.event as EventName;
    stats[event] = (stats[event] || 0) + 1;
  }

  return stats as Record<EventName, number>;
}



