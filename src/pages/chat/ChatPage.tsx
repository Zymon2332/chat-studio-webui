import { useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { ChatInput, type ChatInputRef } from "./components/ChatInput";
import { Suggestions, Suggestion } from "@/components/ai-elements/suggestion";
import { createSession } from "@/lib/session";
import { useSession } from "@/contexts/SessionContext";
import { motion } from "motion/react";
import { BrandMark } from "@/components/BrandMark";

type Mode = "office" | "coding" | "design";

const PLACEHOLDER_SUFFIX = "@ 引用智能体，/ 调用技能";

const modeConfig: Record<Mode, { label: string; icon: string; placeholder: string }> = {
  office: { label: "日常办公", icon: "💼", placeholder: `写邮件、做报表、整理文档... ${PLACEHOLDER_SUFFIX}` },
  coding: { label: "编程开发", icon: "💻", placeholder: `写代码、调试 Bug、代码审查... ${PLACEHOLDER_SUFFIX}` },
  design: { label: "创意设计", icon: "🎨", placeholder: `UI 设计、原型图、设计规范... ${PLACEHOLDER_SUFFIX}` },
};

const modeSuggestions: Record<Mode, string[]> = {
  office: ["写一封邮件", "整理会议纪要", "翻译文档", "做一份周报"],
  coding: ["解释这段代码", "写一个 React 组件", "优化性能", "代码审查"],
  design: ["设计系统配色", "UI 组件方案", "用户流程设计", "设计规范"],
};

export function ChatPage() {
  const navigate = useNavigate();
  const chatInputRef = useRef<ChatInputRef>(null);
  const { addSession } = useSession();
  const [mode, setMode] = useState<Mode>("office");
  const config = modeConfig[mode];

  const handleSend = async (message: string) => {
    const model = chatInputRef.current?.getSelectedModel();
    const skillIds = chatInputRef.current?.getSkillIds();
    const agentIds = chatInputRef.current?.getAgentIds();

    if (!model) {
      toast.error("请先选择模型");
      return;
    }

    try {
      const sessionId = await createSession();
      sessionStorage.setItem(
        `pending-msg-${sessionId}`,
        JSON.stringify({ message, model, skillIds, agentIds })
      );
      navigate(`/conversation/${sessionId}`);
      addSession(sessionId, message);
    } catch {
      toast.error("创建会话失败，请检查网络后重试");
    }
  };

  return (
    <div className="flex-1 flex flex-col min-h-full relative">
      <div className="flex-1 flex flex-col items-center justify-center px-4 py-8 relative z-10">
        <div className="w-full max-w-3xl space-y-0">
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
            className="mb-7 space-y-3"
          >
            <div className="flex items-center gap-3">
              <div className="grid size-10 place-items-center rounded-xl bg-primary text-primary-foreground">
                <BrandMark className="size-6" />
              </div>
              <h1 className="text-3xl md:text-4xl font-semibold tracking-tight text-foreground">
                Chat Studio
              </h1>
            </div>

            <div className="flex items-center gap-3 pl-[52px]">
              <span className="h-px w-8 bg-border shrink-0" />
              <p className="text-base text-muted-foreground">你的 AI 工作伙伴</p>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.15, ease: [0.16, 1, 0.3, 1] }}
            className="flex items-center gap-1 pb-3"
          >
            {(Object.keys(modeConfig) as Mode[]).map((key) => (
              <button
                key={key}
                type="button"
                onClick={() => setMode(key)}
                className="relative px-4 py-1.5 rounded-lg text-sm transition-all duration-300"
              >
                {mode === key && (
                  <motion.span
                    layoutId="mode-bg"
                    className="absolute inset-0 rounded-lg bg-primary"
                    transition={{ type: "spring", stiffness: 500, damping: 35 }}
                  />
                )}
                <span className={`relative z-10 transition-colors duration-300 ${
                  mode === key ? "text-primary-foreground font-medium" : "text-muted-foreground hover:text-foreground"
                }`}>
                  {modeConfig[key].icon} {modeConfig[key].label}
                </span>
              </button>
            ))}
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.25, ease: [0.16, 1, 0.3, 1] }}
            className="pb-3"
          >
            <Suggestions>
              {modeSuggestions[mode].map((text) => (
                <Suggestion key={text} suggestion={text} />
              ))}
            </Suggestions>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.35, ease: [0.16, 1, 0.3, 1] }}
          >
            <ChatInput
              ref={chatInputRef}
              onSend={handleSend}
              placeholder={config.placeholder}
            />
          </motion.div>
        </div>
      </div>
    </div>
  );
}
