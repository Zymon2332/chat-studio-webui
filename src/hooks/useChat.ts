import { useState, useCallback, useRef, useEffect } from "react";
import { chatStream } from "@/lib/chat";
import type { Model } from "@/lib/models";
import type { Message, AIMessage } from "@/types/chat";

export function useChat(sessionId: string) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [streamingMessage, setStreamingMessage] = useState<AIMessage | null>(null);
  const [isStreaming, setIsStreaming] = useState(false);
  const cancelRef = useRef<(() => void) | null>(null);
  const messagesRef = useRef<Message[]>([]);
  const streamingMessageRef = useRef<AIMessage | null>(null);
  const prevSessionIdRef = useRef<string>(sessionId);

  // 同步 ref 和 state
  useEffect(() => {
    messagesRef.current = messages;
  }, [messages]);

  useEffect(() => {
    streamingMessageRef.current = streamingMessage;
  }, [streamingMessage]);

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
      setStreamingMessage(null);
      streamingMessageRef.current = null;
      setIsStreaming(false);
    }
  }, [sessionId]);

  const sendMessage = useCallback(
    async (prompt: string, model: Model) => {
      if (isStreaming) return;

      // 添加用户消息
      const userMessage: Message = {
        contents: [{ contentType: "TEXT", text: prompt }],
        messageType: "USER",
        dateTime: new Date().toLocaleString("zh-CN", {
          month: "2-digit",
          day: "2-digit",
          hour: "2-digit",
          minute: "2-digit",
        }).replace(/\//g, "-"),
      };

      const newMessages = [...messagesRef.current, userMessage];
      messagesRef.current = newMessages;
      setMessages(newMessages);

      // 创建 AI 消息占位
      const aiMessage: AIMessage = {
        messageType: "AI",
        blocks: [],
        dateTime: new Date().toLocaleString("zh-CN", {
          month: "2-digit",
          day: "2-digit",
          hour: "2-digit",
          minute: "2-digit",
        }).replace(/\//g, "-"),
      };

      streamingMessageRef.current = aiMessage;
      setStreamingMessage(aiMessage);
      setIsStreaming(true);

      // 开始流式对话
      const cancel = chatStream({
        prompt,
        sessionId,
        providerId: model.providerId,
        modelName: model.modelName,
        onChunk: (content) => {
          streamingMessageRef.current = {
            ...streamingMessageRef.current!,
            blocks: content.blocks,
          };
          setStreamingMessage(streamingMessageRef.current);
        },
        onComplete: () => {
          // 先保存到 messages，再清空 streamingMessage
          if (streamingMessageRef.current) {
            const finalMessages = [...messagesRef.current, streamingMessageRef.current];
            messagesRef.current = finalMessages;
            setMessages(finalMessages);
          }
          streamingMessageRef.current = null;
          setStreamingMessage(null);
          setIsStreaming(false);
          cancelRef.current = null;
        },
        onError: () => {
          // 如果有部分内容，也保存
          if (streamingMessageRef.current && streamingMessageRef.current.blocks.length > 0) {
            const finalMessages = [...messagesRef.current, streamingMessageRef.current];
            messagesRef.current = finalMessages;
            setMessages(finalMessages);
          }
          streamingMessageRef.current = null;
          setStreamingMessage(null);
          setIsStreaming(false);
          cancelRef.current = null;
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
      setIsStreaming(false);
      
      // 保存当前流式消息到列表
      if (streamingMessageRef.current) {
        const finalMessages = [...messagesRef.current, streamingMessageRef.current];
        messagesRef.current = finalMessages;
        setMessages(finalMessages);
      }
      streamingMessageRef.current = null;
      setStreamingMessage(null);
    }
  }, []);

  return {
    messages,
    streamingMessage,
    isStreaming,
    sendMessage,
    cancelStream,
  };
}
