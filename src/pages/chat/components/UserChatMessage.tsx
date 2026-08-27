"use client";

import { memo } from "react";
import { Message, MessageContent, MessageFooter } from "@/components/ui/message";
import { Bubble, BubbleContent } from "@/components/ui/bubble";
import {
  Attachment,
  AttachmentMedia,
  AttachmentContent,
  AttachmentTitle,
  AttachmentDescription,
  AttachmentActions,
  AttachmentAction,
} from "@/components/ui/attachment";
import { FileText, Download } from "lucide-react";
import type { UserMessage, UserContentType } from "@/types/chat";
import { MessageActions } from "./MessageActions";

interface UserChatMessageProps {
  message: UserMessage;
  dateTime: string;
}

function downloadFile(url: string) {
  const a = document.createElement("a");
  a.href = url;
  a.download = "";
  a.rel = "noopener";
  document.body.appendChild(a);
  a.click();
  a.remove();
}

function FileBlock({
  type,
  url,
  text,
}: {
  type: Exclude<UserContentType, "TEXT">;
  url?: string;
  text?: string;
}) {
  if (!url) {
    return (
      <Attachment orientation="horizontal" state="done" className="bg-muted/60">
        <AttachmentMedia variant="icon">
          <FileText className="size-4 text-muted-foreground" />
        </AttachmentMedia>
        <AttachmentContent>
          <AttachmentTitle className="text-muted-foreground">文件不可用</AttachmentTitle>
        </AttachmentContent>
      </Attachment>
    );
  }

  switch (type) {
    case "IMAGE":
      return (
        <a href={url} target="_blank" rel="noopener noreferrer" className="block max-w-full self-end">
          <Attachment orientation="vertical" state="done" className="cursor-pointer">
            <AttachmentMedia variant="image">
              <img src={url} alt={text || "图片"} loading="lazy" />
            </AttachmentMedia>
          </Attachment>
        </a>
      );
    case "AUDIO":
      return (
        <audio
          controls
          preload="none"
          src={url}
          className="block w-full max-w-[320px] self-end"
        />
      );
    case "VIDEO":
      return (
        <video
          controls
          preload="none"
          src={url}
          className="block w-[min(360px,100%)] self-end rounded-xl border border-border"
        />
      );
    case "PDF":
      return (
        <Attachment orientation="horizontal" state="done" className="self-end">
          <AttachmentMedia variant="icon">
            <FileText className="size-4 text-destructive" />
          </AttachmentMedia>
          <AttachmentContent>
            <AttachmentTitle>{text || "PDF 文件"}</AttachmentTitle>
            <AttachmentDescription>PDF</AttachmentDescription>
          </AttachmentContent>
          <AttachmentActions>
            <AttachmentAction
              type="button"
              title="下载"
              aria-label="下载"
              size="icon-sm"
              variant="secondary"
              onClick={() => downloadFile(url)}
            >
              <Download className="size-4" />
            </AttachmentAction>
          </AttachmentActions>
        </Attachment>
      );
    default:
      return null;
  }
}

export const UserChatMessage = memo(function UserChatMessage({
  message,
  dateTime,
}: UserChatMessageProps) {
  const textContents = message.contents.filter((c) => c.type === "TEXT");
  const fileContents = message.contents.filter(
    (c): c is { type: Exclude<UserContentType, "TEXT">; url?: string; text?: string } =>
      c.type !== "TEXT"
  );
  const text = textContents.map((c) => c.text || "").join("\n");

  const handleCopy = () => {
    navigator.clipboard.writeText(text);
  };

  return (
    <Message align="end" className="w-fit max-w-full ml-auto">
      <MessageContent>
        {fileContents.map((file, i) => (
          <FileBlock key={`${file.type}-${file.url || i}`} type={file.type} url={file.url} text={file.text} />
        ))}

        {text && (
          <Bubble variant="default">
            <BubbleContent className="bg-primary text-primary-foreground rounded-3xl">
              <div className="text-sm whitespace-pre-wrap wrap-break-word">{text}</div>
            </BubbleContent>
          </Bubble>
        )}

        <MessageFooter className="opacity-0 group-hover/message:opacity-100 transition-opacity">
          <MessageActions mode="user" dateTime={dateTime} onCopy={handleCopy} />
        </MessageFooter>
      </MessageContent>
    </Message>
  );
});
