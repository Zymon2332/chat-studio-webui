import { useState, useCallback, useRef, useEffect, useMemo } from "react";
import { chatStream, generateId, type StreamEvent, type InputContent, type FileInputContent, type ContentType } from "../lib/chat";
import type { DoneData } from "../lib/chat";
import { getSessionTokenUsage, getTokenContextWindow } from "@/lib/session";
import type { Model } from "@/lib/models";
import type { Message, AIMessage, StreamingContent, StreamingItem } from "@/types/chat";

export function buildInputContents(text: string, fileContents: FileInputContent[]): InputContent[] {
  const result: InputContent[] = [];
  if (text) {
    result.push({ contentType: "TEXT", content: text });
  }
  for (const file of fileContents) {
    result.push({ contentType: file.contentType, uploadId: file.uploadId, content: "" });
  }
  return result;
}

interface StreamEntry {
  streamingContent: StreamingContent;
  messageId: string | null;
}

const emptyEntry: StreamEntry = {
  streamingContent: { items: [], currentIndex: -1 },
  messageId: null,
};

function convertItemsToContents(items: StreamingItem[]): AIMessage["contents"] {
  const contents: AIMessage["contents"] = [];
  for (const item of items) {
    if (item.type === "think") {
      contents.push({ text: "", thinking: item.content, executedTools: [], attributes: {} });
    } else if (item.type === "text") {
      contents.push({ text: item.content, thinking: "", executedTools: [], attributes: {} });
    } else if (item.type === "tool" && item.data) {
      contents.push({
        text: "",
        thinking: "",
        executedTools: [{
          toolName: item.data.name || "工具",
          toolArgument: item.data.argument || "{}",
          toolResult: item.data.response?.text || "",
          isError: item.data.response?.isError || false,
        }],
        attributes: {},
      });
    }
  }
  return contents;
}

function computeStreamContent(prev: StreamingContent, event: StreamEvent): StreamingContent {
  switch (event.type) {
    case "think_begin": {
      const items = [...prev.items, { id: generateId(), type: "think" as const, content: "", isComplete: false }];
      return { items, currentIndex: prev.items.length };
    }

    case "thinking": {
      const last = prev.items[prev.currentIndex];
      if (last?.type === "think") {
        const items = [...prev.items];
        items[prev.currentIndex] = { ...last, content: last.content + (event.content || "") };
        return { ...prev, items };
      }
      const items = [...prev.items, { id: generateId(), type: "think" as const, content: event.content || "" }];
      return { items, currentIndex: prev.items.length };
    }

    case "think_end": {
      const items = [...prev.items];
      for (let i = items.length - 1; i >= 0; i--) {
        if (items[i].type === "think") {
          items[i] = { ...items[i], isComplete: true };
          break;
        }
      }
      return { ...prev, items };
    }

    case "text": {
      const last = prev.items[prev.currentIndex];
      if (last?.type === "text") {
        const items = [...prev.items];
        items[prev.currentIndex] = { ...last, content: last.content + (event.content || "") };
        return { ...prev, items };
      }
      const items = [...prev.items, { id: generateId(), type: "text" as const, content: event.content || "" }];
      return { items, currentIndex: prev.items.length };
    }

    case "tool_call": {
      const items = [...prev.items, {
        id: generateId(),
        type: "tool" as const,
        content: "",
        data: { id: event.id, name: event.name, argument: event.argument, isAgent: event.isAgent },
      }];
      return { items, currentIndex: prev.items.length };
    }

        case "tool_result": {
      const items = [...prev.items];
      for (let i = items.length - 1; i >= 0; i--) {
        if (items[i].type === "tool" && items[i].data?.id === event.id) {
          items[i] = {
            ...items[i],
            data: { ...items[i].data, response: { text: event.text || "", isError: event.isError || false }, isAgent: event.isAgent },
          };
          break;
        }
      }
      return { ...prev, items };
    }

    case "error": {
      const items = [...prev.items, { id: generateId(), type: "text" as const, content: event.content || "发生错误" }];
      return { items, currentIndex: prev.items.length };
    }

    default:
      return prev;
  }
}

