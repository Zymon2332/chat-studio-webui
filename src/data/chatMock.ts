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
    title: "论文翻译与润色",
    lastMessage: "请将这段英文翻译成中文...",
    timestamp: "前天 16:20",
    icon: "📄",
  },
  {
    id: "4",
    title: "SQL查询优化",
    lastMessage: "这个查询语句执行很慢，怎么优化？",
    timestamp: "3天前",
    icon: "🗄️",
  },
];

// 功能卡片数据（4个）
export const featureCards = [
  {
    id: "writing",
    icon: "📝",
    title: "智能写作",
    description: "论文、报告、邮件一键生成",
    action: "开始创作",
    color: "blue",
  },
  {
    id: "creative",
    icon: "🎨",
    title: "创意生成",
    description: "图片、视频、PPT自动制作",
    action: "开始创作",
    color: "purple",
  },
  {
    id: "analysis",
    icon: "📊",
    title: "数据分析",
    description: "Excel、图表、数据可视化",
    action: "开始创作",
    color: "green",
  },
  {
    id: "rag",
    icon: "🔍",
    title: "RAG知识库",
    description: "基于文档的智能问答",
    action: "立即体验",
    color: "orange",
  },
];

// 热门提示
export const hotPrompts = [
  "帮我写一份产品需求文档，关于AI对话功能的优化，要求包含用户场景和功能描述...",
  "分析这份销售数据，生成可视化图表，并给出下个月的销售预测和建议...",
  "创建一个自动化工作流，每天定时抓取新闻，并生成摘要发送到邮箱...",
  "将这篇英文论文翻译成中文，保持学术语气，并解释其中的专业术语...",
];

// 可用模型列表
export const availableModels = [
  { id: "gpt-4", name: "GPT-4", provider: "OpenAI", status: "online" },
  { id: "claude-3", name: "Claude 3", provider: "Anthropic", status: "online" },
  { id: "llama-3", name: "Llama 3", provider: "Meta", status: "offline" },
];

// 当前选中的模型
export const currentModel = availableModels[0];

// Prompt 标签（输入框下方）
export const promptTags = [
  { id: "writing", label: "写作", icon: "✍️" },
  { id: "ppt", label: "PPT", icon: "📊" },
  { id: "video", label: "视频", icon: "🎬" },
  { id: "design", label: "设计", icon: "🎨" },
  { id: "excel", label: "Excel", icon: "📈" },
  { id: "webpage", label: "网页", icon: "🌐" },
  { id: "podcast", label: "播客", icon: "🎙️" },
  { id: "chart", label: "图表", icon: "📉" },
];

