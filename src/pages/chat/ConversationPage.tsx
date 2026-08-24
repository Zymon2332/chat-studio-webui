import { useState, useEffect, useRef, useMemo, useCallback } from "react";
import { useParams, useLocation } from "react-router-dom";
import { toast } from "sonner";
import { ChatInput, type ChatInputRef } from "./components/ChatInput";
import { ChatMessages, type ChatMessagesRef } from "./components/ChatMessages";
import {
  Context,
  ContextTrigger,
  ContextContent,
  ContextContentHeader,
  ContextContentBody,
  ContextInputUsage,
  ContextOutputUsage,
  ContextReasoningUsage,
  ContextCacheUsage,
} from "@/components/ai-elements/context";
import { getSessionMessages, fetchWorkspaceFiles, fetchFilePreviewUrl, fetchAgentReasoning } from "@/lib/session";
import { AgentReasoningContext } from "./contexts/AgentReasoningContext";
import { useChat } from "./hooks/useChat";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import {
  ResizablePanelGroup,
  ResizablePanel,
  ResizableHandle,
} from "@/components/ui/resizable";
import {
  FileTree,
  FileTreeFolder,
  FileTreeFile,
} from "@/components/ai-elements/file-tree";
import { ChatWorkspacePreview } from "./components/ChatWorkspacePreview";
import { Shimmer } from "@/components/ai-elements/shimmer";
import { AgentReasoningPanel } from "./components/AgentReasoningPanel";
import type { Message } from "@/types/chat";
import type { Model } from "@/lib/models";
import { Share2, PanelRightOpen, PanelRightClose, MessageSquare } from "lucide-react";

function normalizeMessages(messages: any[]): Message[] {
  const result: Message[] = [];
  for (const message of messages) {
    const messageType = message.type || message.messageType;
    if (messageType === "USER") {
      result.push({
        messageType: "USER",
        contents: message.contents || [],
        attributes: message.attributes || {},
      });
    } else if (messageType === "AI") {
      if (message.contents && message.contents.length > 0) {
        const lastAttrs = message.contents[message.contents.length - 1]?.attributes || {};
        result.push({
          messageType: "AI",
          contents: message.contents.map((content: any) => ({
            text: content.text || "",
            thinking: content.thinking || "",
            executedTools: content.executedTools || [],
            attributes: content.attributes || {},
          })),
          modelName: lastAttrs.modelName || "",
          tokenUsage: lastAttrs.tokenUsage ?? 0,
        });
      }
    }
  }
  return result;
}