export function useChat(sessionId: string, modelId?: number) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [streamEntries, setStreamEntries] = useState<Record<string, StreamEntry>>({});
  const streamEntriesRef = useRef<Record<string, StreamEntry>>({});
  const [isStreaming, setIsStreaming] = useState(false);
  const [tokenUsage, setTokenUsage] = useState({ usedTokens: 0, maxTokens: 128000 });
  const cancelRef = useRef<(() => void) | null>(null);
  const messagesRef = useRef<Message[]>([]);
  const prevSessionIdRef = useRef<string>(sessionId);
  const summarizingNotifiedRef = useRef(false);
  const activeStreamRef = useRef<string>("chat");
  const doneDataRef = useRef<DoneData | null>(null);

  useEffect(() => {
    messagesRef.current = messages;
  }, [messages]);

  useEffect(() => {
    streamEntriesRef.current = streamEntries;
  }, [streamEntries]);

  useEffect(() => {
    if (prevSessionIdRef.current !== sessionId) {
      prevSessionIdRef.current = sessionId;
      if (cancelRef.current) {
        cancelRef.current();
        cancelRef.current = null;
      }
      setMessages([]);
      messagesRef.current = [];
      setStreamEntries({});
      streamEntriesRef.current = {};
      setIsStreaming(false);
      summarizingNotifiedRef.current = false;
    }
  }, [sessionId]);

  // 初始加载时刷新 token 用量和模型窗口长度
  useEffect(() => {
    if (!sessionId) return;

    const promises: Promise<any>[] = [getSessionTokenUsage(sessionId)];
    if (modelId) {
      promises.push(getTokenContextWindow(modelId));
    }

    Promise.all(promises).then(([used, max]) => {
      setTokenUsage({ usedTokens: used, maxTokens: max ?? tokenUsage.maxTokens });
    }).catch(() => {});
  }, [sessionId, modelId]);

  function initStream(key: string, messageId?: string) {
    const entry: StreamEntry = {
      streamingContent: { items: [], currentIndex: -1 },
      messageId: messageId ?? null,
    };
    setStreamEntries(prev => ({ ...prev, [key]: entry }));
    streamEntriesRef.current = { ...streamEntriesRef.current, [key]: entry };
  }

  function updateStream(key: string, event: StreamEvent) {
    setStreamEntries(prev => {
      const entry = prev[key];
      if (!entry) return prev;
      const newContent = computeStreamContent(entry.streamingContent, event);
      const updated = { ...prev, [key]: { ...entry, streamingContent: newContent } };
      streamEntriesRef.current = updated;
      return updated;
    });
  }

  function saveStream(key: string) {
    const entry = streamEntriesRef.current[key];
    if (!entry || !entry.messageId || entry.streamingContent.items.length === 0) return;

    const contents = convertItemsToContents(entry.streamingContent.items);
    const finalMessages = messagesRef.current.map(msg => {
      if (msg.messageType === "AI" && (msg as AIMessage).id === entry.messageId) {
        return { ...msg, contents, _completedItems: entry.streamingContent.items, ...(doneDataRef.current ?? {}) };
      }
      return msg;
    });
    messagesRef.current = finalMessages;
    setMessages(finalMessages);
  }

  function clearStream(key: string) {
    setStreamEntries(prev => {
      if (!prev[key]) return prev;
      const updated = { ...prev, [key]: { ...emptyEntry } };
      streamEntriesRef.current = updated;
      return updated;
    });
  }

  function finalizeStreams() {
    saveStream("chat");
    clearStream("chat");
    setIsStreaming(false);
    summarizingNotifiedRef.current = false;
    doneDataRef.current = null;
    activeStreamRef.current = "chat";
    cancelRef.current = null;
  }

  const sendMessage = useCallback(
    async (payload: { text: string; fileContents: { uploadId: string; contentType: Exclude<ContentType, "TEXT">; url: string }[] }, model: Model, skillIds?: string[], agentIds?: string[]) => {
      if (isStreaming) return;

      summarizingNotifiedRef.current = false;

      const inputContents = buildInputContents(payload.text, payload.fileContents);

      const userMessage: Message = {
        messageType: "USER",
        contents: [
          ...(payload.text ? [{ type: "TEXT" as const, text: payload.text }] : []),
          ...payload.fileContents.map((f) => ({ type: f.contentType, url: f.url })),
        ],
        attributes: {},
      } as Message;

      const aiMessageId = generateId();
      const aiPlaceholderMessage: Message = {
        messageType: "AI",
        contents: [],
        id: aiMessageId,
      } as Message;

      const newMessages = [...messagesRef.current, userMessage, aiPlaceholderMessage];
      messagesRef.current = newMessages;
      setMessages(newMessages);

      activeStreamRef.current = "chat";
      initStream("chat", aiMessageId);
      setIsStreaming(true);
      const cancel = chatStream({
        inputContents,
        sessionId,
        modelId: model.id,
        skillIds,
        agentIds,
        onChunk: (event) => {
          if (event.type === "summary_compress") {
            if (!summarizingNotifiedRef.current) {
              summarizingNotifiedRef.current = true;
              const summaryId = generateId();
              const markerMsg: Message = {
                messageType: "MARKER",
                label: "正在压缩会话上下文，请稍后...",
              };
              const summaryPlaceholder: Message = {
                messageType: "AI",
                contents: [],
                id: summaryId,
              } as Message;
              const current = messagesRef.current;
              const updated = [...current, markerMsg, summaryPlaceholder];
              messagesRef.current = updated;
              setMessages(updated);
              initStream("summary", summaryId);
              activeStreamRef.current = "summary";
            }
            return;
          }

          const entry = streamEntriesRef.current[activeStreamRef.current];
          if (!entry) return;
          updateStream(activeStreamRef.current, event);
        },
        onDone: (data) => {
          doneDataRef.current = data;
          if (data.currentTokenLength || data.maxTokenLength) {
            setTokenUsage({ usedTokens: data.currentTokenLength, maxTokens: data.maxTokenLength });
          }
        },
        onComplete: () => {
          saveStream("summary");
          clearStream("summary");
          finalizeStreams();

        },
        onError: (error) => {
          console.error('[SSE Error]', error.message);
          saveStream("summary");
          clearStream("summary");
          finalizeStreams();
        },
      });

      cancelRef.current = cancel;
    },
    [sessionId, isStreaming]
  );

  const cancelStream = useCallback(() => {
    if (cancelRef.current) {
      cancelRef.current();
      cancelRef.current = null;

      saveStream("summary");
      clearStream("summary");
      finalizeStreams();
    }
  }, []);

  const enrichedMessages = useMemo(() =>
    (() => {
      // Build a messageId → StreamEntry map for O(1) lookup
      const streamByMsgId = new Map<string, StreamEntry>();
      for (const entry of Object.values(streamEntries)) {
        if (entry.messageId) streamByMsgId.set(entry.messageId, entry);
      }
      return messages.map(msg => {
        if (msg.messageType === "AI" && (msg as AIMessage).id) {
          const stream = streamByMsgId.get((msg as AIMessage).id!);
          if (stream) return { ...msg, _streamingContent: stream.streamingContent };
        }
        return msg;
      });
    })(),
    [messages, streamEntries]
  );

  return {
    messages: enrichedMessages,
    isStreaming,
    sendMessage,
    cancelStream,
    usedTokens: tokenUsage.usedTokens,
    maxTokens: tokenUsage.maxTokens,
  };
}
