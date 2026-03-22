// Mock 数据 - 对话页面

// 欢迎语数组（根据时间选择）
export const welcomeMessages = {
  morning: [
    "早上好，今天想完成什么工作？",
    "新的一天开始了，有什么我可以帮您的？",
    "早安！准备好开始创作了吗？",
  ],
  afternoon: [
    "下午好，工作进展顺利吗？",
    "中午好，需要我帮忙处理什么任务？",
    "下午时光，有什么想聊的？",
  ],
  evening: [
    "晚上好，今天过得怎么样？",
    "晚上好，有什么需要总结的吗？",
    "晚上好，准备开始晚间工作了吗？",
  ],
};

// 获取当前时间的欢迎语
export function getWelcomeMessage(): string {
  const hour = new Date().getHours();
  let timeSlot: keyof typeof welcomeMessages = "morning";
  
  if (hour >= 12 && hour < 18) {
    timeSlot = "afternoon";
  } else if (hour >= 18) {
    timeSlot = "evening";
  }
  
  const messages = welcomeMessages[timeSlot];
  return messages[Math.floor(Math.random() * messages.length)];
}

// 最近对话列表
export const recentConversations = [
  {
    id: "1",
    title: "产品需求文档优化",
    lastMessage: "关于AI对话功能的改进建议...",
    timestamp: "昨天 14:30",
    icon: "💬",
  },
  {
    id: "2",
    title: "Python数据分析脚本",
    lastMessage: "帮我写一个自动处理Excel的脚本...",
    timestamp: "昨天 10:15",
    icon: "🐍",
  },
  {
    id: "3",
    title: "前端组件库选型",
    lastMessage: "对比 Ant Design 和 Element Plus...",
    timestamp: "前天 16:45",
    icon: "🎨",
  },
  {
    id: "4",
    title: "Docker部署配置",
    lastMessage: "Nginx反向代理设置问题...",
    timestamp: "3天前",
    icon: "🐳",
  },
];

// 快捷提问建议卡片
export const promptSuggestions = [
  {
    id: "1",
    title: "AI 真的是未来十年市场上涨的主要推动力吗？",
    category: "猜你想聊",
    color: "bg-stone-50 dark:bg-stone-900",
    textColor: "text-stone-700 dark:text-stone-200",
  },
  {
    id: "2",
    title: "很用心创作了，自媒体内容还是没人看是为什么？",
    category: "猜你想聊",
    color: "bg-blue-50 dark:bg-blue-950",
    textColor: "text-blue-700 dark:text-blue-200",
  },
  {
    id: "3",
    title: "离婚后，我让渣男前夫跪地求饶",
    category: "创意视频",
    color: "bg-amber-50 dark:bg-amber-950",
    textColor: "text-amber-700 dark:text-amber-200",
    hasImage: true,
  },
  {
    id: "4",
    title: "周鸿祎称 AI 迎全新进化，普通人该如何抓住新风口？",
    category: "聊热点",
    color: "bg-stone-50 dark:bg-stone-900",
    textColor: "text-stone-700 dark:text-stone-200",
  },
  {
    id: "5",
    title: "伊拉克原油产量骤降近 70%，对全球油价走势影响几何？",
    category: "聊热点",
    color: "bg-stone-50 dark:bg-stone-900",
    textColor: "text-stone-700 dark:text-stone-200",
  },
];

// 提示标签
export const promptTags = [
  { id: "1", icon: "📝", label: "帮我写周报" },
  { id: "2", icon: "🌐", label: "翻译这段文字" },
  { id: "3", icon: "💻", label: "解释代码" },
  { id: "4", icon: "🗄️", label: "优化SQL" },
  { id: "5", icon: "📊", label: "生成测试数据" },
];
