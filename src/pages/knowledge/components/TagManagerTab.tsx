import { useState } from 'react';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { X, Plus } from 'lucide-react';
import type { Tag } from '../types';

interface TagManagerTabProps {
  tags: { id?: number; name: string }[];
  onChange: (tags: { id?: number; name: string }[]) => void;
}

// Mock 已有标签
const mockAvailableTags: Tag[] = [
  { id: 1, name: '产品' },
  { id: 2, name: '技术' },
  { id: 3, name: '设计' },
  { id: 4, name: '运营' },
  { id: 5, name: '市场' },
  { id: 6, name: '销售' },
];

export function TagManagerTab({ tags, onChange }: TagManagerTabProps) {
  const [tagInput, setTagInput] = useState('');
  const [showTagDropdown, setShowTagDropdown] = useState(false);

  const addTag = (tag: { id?: number; name: string }) => {
    if (!tags.find((t) => t.name === tag.name)) {
      onChange([...tags, tag]);
    }
    setTagInput('');
    setShowTagDropdown(false);
  };

  const removeTag = (tagName: string) => {
    onChange(tags.filter((t) => t.name !== tagName));
  };

  const handleTagInputKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && tagInput.trim()) {
      e.preventDefault();
      addTag({ name: tagInput.trim() });
    }
  };

  // 获取未使用的标签
  const getUnusedTags = () => {
    return mockAvailableTags.filter((tag) => !tags.find((t) => t.name === tag.name));
  };

  // 根据输入过滤标签
  const getFilteredTags = () => {
    const unused = getUnusedTags();
    if (!tagInput) return unused;
    return unused.filter((tag) => tag.name.toLowerCase().includes(tagInput.toLowerCase()));
  };

  return (
    <div className="max-w-2xl space-y-6">
      {/* 添加标签 */}
      <div className="space-y-2">
        <label className="text-sm font-medium">添加标签</label>
        <div className="relative">
          <Input
            placeholder="搜索标签或输入新标签后回车"
            value={tagInput}
            onChange={(e) => {
              setTagInput(e.target.value);
              setShowTagDropdown(true);
            }}
            onKeyDown={handleTagInputKeyDown}
            onFocus={() => setShowTagDropdown(true)}
          />

          {/* 标签下拉列表 */}
          {showTagDropdown && (
            <div className="absolute z-10 w-full mt-1 bg-popover border rounded-md shadow-lg">
              <div className="p-2">
                <div className="text-xs text-muted-foreground mb-2">已有标签：</div>
                <div className="flex flex-wrap gap-1">
                  {getFilteredTags().map((tag) => (
                    <button
                      key={tag.id}
                      onClick={() => addTag(tag)}
                      className="px-2 py-1 text-xs bg-secondary rounded hover:bg-secondary/80"
                    >
                      {tag.name}
                    </button>
                  ))}
                </div>
                {tagInput && !mockAvailableTags.find((t) => t.name === tagInput) && (
                  <>
                    <div className="border-t my-2" />
                    <button
                      onClick={() => addTag({ name: tagInput })}
                      className="flex items-center gap-2 text-sm text-primary hover:underline"
                    >
                      <Plus className="w-4 h-4" />
                      创建标签 "{tagInput}"
                    </button>
                  </>
                )}
              </div>
            </div>
          )}
        </div>
        <p className="text-xs text-muted-foreground">输入标签名称后回车，或从已有标签中选择</p>
      </div>

      {/* 已选标签 */}
      <div className="space-y-2">
        <label className="text-sm font-medium">已选标签 ({tags.length})</label>
        {tags.length > 0 ? (
          <div className="flex flex-wrap gap-2">
            {tags.map((tag, index) => (
              <Badge key={index} variant="secondary" className="gap-1 px-3 py-1">
                {tag.name}
                <button
                  onClick={() => removeTag(tag.name)}
                  className="hover:text-destructive ml-1"
                >
                  <X className="w-3 h-3" />
                </button>
              </Badge>
            ))}
          </div>
        ) : (
          <div className="text-sm text-muted-foreground p-4 border rounded-lg bg-muted/30">
            暂无标签，请添加标签来分类管理知识库
          </div>
        )}
      </div>

      {/* 快速添加常用标签 */}
      <div className="space-y-2">
        <label className="text-sm font-medium">快速添加</label>
        <div className="flex flex-wrap gap-2">
          {getUnusedTags()
            .slice(0, 6)
            .map((tag) => (
              <Button
                key={tag.id}
                variant="outline"
                size="sm"
                onClick={() => addTag(tag)}
                className="gap-1"
              >
                <Plus className="w-3 h-3" />
                {tag.name}
              </Button>
            ))}
        </div>
      </div>
    </div>
  );
}
