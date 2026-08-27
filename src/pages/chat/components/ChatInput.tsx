import { forwardRef, useRef, useCallback, useImperativeHandle, useState, useEffect } from "react";
import { Paperclip, FileText, X, Image as ImageIcon, AudioLines, Video } from "lucide-react";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import { uploadUserFile } from "@/lib/common";
import type { ContentType } from "../lib/chat";
import {
  PromptInputSubmit,
} from "@/components/ai-elements/prompt-input";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Attachment,
  AttachmentGroup,
  AttachmentMedia,
  AttachmentContent,
  AttachmentTitle,
  AttachmentDescription,
  AttachmentActions,
  AttachmentAction,
} from "@/components/ui/attachment";
import { ModelSelector, type ModelSelectorRef } from "./ModelSelector";
import { TipTapEditor, type TipTapEditorRef } from "./TipTapEditor";
import type { Model } from "@/lib/models";

export interface ChatInputRef {
  getSelectedModel: () => Model | null;
  getAgentIds: () => string[];
  getSkillIds: () => string[];
}

export interface SendPayload {
  text: string;
  fileContents: { uploadId: string; contentType: Exclude<ContentType, "TEXT">; url: string }[];
}

interface ChatInputProps {
  onSend?: (payload: SendPayload) => void;
  onCancel?: () => void;
  isStreaming?: boolean;
  placeholder?: string;
  className?: string;
  footerExtra?: React.ReactNode;
  onFocusChange?: (focused: boolean) => void;
  onModelChange?: (model: Model) => void;
}

type AttachmentStatus = "uploading" | "ready" | "error";

interface AttachmentItem {
  id: string;
  file: File;
  url: string;
  status: AttachmentStatus;
  uploadId?: string;
  contentType?: ContentType;
  progress?: number;
}

type FileCategory = Exclude<ContentType, "TEXT">;

type PickerCategory = "IMAGE" | "AUDIO" | "VIDEO" | "PDF";

const ACCEPT_MAP: Record<PickerCategory, string> = {
  IMAGE: "image/*",
  AUDIO: "audio/*",
  VIDEO: "video/*",
  PDF: "application/pdf,.pdf",
};

/** 根据 MIME + 扩展名映射 contentType（非四类返回 null） */
function resolveContentType(file: File): FileCategory | null {
  const type = file.type;
  if (type.startsWith("image/")) return "IMAGE";
  if (type.startsWith("video/")) return "VIDEO";
  if (type.startsWith("audio/")) return "AUDIO";
  const ext = file.name.split(".").pop()?.toLowerCase() || "";
  if (type === "application/pdf" || ext === "pdf") return "PDF";
  return null;
}

