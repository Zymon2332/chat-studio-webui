import { useRef } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { ChatInput, type ChatInputRef } from "@/components/chat/ChatInput";
import { PromptTags } from "@/components/chat/PromptTags";
import { PromptSuggestions } from "@/components/chat/PromptSuggestions";
import { TextAnimate } from "@/components/ui/text-animate";
import { getWelcomeMessage } from "@/data/chatMock";
import { createSession } from "@/lib/session";

export function Chat() {
  const slogan = getWelcomeMessage();
  const navigate = useNavigate();
  const chatInputRef = useRef<ChatInputRef>(null);

  const handleSend = async (message: string) => {
    // 获取选中的模型
    const model = chatInputRef.current?.getSelectedModel();
    
    if (!model) {
      toast.error("请先选择模型");
      return;
    }

    try {
      // 创建会话
      const sessionId = await createSession();

      // 跳转到对话页面
      navigate(`/conversation/${sessionId}`, {
        state: {
          model,
          initialMessage: message
        }
      });

      // 延迟触发刷新会话列表事件，确保后端数据已同步
      setTimeout(() => {
        window.dispatchEvent(new CustomEvent('refresh-sessions'));
      }, 2000);
    } catch {
      toast.error("创建会话失败，请检查网络后重试");
    }
  };

  const handleTagClick = (tagId: string) => {
    console.log("点击标签:", tagId);
  };

  const handleSuggestionClick = (suggestion: string) => {
    handleSend(suggestion);
  };

  return (
    <div className="flex-1 flex flex-col min-h-full">
      {/* 主内容区域 - 居中布局 */}
      <div className="flex-1 flex flex-col items-center justify-center px-4 py-8">
        {/* Slogan - 模糊渐入动画 */}
        <TextAnimate
          as="h1"
          animation="blurInUp"
          by="character"
          once={true}
          startOnView={false}
          className="text-4xl font-serif text-center mb-8 text-foreground tracking-wide"
        >
          {slogan}
        </TextAnimate>

        {/* 输入框区域 */}
        <div className="w-full max-w-3xl">
          <ChatInput 
            ref={chatInputRef}
            onSend={handleSend}
            placeholder="给我发消息或布置任务"
            variant="default"
          />
          
          {/* 功能标签 */}
          <PromptTags onTagClick={handleTagClick} />
        </div>
      </div>

      {/* 快捷提问建议 - 底部区域 */}
      <div className="pb-8">
        <PromptSuggestions onSuggestionClick={handleSuggestionClick} />
      </div>
    </div>
  );
}
