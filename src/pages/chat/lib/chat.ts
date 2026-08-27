let idCounter = 0;
export function generateId(): string {
  return `item-${++idCounter}-${Date.now()}`;
}

export interface StreamEvent {
  type: 'text' | 'thinking' | 'think_begin' | 'think_end' | 'tool_call' | 'tool_result' | 'error' | 'summary_compress';
  content?: string;
  id?: string;
  name?: string;
  argument?: string;
  text?: string;
  isError?: boolean;
  isAgent?: boolean;
}

function normalizeEvent(data: any): StreamEvent | null {
  const type = data.type;

  if (["text", "thinking", "think_begin", "think_end", "error"].includes(type)) {
    return { type, content: data.content };
  }

  if (type === "tool_call") {
    try {
      const inner = JSON.parse(data.content);
      return { type, id: inner.id, name: inner.name, argument: inner.argument, isAgent: inner.isAgent };
    } catch {
      return null;
    }
  }

  if (type === "tool_result") {
    try {
      const inner = JSON.parse(data.content);
      return { type, id: inner.id, text: inner.text, isError: inner.isError, isAgent: inner.isAgent };
    } catch {
      return null;
    }
  }

  if (type === "summary_compress") {
    return { type: "summary_compress" };
  }

  if (type === "done") {
    return null;
  }

  return null;
}

export interface DoneData {
  modelName: string;
  tokenUsage: number;
  maxTokenLength: number;
  currentTokenLength: number;
}

export type ContentType = "TEXT" | "IMAGE" | "VIDEO" | "AUDIO" | "PDF";

export interface InputContent {
  uploadId?: string;
  content?: string;
  contentType: ContentType;
}

export interface FileInputContent {
  uploadId: string;
  contentType: Exclude<ContentType, "TEXT">;
}

interface ChatStreamParams {
  inputContents: InputContent[];
  sessionId: string;
  modelId: number;
  skillIds?: string[];
  agentIds?: string[];
  onChunk: (event: StreamEvent) => void;
  onDone?: (data: DoneData) => void;
  onComplete: () => void;
  onError: (error: Error) => void;
}

export function chatStream({
  inputContents,
  sessionId,
  modelId,
  skillIds,
  agentIds,
  onChunk,
  onDone,
  onComplete,
  onError,
}: ChatStreamParams): () => void {
  const controller = new AbortController();
  const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:8080";

  const processEvent = (event: string) => {
    for (const line of event.split("\n")) {
      const trimmedLine = line.trim();
      if (!trimmedLine.startsWith("data:")) continue;

      const jsonStr = trimmedLine.slice(5).trim();

      if (jsonStr === "[DONE]") {
        onComplete();
        return;
      }

      try {
        const data = JSON.parse(jsonStr);
        if (data.type === "done") {
          if (typeof data.content === "string") {
            try {
              const doneData = JSON.parse(data.content);
              onDone?.({
                modelName: doneData.modelName ?? "",
                tokenUsage: doneData.tokenUsage ?? 0,
                maxTokenLength: doneData.maxTokenLength ?? 0,
                currentTokenLength: doneData.currentTokenLength ?? 0,
              });
            } catch {}
          }
          onComplete();
          return;
        }
        const normalized = normalizeEvent(data);
        if (normalized) onChunk(normalized);
      } catch (e) {
        console.error("Parse error:", e, "Line:", trimmedLine);
      }
      break;
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
          inputContents,
          sessionId,
          modelId,
          skillIds,
          agentIds,
        }),
        signal: controller.signal,
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      if (!response.body) {
        throw new Error("Response body is null");
      }

      // 服务端明确返回 Content-Length: 0，说明不是有效的 SSE 流
      if (response.headers.get("content-length") === "0") {
        throw new Error("Server returned empty response (Content-Length: 0) for SSE stream");
      }

      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let buffer = "";

      while (true) {
        const { done, value } = await reader.read();

        if (done) {
          if (buffer.trim()) {
            processEvent(buffer.trim());
          }
          onComplete();
          break;
        }

        buffer += decoder.decode(value, { stream: true });

        const events = buffer.split("\n\n");
        buffer = events.pop() || "";

        for (const event of events) {
          if (event.trim()) {
            processEvent(event.trim());
          }
        }
      }
    } catch (error) {
      if (error instanceof Error && error.name === "AbortError") {
        return;
      }
      onError(error instanceof Error ? error : new Error("Unknown error"));
    }
  };

  fetchStream();

  return () => {
    controller.abort();
  };
}