export const ChatInput = forwardRef<ChatInputRef, ChatInputProps>(
  (
    {
      onSend,
      onCancel,
      isStreaming = false,
      placeholder = "给我发消息或布置任务",
      className,
      footerExtra,
      onFocusChange,
      onModelChange,
    },
    ref
  ) => {
    const editorRef = useRef<TipTapEditorRef>(null);
    const modelSelectorRef = useRef<ModelSelectorRef>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);
    const chosenTypeRef = useRef<PickerCategory | null>(null);
    const [attachments, setAttachments] = useState<AttachmentItem[]>([]);

    const status = isStreaming ? "streaming" : "ready";

    // 清理附件生成的 objectURL
    useEffect(() => {
      return () => {
        setAttachments((prev) => {
          prev.forEach((item) => URL.revokeObjectURL(item.url));
          return prev;
        });
      };
    }, []);

    const updateAttachment = useCallback((id: string, patch: Partial<AttachmentItem>) => {
      setAttachments((prev) => prev.map((item) => (item.id === id ? { ...item, ...patch } : item)));
    }, []);

    const pickFile = useCallback((category: PickerCategory) => {
      chosenTypeRef.current = category;
      const input = fileInputRef.current;
      if (input) {
        input.accept = ACCEPT_MAP[category];
        input.click();
      }
    }, []);

    const handleFilesSelected = useCallback(
      (e: React.ChangeEvent<HTMLInputElement>) => {
        const category = chosenTypeRef.current;
        const files = Array.from(e.target.files || []);
        e.target.value = "";
        chosenTypeRef.current = null;
        if (!category || files.length === 0) return;

        const valid: File[] = [];
        const rejected: File[] = [];
        for (const file of files) {
          if (resolveContentType(file) === category) {
            valid.push(file);
          } else {
            rejected.push(file);
          }
        }

        rejected.forEach((file) => toast.error(`${file.name} 不是所选类型`));
        if (valid.length === 0) return;

        const newItems: AttachmentItem[] = valid.map((file) => ({
          id: `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
          file,
          url: URL.createObjectURL(file),
          status: "uploading",
          contentType: category,
          progress: 0,
        }));

        setAttachments((prev) => [...prev, ...newItems]);

        for (const item of newItems) {
          uploadUserFile(item.file, (progress) => {
            updateAttachment(item.id, { progress });
          })
            .then((uploadId) => {
              updateAttachment(item.id, { status: "ready", uploadId, progress: 100 });
            })
            .catch(() => {
              updateAttachment(item.id, { status: "error", progress: undefined });
              toast.error(`上传 ${item.file.name} 失败`);
            });
        }
      },
      [updateAttachment]
    );

    const removeAttachment = useCallback((index: number) => {
      setAttachments((prev) => {
        const target = prev[index];
        if (target) URL.revokeObjectURL(target.url);
        return prev.filter((_, i) => i !== index);
      });
    }, []);

    const hasBlockingUpload = attachments.some(
      (a) => a.status === "uploading" || a.status === "error"
    );
    const sendDisabled = hasBlockingUpload;

    const submitText = useCallback(() => {
      if (isStreaming || hasBlockingUpload) return;
      const text = editorRef.current?.getText() || "";
      const readyFiles = attachments.filter((a) => a.status === "ready");
      const fileContents: SendPayload["fileContents"] = readyFiles
        .filter((a): a is AttachmentItem & { uploadId: string; contentType: Exclude<ContentType, "TEXT"> } => !!a.uploadId && !!a.contentType)
        .map((a) => ({ uploadId: a.uploadId, contentType: a.contentType, url: a.url }));

      if (!text && fileContents.length === 0) return;

      onSend?.({ text, fileContents });
      editorRef.current?.clear();
      // 已发送文件的 objectURL 交由消息展示使用，不在此 revoke；仅清空输入区附件
      setAttachments([]);
    }, [onSend, isStreaming, hasBlockingUpload, attachments]);

    const handleEnterSubmit = useCallback(() => {
      submitText();
    }, [submitText]);

    useImperativeHandle(ref, () => ({
      getSelectedModel: () => modelSelectorRef.current?.getSelectedModel() ?? null,
      getAgentIds: () => editorRef.current?.getAgentIds() ?? [],
      getSkillIds: () => editorRef.current?.getSkillIds() ?? [],
    }), []);

    return (
      <div className={cn("rounded-2xl border border-border/40 bg-card/50 shadow-sm backdrop-blur-sm", className)}>
        <input
          ref={fileInputRef}
          type="file"
          multiple
          hidden
          onChange={handleFilesSelected}
        />

        {attachments.length > 0 && (
          <AttachmentGroup className="px-3 pt-3">
            {attachments.map((item, index) => {
              const isImage = item.file.type.startsWith("image/");
              return (
                <Attachment key={item.id} size="sm" state={item.status === "error" ? "error" : item.status === "uploading" ? "uploading" : "done"}>
                  <AttachmentMedia variant={isImage ? "image" : "icon"}>
                    {isImage ? (
                      <img src={item.url} alt={item.file.name} />
                    ) : (
                      <FileText className="size-4" />
                    )}
                  </AttachmentMedia>
                  <AttachmentContent>
                    <AttachmentTitle>{item.file.name}</AttachmentTitle>
                    <AttachmentDescription>
                      {item.status === "uploading"
                        ? `${item.progress ?? 0}%`
                        : item.status === "error"
                          ? "上传失败"
                          : `${(item.file.size / 1024).toFixed(0)} KB`}
                    </AttachmentDescription>
                  </AttachmentContent>
                  <AttachmentActions>
                    <AttachmentAction onClick={() => removeAttachment(index)}>
                      <X />
                    </AttachmentAction>
                  </AttachmentActions>
                </Attachment>
              );
            })}
          </AttachmentGroup>
        )}

        <TipTapEditor
          ref={editorRef}
          placeholder={placeholder}
          onEnterSubmit={handleEnterSubmit}
          onFocusChange={onFocusChange}
        />

        <div className="flex items-center justify-between px-3 pb-3 pt-1">
          <div className="flex items-center gap-1">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon-sm" title="添加附件">
                  <Paperclip className="size-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="start">
                <DropdownMenuItem onSelect={() => pickFile("IMAGE")}>
                  <ImageIcon className="size-4" />
                  图片
                </DropdownMenuItem>
                <DropdownMenuItem onSelect={() => pickFile("AUDIO")}>
                  <AudioLines className="size-4" />
                  音频
                </DropdownMenuItem>
                <DropdownMenuItem onSelect={() => pickFile("VIDEO")}>
                  <Video className="size-4" />
                  视频
                </DropdownMenuItem>
                <DropdownMenuItem onSelect={() => pickFile("PDF")}>
                  <FileText className="size-4" />
                  PDF
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
            <ModelSelector ref={modelSelectorRef} onModelChange={onModelChange} />
          </div>

          <div className="flex items-center gap-2">
            {footerExtra}
            <PromptInputSubmit
              status={status}
              onStop={onCancel}
              onClick={() => submitText()}
              disabled={sendDisabled}
            />
          </div>
        </div>
      </div>
    );
  }
);

ChatInput.displayName = "ChatInput";
