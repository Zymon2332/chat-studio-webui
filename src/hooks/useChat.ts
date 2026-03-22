import { useState, useCallback, useRef, useEffect } from "react";
import { chatStream } from "@/lib/chat";
import { generateId } from "@/lib/chatParser";
import type { Model } from "@/lib/models";
import type { Message, AIMessage, StreamingContent, StreamingItem } from "@/types/chat";

export function useChat(sessionId: string) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [streamingContent, setStreamingContent] = useState<StreamingContent>({
    items: [],
    currentIndex: -1,
  });
  const streamingContentRef = useRef<StreamingContent>({ items: [], currentIndex: -1 });
  const [isStreaming, setIsStreaming] = useState(false);
  const cancelRef = useRef<(() => void) | null>(null);
  const messagesRef = useRef<Message[]>([]);
  const prevSessionIdRef = useRef<string>(sessionId);
  const currentAIMessageIdRef = useRef<string | null>(null);

  // 同步 ref 和 state
  useEffect(() => {
    messagesRef.current = messages;
  }, [messages]);

  useEffect(() => {
    streamingContentRef.current = streamingContent;
  }, [streamingContent]);

  // 会话切换时重置状态
  useEffect(() => {
    if (prevSessionIdRef.current !== sessionId) {
      prevSessionIdRef.current = sessionId;
      // 清理之前的流
      if (cancelRef.current) {
        cancelRef.current();
        cancelRef.current = null;
      }
      // 重置所有状态
      setMessages([]);
      messagesRef.current = [];
      setStreamingContent({ items: [], currentIndex: -1 });
      streamingContentRef.current = { items: [], currentIndex: -1 };
      setIsStreaming(false);
    }
  }, [sessionId]);

  // 保存流式内容到 messages（新格式：StreamingItem[] → contents: ApiAIContent[]）
  // 保存流式内容到 messages
  // 更新占位 AI 消息的 contents，保持流式时的渲染顺序
  const saveStreamingContent = useCallback(() => {
    const finalContent = streamingContentRef.current;
    const currentId = currentAIMessageIdRef.current;
    
    if (finalContent.items.length > 0 && currentId) {
      const contents: AIMessage["contents"] = [];

      // 按 items 顺序创建 contents，每个 item 对应一个 content
      finalContent.items.forEach((item: StreamingItem) => {
        if (item.type === 'think') {
          contents.push({
            text: "",
            thinking: item.content,
            executedTools: [],
            attributes: {},
          });
        } else if (item.type === 'text') {
          contents.push({
            text: item.content,
            thinking: "",
            executedTools: [],
            attributes: {},
          });
        } else if (item.type === 'tool' && item.data) {
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
      });

      // 更新占位 AI 消息
      const finalMessages = messagesRef.current.map((msg) => {
        if (msg.messageType === "AI" && (msg as any).id === currentId) {
          return {
            ...msg,
            contents,
          };
        }
        return msg;
      });
      
      messagesRef.current = finalMessages;
      setMessages(finalMessages);
      currentAIMessageIdRef.current = null;
    }
  }, []);

  const sendMessage = useCallback(
    async (prompt: string, model: Model) => {
      if (isStreaming) return;

      // 添加用户消息
      const userMessage: Message = {
        contents: [{ contentType: "TEXT", text: prompt }],
        messageType: "USER",
        attributes: {},
      };

      // 创建占位 AI 消息（用于合并渲染）
      const aiMessageId = generateId();
      currentAIMessageIdRef.current = aiMessageId;
      
      const aiPlaceholderMessage: Message = {
        messageType: "AI",
        contents: [],
        id: aiMessageId,
      } as Message;
      
      const newMessages = [...messagesRef.current, userMessage, aiPlaceholderMessage];
      messagesRef.current = newMessages;
      setMessages(newMessages);

      // 初始化流式状态
      setStreamingContent({ items: [], currentIndex: -1 });
      streamingContentRef.current = { items: [], currentIndex: -1 };
      setIsStreaming(true);

      // 开始流式对话
      const cancel = chatStream({
        prompt,
        sessionId,
        providerId: model.providerId,
        modelName: model.modelName,
        onChunk: (result) => {
          setStreamingContent((prev) => {
            const { type, content, data, isEnd } = result;

            // 处理 think 结束标记 - 标记最后一个 think item 为完成
            if (type === 'think' && isEnd) {
              const newItems = [...prev.items];
              // 找到最后一个 think item 并标记为完成
              for (let i = newItems.length - 1; i >= 0; i--) {
                if (newItems[i].type === 'think') {
                  newItems[i] = {
                    ...newItems[i],
                    isComplete: true,
                  };
                  break;
                }
              }
              // 更新 ref
              const newContent = { ...prev, items: newItems };
              streamingContentRef.current = newContent;
              return newContent;
            }

            // 处理 result 类型 - 更新最后一个 tool 的 response
            if (type === 'result' && data) {
              const newItems = [...prev.items];
              // 找到对应的 tool item 并更新 response
              for (let i = newItems.length - 1; i >= 0; i--) {
                if (newItems[i].type === 'tool' && newItems[i].data?.id === data.id) {
                  newItems[i] = {
                    ...newItems[i],
                    data: {
                      ...newItems[i].data,
                      response: {
                        text: data.text,
                        isError: data.isError,
                      },
                    },
                  };
                  break;
                }
              }
              // 更新 ref
              const newContent = { ...prev, items: newItems };
              streamingContentRef.current = newContent;
              return newContent;
            }

            // 获取当前最后一个 item
            const lastItem = prev.items[prev.currentIndex];

            let newContent: StreamingContent;
            if (lastItem && lastItem.type === type && type !== 'tool') {
              // 同类型（非 tool），追加到现有 item
              const newItems = [...prev.items];
              newItems[prev.currentIndex] = {
                ...lastItem,
                content: lastItem.content + content,
              };
              newContent = { ...prev, items: newItems };
            } else {
              // 不同类型 或 是 tool，创建新 item
              const newItem: StreamingItem = {
                id: generateId(),
                type: type as 'think' | 'text' | 'tool',
                content,
                data,
              };
              newContent = {
                items: [...prev.items, newItem],
                currentIndex: prev.items.length,
              };
            }

            // 更新 ref
            streamingContentRef.current = newContent;
            return newContent;
          });
        },
        onComplete: () => {
          // 1. 保存到 messages
          saveStreamingContent();
          
          // 2. 立即清空流式（避免重复显示）
          setStreamingContent({ items: [], currentIndex: -1 });
          streamingContentRef.current = { items: [], currentIndex: -1 };
          
          // 3. 标记流式结束
          setIsStreaming(false);
          cancelRef.current = null;
        },
        onError: () => {
          // 1. 保存到 messages（即使出错也保存已接收的内容）
          saveStreamingContent();
          
          // 2. 立即清空流式
          setStreamingContent({ items: [], currentIndex: -1 });
          streamingContentRef.current = { items: [], currentIndex: -1 };
          
          // 3. 标记流式结束
          setIsStreaming(false);
          cancelRef.current = null;
        },
      });

      cancelRef.current = cancel;
    },
    [sessionId, isStreaming, saveStreamingContent]
  );

  const cancelStream = useCallback(() => {
    if (cancelRef.current) {
      cancelRef.current();
      cancelRef.current = null;
      
      // 保存已接收的内容
      saveStreamingContent();
      
      // 清空流式
      setStreamingContent({ items: [], currentIndex: -1 });
      streamingContentRef.current = { items: [], currentIndex: -1 };
      
      setIsStreaming(false);
    }
  }, [saveStreamingContent]);

  return {
    messages,
    streamingContent,
    isStreaming,
    currentAIMessageId: currentAIMessageIdRef.current,
    sendMessage,
    cancelStream,
  };
}
