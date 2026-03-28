/**
 * 格式化时间为相对时间或绝对时间
 * 今天：显示具体时间（如 14:30）
 * 昨天：显示 "昨天 14:30"
 * 一周内：显示 "X天前"
 * 超过一周：显示日期（如 2024-03-19）
 */
export function formatTimeAgo(dateString: string): string {
  const date = new Date(dateString);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);

  // 今天
  if (date.toDateString() === now.toDateString()) {
    if (diffMins < 1) return '刚刚';
    if (diffMins < 60) return `${diffMins}分钟前`;
    return `${diffHours}小时前`;
  }

  // 昨天
  const yesterday = new Date(now);
  yesterday.setDate(yesterday.getDate() - 1);
  if (date.toDateString() === yesterday.toDateString()) {
    return `昨天 ${formatTime(date)}`;
  }

  // 一周内
  if (diffDays < 7) {
    return `${diffDays}天前`;
  }

  // 超过一周，显示日期
  return formatDate(date);
}

function formatTime(date: Date): string {
  return date.toLocaleTimeString('zh-CN', {
    hour: '2-digit',
    minute: '2-digit',
  });
}

function formatDate(date: Date): string {
  const now = new Date();
  const year = date.getFullYear();
  const currentYear = now.getFullYear();
  
  if (year === currentYear) {
    return date.toLocaleDateString('zh-CN', {
      month: '2-digit',
      day: '2-digit',
    });
  }
  
  return date.toLocaleDateString('zh-CN', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  });
}
