import { useState, useCallback, useRef, useEffect } from "react";
import { chatStream } from "@/lib/chat";
import { generateId, type ParseResult } from "@/lib/chatParser";
import { getSessionTokenUsage, getTokenContextWindow } from "@/lib/session";
import type { Model } from "@/lib/models";
import type { Message, AIMessage, StreamingContent, StreamingItem } from "@/types/chat";

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
          toolArguments: item.data.argument || "{}",
          toolResult: item.data.response?.text || "",
          isError: item.data.response?.isError || false,
        }],
        attributes: {},
      });
    }
  }
  return contents;
}

function computeStreamContent(prev: StreamingContent, result: ParseResult): StreamingContent {
  const { type, content, data, isEnd } = result;

  if (type === "think" && isEnd) {
    const newItems = [...prev.items];
    for (let i = newItems.length - 1; i >= 0; i--) {
      if (newItems[i].type === "think") {
        newItems[i] = { ...newItems[i], isComplete: true };
        break;
      }
    }
    return { ...prev, items: newItems };
  }

  if (type === "result" && data) {
    const newItems = [...prev.items];
    for (let i = newItems.length - 1; i >= 0; i--) {
      if (newItems[i].type === "tool" && newItems[i].data?.id === data.id) {
        newItems[i] = {
          ...newItems[i],
          data: { ...newItems[i].data, response: { text: data.text, isError: data.isError } },
        };
        break;
      }
    }
    return { ...prev, items: newItems };
  }

  const lastItem = prev.items[prev.currentIndex];
  if (lastItem && lastItem.type === type && type !== "tool") {
    const newItems = [...prev.items];
    newItems[prev.currentIndex] = { ...lastItem, content: lastItem.content + content };
    return { ...prev, items: newItems };
  }

  const newItem: StreamingItem = {
    id: generateId(),
    type: type as "think" | "text" | "tool",
    content,
    data,
  };
  return { items: [...prev.items, newItem], currentIndex: prev.items.length };
}

