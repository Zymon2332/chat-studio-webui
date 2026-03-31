import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/**
 * 格式化时间为相对时间（如：5 分钟前）
 */
export function formatDistanceToNow(date: Date): string {
  const now = new Date();
  const diffInMs = now.getTime() - date.getTime();
  const diffInSecs = Math.floor(diffInMs / 1000);
  const diffInMins = Math.floor(diffInSecs / 60);
  const diffInHours = Math.floor(diffInMins / 60);
  const diffInDays = Math.floor(diffInHours / 24);

  if (diffInSecs < 60) {
    return '刚刚';
  } else if (diffInMins < 60) {
    return `${diffInMins} 分钟前`;
  } else if (diffInHours < 24) {
    return `${diffInHours} 小时前`;
  } else if (diffInDays < 30) {
    return `${diffInDays} 天前`;
  } else {
    return date.toLocaleDateString('zh-CN');
  }
}