export function ConversationPage() {
  const { id } = useParams<{ id: string }>();
  const location = useLocation();
  const chatInputRef = useRef<ChatInputRef>(null);
  const chatMessagesRef = useRef<ChatMessagesRef>(null);

  const sessionTitle = (location.state as { sessionTitle?: string } | null)?.sessionTitle ?? "";
  const pendingKey = `pending-msg-${id}`;
  const pendingData = sessionStorage.getItem(pendingKey);
  const isNewSession = !!pendingData;
  const pendingMsg = pendingData ? JSON.parse(pendingData) as { message: string; model: Model; skillIds?: string[]; agentIds?: string[] } : null;
  const preservedTitle = useRef(pendingMsg?.message || sessionTitle || "");
  const [historyMessages, setHistoryMessages] = useState<Message[]>([]);
  const [isLoadingHistory, setIsLoadingHistory] = useState(!isNewSession);
  const activeIdRef = useRef<string | null>(null);
  const initialMessageSent = useRef(false);
  const loadingStartTimeRef = useRef<number>(0);
  const MIN_LOADING_DISPLAY_TIME = 300;

  const [showPanel, setShowPanel] = useState(false);
  const [panelTab, setPanelTab] = useState<"workspace" | "reasoning">("workspace");
  const [showFileTree, setShowFileTree] = useState(true);

  const [agentReasoning, setAgentReasoning] = useState<{
    loading: boolean;
    agentName: string;
    agentAvatar: string;
    messages: Message[];
  }>({ loading: false, agentName: "", agentAvatar: "", messages: [] });

  const handleOpenAgentReasoning = useCallback(async (toolRequestId: string) => {
    if (!id) return;
    setAgentReasoning(prev => ({ ...prev, loading: true }));
    setPanelTab("reasoning");
    setShowPanel(true);
    try {
      const data = await fetchAgentReasoning(toolRequestId, id);
      setAgentReasoning({ loading: false, agentName: data.agentName, agentAvatar: data.agentAvatar, messages: normalizeMessages(data.messages) });
    } catch {
      toast.error("加载推理过程失败");
      setAgentReasoning({ loading: false, agentName: "", agentAvatar: "", messages: [] });
      setShowPanel(false);
    }
  }, [id]);
  const [workspaceFiles, setWorkspaceFiles] = useState<string[]>([]);
  const [loadingWorkspace, setLoadingWorkspace] = useState(false);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [previewContent, setPreviewContent] = useState<string | null>(null);
  const [previewLoading, setPreviewLoading] = useState(false);
  const [previewPath, setPreviewPath] = useState<string | null>(null);
  const [refreshKey, setRefreshKey] = useState(0);
  const previewContainerRef = useRef<HTMLDivElement>(null);

  const handleRefresh = useCallback(async () => {
    if (!id || !previewPath) return;
    const fileName = previewPath.split("/").pop() || "";
    setPreviewLoading(true);
    try {
      const url = await fetchFilePreviewUrl(id, previewPath);
      if (fileName.endsWith(".md") || fileName.endsWith(".markdown")) {
        const response = await fetch(url);
        const text = await response.text();
        setPreviewContent(text);
      } else {
        setPreviewUrl(url);
        setRefreshKey(k => k + 1);
      }
    } catch {
      toast.error("刷新失败");
    } finally {
      setPreviewLoading(false);
    }
  }, [id, previewPath]);

  const handleOpenNewTab = useCallback(() => {
    if (previewUrl) window.open(previewUrl, "_blank");
  }, [previewUrl]);

  const handleFullscreen = useCallback(() => {
    const el = previewContainerRef.current;
    if (!el) return;
    if (document.fullscreenElement) {
      document.exitFullscreen();
    } else {
      el.requestFullscreen();
    }
  }, []);

  const handleFileSelect = useCallback(async (path: string) => {
    if (!id) return;
    const fileName = path.split("/").pop() || "";
    if (!fileName.includes(".")) return;
    if (path === previewPath) return;
    setPreviewPath(path);
    setPreviewLoading(true);
    setPreviewUrl(null);
    setPreviewContent(null);
    try {
      const url = await fetchFilePreviewUrl(id, path);
      if (fileName.endsWith(".md") || fileName.endsWith(".markdown")) {
        const response = await fetch(url);
        const text = await response.text();
        setPreviewContent(text);
      } else {
        setPreviewUrl(url);
      }
      setShowFileTree(false);
    } catch {
      toast.error("加载文件预览失败");
    } finally {
      setPreviewLoading(false);
    }
  }, [id, previewPath]);

  useEffect(() => {
    setShowPanel(false);
    setPanelTab("workspace");
    setWorkspaceFiles([]);
    setPreviewContent(null);
    setShowFileTree(true);
    setAgentReasoning({ loading: false, agentName: "", agentAvatar: "", messages: [] });
  }, [id]);

  useEffect(() => {
    if (!id) return;
    if (!showPanel || panelTab !== "workspace") return;

    setLoadingWorkspace(true);
    fetchWorkspaceFiles(id)
      .then(setWorkspaceFiles)
      .catch(() => toast.error("加载工作空间失败"))
      .finally(() => setLoadingWorkspace(false));
  }, [showPanel, id, panelTab]);

  const handleTogglePanel = useCallback(() => {
    setShowPanel(prev => {
      if (prev) {
        setPreviewUrl(null);
        setPreviewContent(null);
        setPreviewPath(null);
        setRefreshKey(0);
        setShowFileTree(true);
      }
      return !prev;
    });
  }, []);

  const [currentModelId, setCurrentModelId] = useState<number | undefined>(pendingMsg?.model?.id);
  const handleModelChange = useCallback((model: Model) => {
    setCurrentModelId(model.id);
  }, []);
  const { messages, isStreaming, sendMessage, cancelStream, usedTokens, maxTokens } = useChat(id || "", currentModelId);
  const [isInputFocused, setIsInputFocused] = useState(false);
  const prevStreamingRef = useRef(isStreaming);
  useEffect(() => {
    if (prevStreamingRef.current && !isStreaming) {
      if (previewPath) handleRefresh();
      if (id && showPanel && panelTab === "workspace") {
        fetchWorkspaceFiles(id).then(setWorkspaceFiles).catch(() => {});
      }
    }
    prevStreamingRef.current = isStreaming;
  }, [isStreaming, previewPath, handleRefresh, id, showPanel, panelTab]);

  useEffect(() => {
    if (isNewSession) {
      setIsLoadingHistory(false);
      return;
    }

    const fetchMessages = async () => {
      if (!id) return;
      activeIdRef.current = id;
      loadingStartTimeRef.current = Date.now();
      setIsLoadingHistory(true);

      try {
        const data = await getSessionMessages(id);
        if (activeIdRef.current !== id) return;
        const normalizedData = normalizeMessages(data);
        setHistoryMessages(normalizedData);
      } catch {
        if (activeIdRef.current !== id) return;
        toast.error("加载历史消息失败");
      } finally {
        if (activeIdRef.current !== id) return;
        const elapsedTime = Date.now() - loadingStartTimeRef.current;
        const remainingTime = Math.max(0, MIN_LOADING_DISPLAY_TIME - elapsedTime);
        setTimeout(() => {
          setIsLoadingHistory(false);
        }, remainingTime);
      }
    };

    fetchMessages();
  }, [id, isNewSession]);

  useEffect(() => {
    if (
      !initialMessageSent.current &&
      pendingMsg &&
      !isLoadingHistory &&
      historyMessages.length === 0
    ) {
      initialMessageSent.current = true;
      sessionStorage.removeItem(pendingKey);
      sendMessage(pendingMsg.message, pendingMsg.model, pendingMsg.skillIds, pendingMsg.agentIds);
    }
  }, [pendingMsg, pendingKey, isLoadingHistory, historyMessages.length, sendMessage]);

  const handleSend = async (text: string) => {
    if (!id) return;
    chatMessagesRef.current?.scrollToBottom();

    const model = chatInputRef.current?.getSelectedModel();
    const skillIds = chatInputRef.current?.getSkillIds();
    const agentIds = chatInputRef.current?.getAgentIds();
    if (!model) {
      toast.error("请先选择模型");
      return;
    }

    await sendMessage(text, model, skillIds, agentIds);
  };

  function buildFileTree(paths: string[]): React.ReactNode {
    const tree: Record<string, any> = {};
    for (const path of paths.sort()) {
      const parts = path.split("/");
      let node = tree;
      for (let i = 0; i < parts.length; i++) {
        const part = parts[i];
        if (i === parts.length - 1) {
          node[part] = { _type: "file" };
        } else {
          node[part] ??= { _type: "folder", children: {} };
          node = node[part].children;
        }
      }
    }

    function render(nodes: Record<string, any>, base = ""): React.ReactNode[] {
      return Object.entries(nodes).map(([name, data]) => {
        const path = base ? `${base}/${name}` : `/${name}`;
        if (data._type === "folder") {
          return (
            <FileTreeFolder key={path} path={path} name={name}>
              {render(data.children, path)}
            </FileTreeFolder>
          );
        }
        return <FileTreeFile key={path} path={path} name={name} />;
      });
    }

    return render(tree);
  }

  const displayMessages: Message[] = useMemo(
    () => [...historyMessages, ...messages],
    [historyMessages, messages]
  );

  const modelId = pendingMsg?.model?.modelName;

  const fileTree = useMemo(() => buildFileTree(workspaceFiles), [workspaceFiles]);

  const MAX_TITLE_LENGTH = 20;

  const headerTitle = useMemo(() => {
    return preservedTitle.current || sessionTitle;
  }, [sessionTitle]);

  const displayTitle =
    headerTitle.length > MAX_TITLE_LENGTH
      ? headerTitle.slice(0, MAX_TITLE_LENGTH) + "…"
      : headerTitle;

  return (
    <ResizablePanelGroup orientation="horizontal" className="flex-1 min-h-0">
      <ResizablePanel defaultSize={60} minSize={30}>
        <div className="flex h-full flex-col relative">
          {/* Title bar */}
          {displayTitle && (
            <div className="sticky top-0 z-10 bg-background/80 backdrop-blur-xl border-b border-border/50">
              <div className="flex items-center justify-between px-6 py-3">
                <div className="flex items-center gap-3">
                  <div className="w-1 h-5 rounded-full bg-primary" />
                  <h1 className="text-sm font-medium text-foreground/90">
                    {displayTitle}
                  </h1>
                </div>
                <div className="flex items-center gap-1">
                  <Button variant="ghost" size="icon-sm" className="text-muted-foreground hover:text-foreground">
                    <Share2 size={15} />
                  </Button>
                  <Button variant="ghost" size="icon-sm" className="text-muted-foreground hover:text-foreground" onClick={handleTogglePanel}>
                    {showPanel ? <PanelRightClose size={15} /> : <PanelRightOpen size={15} />}
                  </Button>
                </div>
              </div>
              <div className="h-px bg-border" />
            </div>
          )}

          {/* Loading state */}
          {isLoadingHistory ? (
            <div className="flex-1 flex items-center justify-center">
              <div className="flex flex-col items-center gap-3">
                <div className="w-6 h-6 rounded-full border-2 border-muted-foreground/30 border-t-foreground animate-spin" />
                <Shimmer duration={1.5} className="text-sm text-muted-foreground">正在努力加载中...</Shimmer>
              </div>
            </div>
          ) : displayMessages.length === 0 ? (
            /* Empty state */
            <div className="flex-1 flex flex-col items-center justify-center gap-4 p-8 text-center">
              <div className="w-12 h-12 rounded-full bg-muted flex items-center justify-center">
                <MessageSquare className="w-5 h-5 text-muted-foreground" />
              </div>
              <div>
                <h3 className="text-base font-semibold text-foreground/80 mb-1">开始对话</h3>
                <p className="text-sm text-muted-foreground/70">发送一条消息，开始你的 AI 协作</p>
              </div>
            </div>
          ) : (
            <AgentReasoningContext.Provider value={{ openAgentReasoning: handleOpenAgentReasoning }}>
              <ChatMessages ref={chatMessagesRef} messages={displayMessages} />
            </AgentReasoningContext.Provider>
          )}

          {/* Chat input area */}
          <Context usedTokens={usedTokens} maxTokens={maxTokens} modelId={modelId}>
            <div className="flex-shrink-0 bg-background/80 backdrop-blur-sm">
              <div className="max-w-4xl mx-auto px-4 pb-4 pt-3">
                <div className="relative">
                  {isInputFocused && (
                    <div className="absolute -inset-1 rounded-2xl bg-muted/60 pointer-events-none" />
                  )}
                  <ChatInput
                    ref={chatInputRef}
                    onSend={handleSend}
                    onCancel={cancelStream}
                    isStreaming={isStreaming}
                    placeholder="输入消息... @ 可引用智能体，/ 可调用技能"
                    footerExtra={<ContextTrigger />}
                    onFocusChange={setIsInputFocused}
                    onModelChange={handleModelChange}
                  />
                </div>
              </div>
            </div>
            <ContextContent>
              <ContextContentHeader />
              <ContextContentBody>
                <ContextInputUsage />
                <ContextOutputUsage />
                <ContextReasoningUsage />
                <ContextCacheUsage />
              </ContextContentBody>
            </ContextContent>
          </Context>
        </div>
      </ResizablePanel>

      {/* Side panel */}
      {showPanel && (
        <>
          <ResizableHandle withHandle />
          <ResizablePanel defaultSize={40} minSize="20%" maxSize="70%">
            <div className="h-full flex flex-col bg-card/50">
              <div className="px-3 pt-2 pb-2 border-b border-border/30">
                <Select value={panelTab} onValueChange={(v) => setPanelTab(v as "workspace" | "reasoning")}>
                  <SelectTrigger className="border-none shadow-none bg-transparent hover:bg-accent/50 rounded-md">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="workspace">工作空间</SelectItem>
                    <SelectItem value="reasoning">推理过程</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {panelTab === "workspace" && (
                loadingWorkspace ? (
                  <div className="flex-1 overflow-y-auto px-3 pt-2 pb-4">
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <div className="w-4 h-4 rounded-full border-2 border-muted-foreground/30 border-t-foreground animate-spin" />
                      加载中...
                    </div>
                  </div>
                ) : workspaceFiles.length === 0 ? (
                  <div className="flex-1 overflow-y-auto px-3 pt-2 pb-4">
                    <div className="text-xs text-muted-foreground/40">暂无内容</div>
                  </div>
                ) : (
                  <ResizablePanelGroup className="flex-1">
                    {showFileTree && (
                      <ResizablePanel defaultSize="30%" minSize="25%">
                        <div className="h-full overflow-y-auto pt-2 px-3 pb-4">
                          <FileTree className="border-none" onSelect={handleFileSelect}>
                            {fileTree}
                          </FileTree>
                        </div>
                      </ResizablePanel>
                    )}
                    {(previewUrl || previewContent) && (
                      <>
                        {showFileTree && <ResizableHandle withHandle />}
                        <ResizablePanel defaultSize="70%" minSize="25%">
                          <ChatWorkspacePreview
                            previewUrl={previewUrl}
                            previewContent={previewContent}
                            previewLoading={previewLoading}
                            previewPath={previewPath}
                            refreshKey={refreshKey}
                            containerRef={previewContainerRef}
                            onRefresh={handleRefresh}
                            onOpenNewTab={handleOpenNewTab}
                            onFullscreen={handleFullscreen}
                            onToggleFileTree={() => setShowFileTree(v => !v)}
                            showFileTree={showFileTree}
                          />
                        </ResizablePanel>
                      </>
                    )}
                  </ResizablePanelGroup>
                )
              )}
              {panelTab === "reasoning" && (
                <div className="flex-1 overflow-y-auto px-4 pb-4">
                  <AgentReasoningPanel
                    loading={agentReasoning.loading}
                    agentName={agentReasoning.agentName}
                    agentAvatar={agentReasoning.agentAvatar}
                    messages={agentReasoning.messages}
                  />
                </div>
              )}
            </div>
          </ResizablePanel>
        </>
      )}
    </ResizablePanelGroup>
  );
}