export function useChat(sessionId: string) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [streamEntries, setStreamEntries] = useState<Record<string, StreamEntry>>({});
  const streamEntriesRef = useRef<Record<string, StreamEntry>>({});
  const [isStreaming, setIsStreaming] = useState(false);
  const [tokenUsage, setTokenUsage] = useState({ usedTokens: 0, maxTokens: 128000 });
  const cancelRef = useRef<(() => void) | null>(null);
  const messagesRef = useRef<Message[]>([]);
  const prevSessionIdRef = useRef<string>(sessionId);
  const summarizingNotifiedRef = useRef(false);
  const onEventHandlersRef = useRef<Record<string, () => void>>({});

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

  useEffect(() => {
    if (!sessionId) return;

    Promise.all([
      getSessionTokenUsage(sessionId),
      getTokenContextWindow(),
    ]).then(([used, max]) => {
      setTokenUsage({ usedTokens: used, maxTokens: max });
    }).catch(() => {});
  }, [sessionId]);

  function initStream(key: string, messageId?: string) {
    const entry: StreamEntry = {
      streamingContent: { items: [], currentIndex: -1 },
      messageId: messageId ?? null,
    };
    setStreamEntries(prev => ({ ...prev, [key]: entry }));
    streamEntriesRef.current = { ...streamEntriesRef.current, [key]: entry };
  }

  function updateStream(key: string, result: ParseResult) {
    setStreamEntries(prev => {
      const entry = prev[key];
      if (!entry) return prev;
      const newContent = computeStreamContent(entry.streamingContent, result);
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
      if (msg.messageType === "AI" && (msg as any).id === entry.messageId) {
        return { ...msg, contents, _completedItems: entry.streamingContent.items };
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

  const handleEvent = useCallback((eventType: string) => {
    const handler = onEventHandlersRef.current[eventType];
    if (handler) handler();
  }, []);

  const sendMessage = useCallback(
    async (prompt: string, model: Model) => {
      if (isStreaming) return;

      summarizingNotifiedRef.current = false;

      const userMessage: Message = {
        contents: [{ contentType: "TEXT", text: prompt }],
        messageType: "USER",
        attributes: {},
      };

      const aiMessageId = generateId();
      const aiPlaceholderMessage: Message = {
        messageType: "AI",
        contents: [],
        id: aiMessageId,
      } as Message;

      const newMessages = [...messagesRef.current, userMessage, aiPlaceholderMessage];
      messagesRef.current = newMessages;
      setMessages(newMessages);

      initStream("REPLY", aiMessageId);
      setIsStreaming(true);

      // Register event handlers for this round
      onEventHandlersRef.current = {
        SUMMARY_COMPRESS: () => {
          if (!summarizingNotifiedRef.current) {
            summarizingNotifiedRef.current = true;
            const summaryId = generateId();
            const statusMsg: Message = {
              contents: [{ contentType: "TEXT", text: "正在压缩会话上下文，请稍后..." }],
              messageType: "USER",
              attributes: {},
            };
            const summaryPlaceholder: Message = {
              messageType: "AI",
              contents: [],
              id: summaryId,
            } as Message;
            const current = messagesRef.current;
            const updated = [...current, statusMsg, summaryPlaceholder];
            messagesRef.current = updated;
            setMessages(updated);
            initStream("SUMMARY_COMPRESS", summaryId);
          }
        },
      };

      const cancel = chatStream({
        prompt,
        sessionId,
        providerId: model.providerId,
        modelName: model.modelName,
        onChunk: (result) => {
          const streamKey = result.sourceType || "REPLY";
          const entry = streamEntriesRef.current[streamKey];
          if (!entry) return;
          updateStream(streamKey, result);
        },
        onEvent: handleEvent,
        onComplete: () => {
          saveStream("SUMMARY_COMPRESS");
          saveStream("REPLY");
          clearStream("REPLY");
          clearStream("SUMMARY_COMPRESS");
          setIsStreaming(false);
          summarizingNotifiedRef.current = false;
          onEventHandlersRef.current = {};
          cancelRef.current = null;

          Promise.all([
            getSessionTokenUsage(sessionId),
            getTokenContextWindow(),
          ]).then(([used, max]) => {
            setTokenUsage({ usedTokens: used, maxTokens: max });
          }).catch(() => {});
        },
        onError: () => {
          saveStream("SUMMARY_COMPRESS");
          saveStream("REPLY");
          clearStream("REPLY");
          clearStream("SUMMARY_COMPRESS");
          setIsStreaming(false);
          summarizingNotifiedRef.current = false;
          onEventHandlersRef.current = {};
          cancelRef.current = null;
        },
      });

      cancelRef.current = cancel;
    },
    [sessionId, isStreaming, handleEvent]
  );

  const cancelStream = useCallback(() => {
    if (cancelRef.current) {
      cancelRef.current();
      cancelRef.current = null;

saveStream("SUMMARY_COMPRESS");
          saveStream("REPLY");
          clearStream("REPLY");
      clearStream("SUMMARY_COMPRESS");
      setIsStreaming(false);
      summarizingNotifiedRef.current = false;
      onEventHandlersRef.current = {};
    }
  }, []);

  const enrichedMessages: Message[] = messages.map(msg => {
    if (msg.messageType === "AI" && (msg as any).id) {
      const stream = Object.entries(streamEntries)
        .find(([, e]) => e.messageId === (msg as any).id)?.[1];
      if (stream) {
        return { ...msg, _streamingContent: stream.streamingContent };
      }
    }
    return msg;
  });

  return {
    messages: enrichedMessages,
    isStreaming,
    sendMessage,
    cancelStream,
    usedTokens: tokenUsage.usedTokens,
    maxTokens: tokenUsage.maxTokens,
  };
}
