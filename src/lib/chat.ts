import { StreamParser, type ParseResult } from "./chatParser";

interface ChatStreamParams {
  prompt: string;
  sessionId: string;
  providerId: string;
  modelName: string;
  onChunk: (result: ParseResult) => void;
  onComplete: () => void;
  onError: (error: Error) => void;
}

export function chatStream({
  prompt,
  sessionId,
  providerId,
  modelName,
  onChunk,
  onComplete,
  onError,
}: ChatStreamParams): () => void {
  const parser = new StreamParser();
  const controller = new AbortController();
  const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:8080";

  // 处理单个 SSE 事件
  const processEvent = (event: string) => {
    // 按行分割，找到 data: 行
    const lines = event.split("\n");

    for (const line of lines) {
      const trimmedLine = line.trim();
      if (trimmedLine.startsWith("data:")) {
        const jsonStr = trimmedLine.slice(5);

        if (jsonStr === "[DONE]") {
          // 流式结束
          onComplete();
          return;
        }

        try {
          const data = JSON.parse(jsonStr);
          const content = data.content;

          if (content) {
            const result = parser.parse(content);
            if (result) {
              onChunk(result);
            }
          }
        } catch (e) {
          console.error("Parse error:", e, "Line:", trimmedLine);
        }
        break; // 只处理第一个 data: 行
      }
    }
  };

  const fetchStream = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/v1/chat`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Accept: "text/event-stream",
        },
        credentials: "include",
        body: JSON.stringify({
          prompt,
          sessionId,
          providerId,
          modelName,
        }),
        signal: controller.signal,
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      if (!response.body) {
        throw new Error("Response body is null");
      }

      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let buffer = "";

      while (true) {
        const { done, value } = await reader.read();

        if (done) {
          // 处理缓冲区剩余内容
          if (buffer.trim()) {
            processEvent(buffer.trim());
          }
          onComplete();
          break;
        }

        // 追加到缓冲区
        buffer += decoder.decode(value, { stream: true });

        // 按 \n\n 分割事件（SSE 事件分隔符）
        const events = buffer.split("\n\n");
        buffer = events.pop() || ""; // 保留不完整事件到下次处理

        // 处理完整事件
        for (const event of events) {
          if (event.trim()) {
            processEvent(event.trim());
          }
        }
      }
    } catch (error) {
      if (error instanceof Error && error.name === "AbortError") {
        // 用户取消，不报错
        return;
      }
      onError(error instanceof Error ? error : new Error("Unknown error"));
    }
  };

  fetchStream();

  // 返回取消函数
  return () => {
    controller.abort();
  };
}