// Mock 对话消息数据（用于测试）- 新结构：流式消息
export const mockConversationMessages: import("@/types/chat").Message[] = [
  // 第一轮对话
  {
    messageType: "USER",
    contents: [
      {
        contentType: "TEXT",
        text: "知识库检索关于 Java 实体类命名规范"
      }
    ],
    dateTime: "03-09 14:15"
  },
  // AI：思考 + 工具请求（无 text，不显示时间戳）
  {
    messageType: "AI",
    thinking: ["用户想了解 Java 实体类命名规范，我需要从知识库中检索相关信息。让我分析一下关键要点：\n\n1. 命名约定 - 大驼峰\n2. 语义清晰 - 反映职责\n3. 避免缩写 - 提高可读性\n4. 实体类特殊性 - 通常对应数据库表"],
    toolRequests: [
      {
        id: "call_daea48c4989d4a29b80e0877",
        name: "知识库检索",
        argument: '{"content": "Java 实体类命名规范"}'
      }
    ],
    dateTime: "03-09 14:15"
  },
  // 工具执行结果（不渲染，只作为数据）
  {
    messageType: "TOOL_EXECUTION_RESULT",
    toolResponse: {
      id: "call_daea48c4989d4a29b80e0877",
      toolName: "知识库检索",
      text: "检索到 5 条相关规范文档",
      isError: null
    },
    dateTime: "03-09 14:15"
  },
  // AI：文本回复（有 text，无 toolRequests，显示时间戳）
  {
    messageType: "AI",
    text: "根据知识库检索结果，Java 实体类命名规范主要包括以下几点：\n\n1. **类名使用大驼峰命名法**（PascalCase）\n2. **类名应该是名词或名词短语**\n3. **避免使用缩写**，除非是广泛认可的缩写\n4. **类名应该反映其职责**",
    dateTime: "03-09 14:15"
  },
  
  // 第二轮对话
  {
    messageType: "USER",
    contents: [
      {
        contentType: "TEXT",
        text: "能给我一些具体的命名示例吗？"
      }
    ],
    dateTime: "03-09 14:16"
  },
  // AI：直接回复（无 thinking，无 toolRequests）
  {
    messageType: "AI",
    text: "当然可以！以下是 Java 实体类命名的具体示例：\n\n| 不推荐 | 推荐 | 说明 |\n|--------|------|------|\n| user | User | 类名首字母大写 |\n| userinfo | UserInfo | 驼峰命名 |\n| TblUser | User | 不要加表前缀 |\n| DTO | UserDto | 避免纯缩写 |\n| MyClass | Order | 语义清晰 |",
    dateTime: "03-09 14:16"
  },

  // 第三轮：简单问答
  {
    messageType: "USER",
    contents: [
      {
        contentType: "TEXT",
        text: "什么是 RESTful API？"
      }
    ],
    dateTime: "03-09 14:17"
  },
  {
    messageType: "AI",
    text: "RESTful API 是一种基于 HTTP 协议的软件架构风格，它遵循以下核心原则：\n\n**1. 资源导向**\n- 一切皆资源，通过 URL 标识\n- 使用名词而非动词\n\n**2. HTTP 方法对应操作**\n- GET：查询资源\n- POST：创建资源\n- PUT：更新资源\n- DELETE：删除资源\n\n**3. 无状态**\n- 每个请求独立，不依赖之前的请求\n- 便于水平扩展和高并发处理",
    dateTime: "03-09 14:17"
  },

  // 第四轮：深度思考
  {
    messageType: "USER",
    contents: [
      {
        contentType: "TEXT",
        text: "如何设计一个高并发系统？"
      }
    ],
    dateTime: "03-09 14:18"
  },
  {
    messageType: "AI",
    thinking: ["设计高并发系统需要从多个维度思考：\n\n**架构层面：**\n- 微服务拆分，独立扩展\n- 异步消息队列削峰填谷\n- CDN 加速静态资源\n\n**数据库层面：**\n- 读写分离，主从复制\n- 分库分表，水平扩展\n- 合理使用索引和缓存\n\n**缓存策略：**\n- 多级缓存（本地 + 分布式）\n- 缓存预热和更新策略\n- 缓存穿透、击穿、雪崩防护"],
    text: "设计高并发系统需要从以下几个维度考虑：\n\n## 1. 架构设计\n- **微服务架构**：按业务领域拆分，独立部署和扩展\n- **异步处理**：使用消息队列（Kafka/RabbitMQ）削峰填谷\n- **负载均衡**：Nginx/HAProxy 分发请求到多台服务器\n\n## 2. 数据库优化\n- **读写分离**：主库写、从库读，提升读取性能\n- **分库分表**：水平拆分数据，分散压力\n- **连接池**：合理配置数据库连接池大小\n\n## 3. 缓存策略\n- **多级缓存**：本地缓存（Caffeine）+ 分布式缓存（Redis）\n- **缓存预热**：系统启动时预加载热点数据\n- **缓存更新**：采用 Cache-Aside 模式，保证一致性",
    dateTime: "03-09 14:18"
  },

  // 第五轮：多工具调用
  {
    messageType: "USER",
    contents: [
      {
        contentType: "TEXT",
        text: "查询北京和上海的天气，并对比一下"
      }
    ],
    dateTime: "03-09 14:19"
  },
  {
    messageType: "AI",
    toolRequests: [
      {
        id: "call_weather_beijing_001",
        name: "天气查询",
        argument: '{"city": "北京"}'
      },
      {
        id: "call_weather_shanghai_002",
        name: "天气查询",
        argument: '{"city": "上海"}'
      }
    ],
    dateTime: "03-09 14:19"
  },
  {
    messageType: "TOOL_EXECUTION_RESULT",
    toolResponse: {
      id: "call_weather_beijing_001",
      toolName: "天气查询",
      text: "北京：多云，15°C，空气质量良，湿度 45%",
      isError: null
    },
    dateTime: "03-09 14:19"
  },
  {
    messageType: "TOOL_EXECUTION_RESULT",
    toolResponse: {
      id: "call_weather_shanghai_002",
      toolName: "天气查询",
      text: "上海：小雨，18°C，空气质量优，湿度 78%",
      isError: null
    },
    dateTime: "03-09 14:19"
  },
  {
    messageType: "AI",
    text: "根据天气查询结果，两地的天气对比如下：\n\n| 城市 | 天气 | 温度 | 空气质量 | 湿度 |\n|------|------|------|----------|------|\n| 北京 | 多云 | 15°C | 良 | 45% |\n| 上海 | 小雨 | 18°C | 优 | 78% |\n\n**总结：**\n- 上海温度略高，但有小雨，湿度较大\n- 北京天气较干燥，适合户外活动\n- 两地空气质量都不错",
    dateTime: "03-09 14:19"
  },

  // 第六轮：工具失败
  {
    messageType: "USER",
    contents: [
      {
        contentType: "TEXT",
        text: "查询数据库中的用户订单数据"
      }
    ],
    dateTime: "03-09 14:20"
  },
  {
    messageType: "AI",
    toolRequests: [
      {
        id: "call_db_query_003",
        name: "数据库查询",
        argument: '{"table": "orders", "limit": 10}'
      }
    ],
    dateTime: "03-09 14:20"
  },
  {
    messageType: "TOOL_EXECUTION_RESULT",
    toolResponse: {
      id: "call_db_query_003",
      toolName: "数据库查询",
      text: "Error: Connection timeout after 30s. Database server may be overloaded or network issue.",
      isError: true
    },
    dateTime: "03-09 14:20"
  },
  {
    messageType: "AI",
    text: "很抱歉，数据库查询失败，连接超时。可能的原因：\n\n1. 数据库服务器负载过高\n2. 网络连接不稳定\n3. 查询语句执行时间过长\n\n建议：\n- 稍后重试\n- 检查数据库服务器状态\n- 优化查询语句或添加索引",
    dateTime: "03-09 14:20"
  },

  // 第七轮：长内容
  {
    messageType: "USER",
    contents: [
      {
        contentType: "TEXT",
        text: "详细介绍一下 Docker 容器化技术"
      }
    ],
    dateTime: "03-09 14:21"
  },
  {
    messageType: "AI",
    text: "Docker 是一个开源的容器化平台，它彻底改变了应用程序的开发、部署和运行方式。以下是详细介绍：\n\n## 一、什么是 Docker？\n\nDocker 使用容器技术将应用程序及其依赖打包在一起，形成标准化的运行单元。与传统虚拟机相比，Docker 容器更加轻量、启动更快、资源占用更少。\n\n## 二、核心概念\n\n### 1. 镜像（Image）\n- 只读模板，包含运行应用所需的文件系统\n- 分层存储结构，便于复用和版本控制\n- 可以从 Dockerfile 构建，也可以从仓库拉取\n\n### 2. 容器（Container）\n- 镜像的运行实例\n- 相互隔离，但共享宿主机内核\n- 启动时间以秒计，资源开销极小\n\n### 3. 仓库（Registry）\n- 存储和分发镜像的服务\n- Docker Hub 是官方公共仓库\n- 支持私有仓库部署\n\n## 三、Docker vs 虚拟机\n\n| 特性 | Docker 容器 | 虚拟机 |\n|------|-------------|--------|\n| 启动时间 | 秒级 | 分钟级 |\n| 资源占用 | 小（MB级） | 大（GB级） |\n| 性能 | 接近原生 | 有虚拟化开销 |\n| 隔离性 | 进程级 | 系统级 |\n| 可移植性 | 优秀 | 一般 |\n\n## 四、主要应用场景\n\n1. **微服务架构**：每个服务独立容器化部署\n2. **持续集成/持续部署（CI/CD）**：标准化构建和发布流程\n3. **开发环境一致性**：消除『在我机器上能运行』的问题\n4. **弹性伸缩**：快速水平扩展应对流量高峰\n5. **混合云部署**：一次构建，到处运行",
    dateTime: "03-09 14:21"
  },

  // 第八轮：代码示例
  {
    messageType: "USER",
    contents: [
      {
        contentType: "TEXT",
        text: "给我一个 React Hook 的自定义 Hook 示例"
      }
    ],
    dateTime: "03-09 14:22"
  },
  {
    messageType: "AI",
    text: "以下是一个常用的自定义 Hook - `useLocalStorage`，用于在 localStorage 中持久化状态：\n\n```typescript\nimport { useState, useEffect } from 'react';\n\nfunction useLocalStorage<T>(key: string, initialValue: T) {\n  // 获取初始值\n  const [storedValue, setStoredValue] = useState<T>(() => {\n    try {\n      const item = window.localStorage.getItem(key);\n      return item ? JSON.parse(item) : initialValue;\n    } catch (error) {\n      console.error(error);\n      return initialValue;\n    }\n  });\n\n  // 更新 localStorage\n  const setValue = (value: T | ((val: T) => T)) => {\n    try {\n      const valueToStore = value instanceof Function ? value(storedValue) : value;\n      setStoredValue(valueToStore);\n      window.localStorage.setItem(key, JSON.stringify(valueToStore));\n    } catch (error) {\n      console.error(error);\n    }\n  };\n\n  return [storedValue, setValue] as const;\n}\n\n// 使用示例\nfunction App() {\n  const [name, setName] = useLocalStorage('name', '');\n  \n  return (\n    <input \n      value={name} \n      onChange={(e) => setName(e.target.value)} \n    />\n  );\n}\n```\n\n这个 Hook 的特点是：\n- 自动从 localStorage 读取初始值\n- 状态变化时自动持久化\n- 支持函数式更新\n- 包含错误处理",
    dateTime: "03-09 14:22"
  }
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
