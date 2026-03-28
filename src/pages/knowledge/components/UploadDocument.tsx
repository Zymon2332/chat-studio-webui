'use client';

import { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Slider } from '@/components/ui/slider';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { X, Upload, FileText, Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';
import { fetchDocTags, uploadDocumentV2, previewChunks, type PreviewChunkResponse } from '@/lib/knowledge';
import { fetchPostSignature, uploadFileToS3, confirmUpload, type PostSignatureResponse } from '@/lib/common';
import type { Tag } from '../types';

interface UploadDocumentProps {
  kbId: number;
  knowledgeBaseName: string;
  onClose: () => void;
  onSuccess: () => void;
}

type SplitMode = 'HEADER' | 'LENGTH' | 'REGEX';

const splitModeOptions = [
  { value: 'LENGTH' as const, label: '按长度分割', desc: '按固定字符长度切分文档' },
  { value: 'HEADER' as const, label: '按标题分割', desc: '按文档标题层级切分' },
  { value: 'REGEX' as const, label: '正则分割', desc: '使用正则表达式自定义切分规则' },
];

export function UploadDocument({ kbId, knowledgeBaseName, onClose, onSuccess }: UploadDocumentProps) {
  const [file, setFile] = useState<File | null>(null);
  const [splitMode, setSplitMode] = useState<SplitMode>('LENGTH');
  const [splitLength, setSplitLength] = useState(500);
  const [headerLevel, setHeaderLevel] = useState(1);
  const [overlapLength, setOverlapLength] = useState(16);
  const [regex, setRegex] = useState('');
  const [joinDelimiter, setJoinDelimiter] = useState('\\n');
  const [tags, setTags] = useState<{id?: number; name: string}[]>([]);
  const [availableTags, setAvailableTags] = useState<Tag[]>([]);
  const [tagInput, setTagInput] = useState('');
  const [showTagDropdown, setShowTagDropdown] = useState(false);
  const [isUploadingToS3, setIsUploadingToS3] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [isConfirming, setIsConfirming] = useState(false);
  const [previewData, setPreviewData] = useState<PreviewChunkResponse | null>(null);
  const [isPreviewLoading, setIsPreviewLoading] = useState(false);
  const [uploadId, setUploadId] = useState<string>('');
  const fileInputRef = useRef<HTMLInputElement>(null);
  const signatureRef = useRef<PostSignatureResponse | null>(null);

  // 获取可用标签
  useEffect(() => {
    const loadTags = async () => {
      try {
        const tags = await fetchDocTags();
        setAvailableTags(tags);
      } catch (error) {
        console.error('Failed to load tags:', error);
      }
    };
    loadTags();
  }, []);

  const handleFileSelect = async (selectedFile: File) => {
    setFile(selectedFile);
    setPreviewData(null);
    setUploadId('');
    signatureRef.current = null;

    // 立即开始上传到 S3
    setIsUploadingToS3(true);
    setUploadProgress(0);

    try {
      const signature = await fetchPostSignature({
        fileOriginalName: selectedFile.name,
        contentType: selectedFile.type,
      });

      await uploadFileToS3(selectedFile, selectedFile.type, signature, (progress) => {
        setUploadProgress(progress);
      });

      // S3 上传成功，立即调用确认接口
      const uploadedId = await confirmUpload({
        objectKey: signature.fields.key,
        originalFileName: selectedFile.name,
        taskId: signature.taskId,
        appId: 'DOCUMENT',
      });

      // 保存签名信息和 uploadId
      signatureRef.current = signature;
      setUploadId(uploadedId);
    } catch (error) {
      toast.error('文件上传失败，请重试');
      console.error('S3 upload failed:', error);
      setFile(null);
      setUploadId('');
    } finally {
      setIsUploadingToS3(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    const droppedFile = e.dataTransfer.files[0];
    if (droppedFile) {
      handleFileSelect(droppedFile);
    }
  };

  const handlePreview = async () => {
    if (!uploadId) {
      toast.error('请先上传文件');
      return;
    }

    setIsPreviewLoading(true);
    setPreviewData(null); // 清空之前的预览数据

    try {
      const requestData: import('@/lib/knowledge').PreviewChunkRequest = {
        uploadId,
        splitMode,
        splitLength,
      };

      // 根据 splitMode 添加条件参数
      if (splitMode === 'HEADER') {
        requestData.headerLevel = headerLevel;
      } else if (splitMode === 'LENGTH') {
        requestData.overlapLength = overlapLength;
      } else if (splitMode === 'REGEX') {
        requestData.regex = regex;
        requestData.joinDelimiter = joinDelimiter;
      }

      const result = await previewChunks(requestData);
      setPreviewData(result);
    } catch (error) {
      toast.error('预览生成失败');
      setPreviewData(null);
      console.error('Preview failed:', error);
    } finally {
      setIsPreviewLoading(false);
    }
  };

  const handleConfirm = async () => {
    if (!file || !uploadId) {
      toast.error('请先上传文件');
      return;
    }

    // 校验 splitLength 最小值
    if (splitLength < 16) {
      toast.error('最大切分长度不能小于 16');
      return;
    }

    setIsConfirming(true);

    try {
      // 构建请求参数
      const requestData: import('@/lib/knowledge').UploadDocumentRequest = {
        kbId,
        uploadId,
        splitMode,
        splitLength,
        tags: tags.map(tag => tag.id ? { id: tag.id, name: tag.name } : { name: tag.name }),
      };

      // 根据 splitMode 添加条件参数
      if (splitMode === 'HEADER') {
        requestData.headerLevel = headerLevel;
      } else if (splitMode === 'LENGTH') {
        requestData.overlapLength = overlapLength;
      } else if (splitMode === 'REGEX') {
        requestData.regex = regex;
        requestData.joinDelimiter = joinDelimiter;
      }

      // 调用上传文档接口
      await uploadDocumentV2(requestData);

      toast.success('文档上传成功');
      onSuccess();
    } catch (error) {
      toast.error('处理失败，请稍后重试');
      console.error('Confirm failed:', error);
    } finally {
      setIsConfirming(false);
    }
  };

  const addTag = (tag: { id?: number; name: string }) => {
    if (!tags.find(t => t.name === tag.name)) {
      setTags([...tags, tag]);
    }
    setTagInput('');
    setShowTagDropdown(false);
  };

  const removeTag = (tagName: string) => {
    setTags(tags.filter(t => t.name !== tagName));
  };

  const handleTagInputKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && tagInput.trim()) {
      e.preventDefault();
      addTag({ name: tagInput.trim() });
    }
  };

  const canConfirm = uploadId && (
    splitMode === 'LENGTH' ||
    (splitMode === 'HEADER') ||
    (splitMode === 'REGEX' && regex.trim())
  );

  return (
    <div className="h-full flex flex-col bg-background">
      {/* Header */}
      <div className="flex items-center justify-between px-6 py-4 border-b">
        <div>
          <h2 className="text-lg font-semibold">上传文档</h2>
          <p className="text-sm text-muted-foreground">
            上传文档到「{knowledgeBaseName}」
          </p>
        </div>
        <Button variant="ghost" size="icon" onClick={onClose}>
          <X className="h-5 w-5" />
        </Button>
      </div>

      {/* 主内容区 */}
      <div className="flex-1 flex overflow-hidden">
        {/* 左侧：配置区 */}
        <div className="w-1/2 p-6 border-r overflow-y-auto">
          <div className="space-y-6 max-w-lg mx-auto">
            {/* 文件上传 */}
            <div className="space-y-2">
              <Label>选择文件 *</Label>
              <div
                onDrop={handleDrop}
                onDragOver={(e) => e.preventDefault()}
                onClick={() => fileInputRef.current?.click()}
                className={cn(
                  'border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors',
                  file 
                    ? 'border-primary bg-primary/5' 
                    : 'border-border hover:border-primary/50 hover:bg-accent/50'
                )}
              >
                {file ? (
                  <div className="flex items-center justify-center gap-2">
                    <FileText className="h-6 w-6 text-primary" />
                    <span className="font-medium">{file.name}</span>
                    <span className="text-sm text-muted-foreground">
                      ({(file.size / 1024 / 1024).toFixed(2)} MB)
                    </span>
                  </div>
                ) : (
                  <>
                    <Upload className="h-10 w-10 mx-auto mb-4 text-muted-foreground" />
                    <p className="text-sm text-muted-foreground mb-2">
                      点击或拖拽文件到此处
                    </p>
                    <p className="text-xs text-muted-foreground">
                      支持 PDF、DOCX、PPTX、Markdown、HTML、AsciiDoc、WebVTT、XLSX、CSV、PNG、JPEG、TIFF、BMP、WEBP、MP3、WAV
                    </p>
                  </>
                )}
                <input
                  ref={fileInputRef}
                  type="file"
                  className="hidden"
                  onChange={(e) => e.target.files?.[0] && handleFileSelect(e.target.files[0])}
                />
              </div>
              <p className="text-xs text-muted-foreground mt-2">
                文件大小限制：10MB
              </p>
            </div>

            {/* 切片模式 */}
            <div className="space-y-3">
              <Label>切片模式 *</Label>
              <div className="grid grid-cols-3 gap-3">
                {splitModeOptions.map(({ value, label, desc }) => (
                  <button
                    key={value}
                    onClick={() => {
                      setSplitMode(value);
                      setPreviewData(null);
                    }}
                    className={cn(
                      'flex flex-col gap-1 p-4 rounded-lg border-2 transition-all text-left',
                      splitMode === value
                        ? 'border-primary bg-primary/5'
                        : 'border-border hover:border-accent hover:bg-accent/50'
                    )}
                  >
                    <span className="font-medium text-sm">{label}</span>
                    <span className="text-xs text-muted-foreground">{desc}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* 通用参数：分割长度 */}
            <div className="space-y-3 p-4 bg-muted/50 rounded-lg">
              <div className="flex justify-between">
                <Label className="text-sm">最大切分长度</Label>
                <span className="text-sm font-medium">{splitLength}</span>
              </div>
              <Slider
                value={[splitLength]}
                onValueChange={(values) => {
                  setSplitLength(values[0]);
                  setPreviewData(null);
                }}
                min={100}
                max={6000}
                step={100}
              />
              <p className="text-xs text-muted-foreground">
                每个片段的最大字符数：{splitLength}
              </p>
            </div>

            {/* HEADER 模式参数 */}
            {splitMode === 'HEADER' && (
              <div className="space-y-3 p-4 bg-blue-50 dark:bg-blue-950 rounded-lg border border-blue-200 dark:border-blue-800">
                <div className="flex items-center gap-2 text-sm font-medium text-blue-900 dark:text-blue-100">
                  标题层级
                </div>
                <div className="flex items-center gap-4">
                  <span className="text-sm">Header Level:</span>
                  <div className="flex gap-2">
                    {[1, 2, 3, 4, 5].map((level) => (
                      <button
                        key={level}
                        onClick={() => {
                          setHeaderLevel(level);
                          setPreviewData(null);
                        }}
                        className={cn(
                          'w-8 h-8 rounded-md text-sm font-medium transition-colors',
                          headerLevel === level
                            ? 'bg-primary text-primary-foreground'
                            : 'bg-background border hover:bg-accent'
                        )}
                      >
                        {level}
                      </button>
                    ))}
                  </div>
                </div>
                <p className="text-xs text-blue-700 dark:text-blue-300">
                  按 H1-H{headerLevel} 标题层级分割文档
                </p>
              </div>
            )}

            {/* LENGTH 模式参数 */}
            {splitMode === 'LENGTH' && (
              <div className="space-y-3 p-4 bg-green-50 dark:bg-green-950 rounded-lg border border-green-200 dark:border-green-800">
                <div className="flex justify-between">
                  <Label className="text-sm text-green-900 dark:text-green-100">重叠长度</Label>
                  <span className="text-sm font-medium">{overlapLength}</span>
                </div>
                <Slider
                  value={[overlapLength]}
                  onValueChange={(values) => {
                    setOverlapLength(values[0]);
                    setPreviewData(null);
                  }}
                  min={0}
                  max={1024}
                  step={16}
                />
                <p className="text-xs text-green-700 dark:text-green-300">
                  相邻片段之间的重叠字符数：{overlapLength}
                </p>
              </div>
            )}

            {/* REGEX 模式参数 */}
            {splitMode === 'REGEX' && (
              <div className="space-y-4 p-4 bg-amber-50 dark:bg-amber-950 rounded-lg border border-amber-200 dark:border-amber-800">
                <div className="space-y-2">
                  <Label className="text-sm text-amber-900 dark:text-amber-100">正则表达式 *</Label>
                  <Input
                    placeholder="输入正则表达式，如：\\n{2,}"
                    value={regex}
                    onChange={(e) => {
                      setRegex(e.target.value);
                      setPreviewData(null);
                    }}
                  />
                  <p className="text-xs text-amber-700 dark:text-amber-300">
                    用于匹配分割位置的正则表达式
                  </p>
                </div>
                <div className="space-y-2">
                  <Label className="text-sm text-amber-900 dark:text-amber-100">切片标识符</Label>
                  <Input
                    placeholder="默认为 \\n"
                    value={joinDelimiter}
                    onChange={(e) => {
                      setJoinDelimiter(e.target.value);
                      setPreviewData(null);
                    }}
                  />
                  <p className="text-xs text-amber-700 dark:text-amber-300">
                    片段之间的连接符
                  </p>
                </div>
              </div>
            )}

            {/* 标签 */}
            <div className="space-y-3">
              <Label>标签</Label>
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
                        {availableTags
                          .filter(tag => !tags.find(t => t.name === tag.name))
                          .filter(tag => !tagInput || tag.name.toLowerCase().includes(tagInput.toLowerCase()))
                          .map(tag => (
                            <button
                              key={tag.id}
                              onClick={() => addTag(tag)}
                              className="px-2 py-1 text-xs bg-secondary rounded hover:bg-secondary/80"
                            >
                              {tag.name}
                            </button>
                          ))}
                      </div>
                      {tagInput && !availableTags.find(t => t.name === tagInput) && (
                        <>
                          <div className="border-t my-2" />
                          <button
                            onClick={() => addTag({ name: tagInput })}
                            className="flex items-center gap-2 text-sm text-primary hover:underline"
                          >
                            创建标签 "{tagInput}"
                          </button>
                        </>
                      )}
                    </div>
                  </div>
                )}
              </div>
              
              {/* 已选标签 */}
              {tags.length > 0 && (
                <div className="flex flex-wrap gap-2">
                  {tags.map((tag, index) => (
                    <Badge key={index} variant="secondary" className="gap-1">
                      {tag.name}
                      <button
                        onClick={() => removeTag(tag.name)}
                        className="hover:text-destructive"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </Badge>
                  ))}
                </div>
              )}
            </div>

            {/* 按钮 */}
            <div className="flex gap-3 pt-4">
              <Button
                variant="outline"
                onClick={handlePreview}
                disabled={!uploadId || isUploadingToS3 || isPreviewLoading}
                className="flex-1"
              >
                {isPreviewLoading ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    生成预览...
                  </>
                ) : (
                  '预览'
                )}
              </Button>
              <Button
                onClick={handleConfirm}
                disabled={!canConfirm || isConfirming}
                className="flex-1"
              >
                {isConfirming ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    处理中...
                  </>
                ) : (
                  '确认'
                )}
              </Button>
            </div>
            {isUploadingToS3 && uploadProgress > 0 && (
              <div className="space-y-2 mt-3">
                <div className="flex justify-between text-xs text-muted-foreground">
                  <span>上传中...</span>
                  <span>{uploadProgress}%</span>
                </div>
                <div className="w-full bg-muted rounded-full h-2">
                  <div
                    className="bg-primary h-2 rounded-full transition-all duration-300"
                    style={{ width: `${uploadProgress}%` }}
                  />
                </div>
              </div>
            )}
          </div>
        </div>

        {/* 右侧：预览区 */}
        <div className="w-1/2 p-6 overflow-y-auto bg-muted/30">
          {isPreviewLoading ? (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="font-semibold">切片预览</h3>
                <Skeleton className="h-5 w-32" />
              </div>
              <div className="space-y-3">
                {Array.from({ length: 10 }).map((_, i) => (
                  <div key={i} className="bg-background rounded-lg p-4 border space-y-2">
                    <div className="flex items-center gap-2">
                      <Skeleton className="h-5 w-24" />
                      <Skeleton className="h-4 w-20" />
                    </div>
                    <Skeleton className="h-4 w-full" />
                  </div>
                ))}
              </div>
            </div>
          ) : !previewData ? (
            <div className="h-full flex flex-col items-center justify-center text-muted-foreground">
              <FileText className="h-16 w-16 mb-4 opacity-20" />
              <p className="text-sm">点击「预览」查看文档切分效果</p>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="font-semibold">切片预览</h3>
                <span className="text-sm text-muted-foreground">
                  预估 {previewData.estimateCount} 个片段
                </span>
              </div>
              
              <div className="space-y-3">
                {previewData.chunks.map((chunk) => (
                  <div
                    key={chunk.chunkId}
                    className="bg-background rounded-lg p-4 border"
                  >
                    <div className="flex items-center gap-2 mb-2">
                      <span className="text-sm font-medium text-primary">
                        片段 {String(chunk.chunkIndex + 1).padStart(2, '0')}
                      </span>
                      <span className="text-xs text-muted-foreground">
                        {chunk.content.length} 字符
                      </span>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      {chunk.content}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
