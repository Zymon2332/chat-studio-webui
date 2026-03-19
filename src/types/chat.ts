export interface ToolRequest {
  id: string;
  name: string;
  argument: string;
}

export interface ToolResponse {
  id: string;
  toolName: string;
  text?: string;
  isError: boolean | null;
}

export interface UserMessage {
  contents: Array<{ contentType: "TEXT"; text: string }>;
  messageType: "USER";
  dateTime: string;
}

// 内容块类型：用于按顺序存储 AI 消息的各种内容
export type ContentBlock = 
  | { type: 'think'; content: string }
  | { type: 'tool'; request: ToolRequest; response?: ToolResponse }
  | { type: 'text'; content: string };

export interface AIMessage {
  messageType: "AI";
  blocks: ContentBlock[];  // 按顺序存储所有内容块
  dateTime: string;
}

export interface ToolExecutionResultMessage {
  messageType: "TOOL_EXECUTION_RESULT";
  toolResponse: {
    id: string;
    toolName: string;
    text?: string;
    isError: boolean | null;
  };
  dateTime: string;
}

export type Message = 
  | UserMessage 
  | AIMessage 
  | ToolExecutionResultMessage;

export function isUserMessage(message: Message): message is UserMessage {
  return message.messageType === "USER";
}

export function isAIMessage(message: Message): message is AIMessage {
  return message.messageType === "AI";
}

export function isToolExecutionResultMessage(
  message: Message
): message is ToolExecutionResultMessage {
  return message.messageType === "TOOL_EXECUTION_RESULT";
}
