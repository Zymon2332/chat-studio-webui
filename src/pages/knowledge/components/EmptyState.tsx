import { FileUp, Link2, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface EmptyStateProps {
  onUpload?: () => void;
  onAddLink?: () => void;
}

export function EmptyState({ onUpload, onAddLink }: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center py-16 px-4 text-center">
      <div className="w-20 h-20 rounded-full bg-primary/10 flex items-center justify-center mb-6">
        <Sparkles className="h-10 w-10 text-primary" />
      </div>
      
      <h3 className="text-xl font-semibold mb-2">知识库空空如也</h3>
      <p className="text-muted-foreground mb-8 max-w-sm">
        上传文档或添加网页链接，让AI能够基于这些内容为您提供更准确的回答
      </p>
      
      <div className="flex items-center gap-3">
        <Button onClick={onUpload} className="gap-2">
          <FileUp className="h-4 w-4" />
          上传文档
        </Button>
        <Button variant="outline" onClick={onAddLink} className="gap-2">
          <Link2 className="h-4 w-4" />
          添加链接
        </Button>
      </div>
      
      <div className="mt-8 text-xs text-muted-foreground space-y-1">
        <p>支持格式：PDF、Word、Excel、Markdown、TXT、图片等</p>
        <p>支持网页：Confluence、Notion、Google Docs 等</p>
      </div>
    </div>
  );
}
