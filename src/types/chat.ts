// 新 API 数据格式 - 后端返回的执行工具记录
export interface ApiExecutedTool {
  toolName: string;
  toolArguments: string;
  toolResult: string;
  isError: boolean;
}

// 新 API 数据格式 - AI 消息内容
export interface ApiAIContent {
  text: string;
  thinking: string;
  executedTools: ApiExecutedTool[];
  attributes: Record<string, any>;
}

// 用户消息 - 新格式
export interface UserMessage {
  contents: Array<{ contentType: "TEXT"; text: string }>;
  messageType: "USER";
  attributes: Record<string, any>;  // 包含 dateTime 等字段
}

// AI 消息 - 新格式
export interface AIMessage {
  messageType: "AI";
  contents: ApiAIContent[];
  id?: string;  // 可选：用于流式占位消息标识
}

// 流式内容项 - 用于渲染
export interface StreamingItem {
  id: string;
  type: 'think' | 'text' | 'tool';
  content: string;
  isComplete?: boolean;  // 标记 think 是否结束（收到 [END] 标记时为 true）
  data?: {
    id?: string;
    name?: string;
    argument?: string;
    response?: {
      text: string;
      isError: boolean | null;
    };
  };
}

// 流式状态 - 用于累积和管理流式内容
export interface StreamingContent {
  items: StreamingItem[];
  currentIndex: number;
}

export type Message = 
  | UserMessage 
  | AIMessage;

export function isUserMessage(message: Message): message is UserMessage {
  return message.messageType === "USER";
}

export function isAIMessage(message: Message): message is AIMessage {
  return message.messageType === "AI";
}
