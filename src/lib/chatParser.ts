export interface ParseResult {
  type: "think" | "text" | "tool" | "result";
  content: string;
  isEnd?: boolean;  // 标记 think 是否结束（收到 [END] 时为 true）
  data?: any; // 用于 tool 和 result 的 JSON 数据
}

export class StreamParser {
  parse(chunk: string): ParseResult | null {
    // 提取 think 标签内容
    const thinkMatch = chunk.match(/<think>(.*?)<\/think>/s);
    if (thinkMatch) {
      const content = thinkMatch[1];
      // 检查是否是结束标记
      if (content === "[END]") {
        return {
          type: "think",
          content: "",
          isEnd: true,  // 标记为思考结束
        };
      }
      return {
        type: "think",
        content: content,
        isEnd: false,
      };
    }

    // 提取 message 标签内容
    const messageMatch = chunk.match(/<message>(.*?)<\/message>/s);
    if (messageMatch) {
      return {
        type: "text",
        content: messageMatch[1],
      };
    }

    // 提取 tool 标签内容
    const toolMatch = chunk.match(/<tool>(.*?)<\/tool>/s);
    if (toolMatch) {
      try {
        const data = JSON.parse(toolMatch[1]);
        return {
          type: "tool",
          content: toolMatch[1],
          data,
        };
      } catch {
        return null;
      }
    }

    // 提取 result 标签内容
    const resultMatch = chunk.match(/<result>(.*?)<\/result>/s);
    if (resultMatch) {
      try {
        const data = JSON.parse(resultMatch[1]);
        return {
          type: "result",
          content: resultMatch[1],
          data,
        };
      } catch {
        return null;
      }
    }

    return null;
  }

  reset() {
    // 解析器无状态需要重置
  }
}

// 生成唯一 ID
let idCounter = 0;
export function generateId(): string {
  return `item-${++idCounter}-${Date.now()}`;
}
