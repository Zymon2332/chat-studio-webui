import { useState, useEffect, useMemo } from 'react';
import type { KnowledgeBase as KnowledgeBaseType, Document } from './types';
import { KnowledgeSidebar } from './components/KnowledgeSidebar';
import { CreateKnowledgeBaseWizard } from './components/CreateKnowledgeBaseWizard';
import { KnowledgeBaseDocumentList } from './components/KnowledgeBaseDocumentList';
import { KnowledgeBaseDetail } from './components/KnowledgeBaseDetail';
import { SearchTestPanel } from './components/SearchTestPanel';
import { UploadDocument } from './components/UploadDocument';
import { DocumentDetailView } from './components/DocumentDetailView';
import { Loader2 } from 'lucide-react';
import { fetchKnowledgeBases, deleteKnowledgeBase, deleteDocument } from '@/lib/knowledge';
import { toast } from 'sonner';

type ViewMode = 'list' | 'create' | 'detail' | 'empty' | 'search' | 'upload' | 'document-detail';

export function KnowledgeBase() {
  const [knowledgeBases, setKnowledgeBases] = useState<KnowledgeBaseType[]>([]);
  const [currentKbId, setCurrentKbId] = useState<number | null>(null);
  const [viewMode, setViewMode] = useState<ViewMode>('empty');
  const [isLoading, setIsLoading] = useState(true);
  const [selectedDocument, setSelectedDocument] = useState<Document | null>(null);

  // 加载知识库列表
  useEffect(() => {
    const loadKnowledgeBases = async () => {
      try {
        setIsLoading(true);
        const data = await fetchKnowledgeBases();
        setKnowledgeBases(data);
        // 默认选中第一个知识库
        if (data.length > 0 && currentKbId === null) {
          setCurrentKbId(data[0].id);
          setViewMode('list');
        }
      } catch (error) {
        toast.error('加载知识库列表失败');
        console.error('Failed to load knowledge bases:', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadKnowledgeBases();
  }, []);

  // 刷新知识库列表
  const refreshKnowledgeBases = async () => {
    try {
      const data = await fetchKnowledgeBases();
      setKnowledgeBases(data);
    } catch (error) {
      toast.error('刷新知识库列表失败');
      console.error('Failed to refresh knowledge bases:', error);
    }
  };

  const currentKb = useMemo(() => {
    if (currentKbId === null) return null;
    return knowledgeBases.find((kb) => kb.id === currentKbId) || null;
  }, [knowledgeBases, currentKbId]);

  // 处理选择知识库
  const handleSelectKb = (id: number) => {
    setCurrentKbId(id);
    setViewMode('list');
  };

  // 处理点击设置按钮
  const handleSettingsClick = () => {
    setViewMode('detail');
  };

  // 处理点击检索测试按钮
  const handleSearchTestClick = () => {
    setViewMode('search');
  };

  // 处理从检索测试返回
  const handleBackFromSearch = () => {
    setViewMode('list');
  };

  // 处理点击上传按钮
  const handleUploadClick = () => {
    setViewMode('upload');
  };

  // 处理从上传返回
  const handleBackFromUpload = () => {
    setViewMode('list');
  };

  // 刷新触发器，用于刷新文档列表
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  // 触发刷新
  const triggerRefresh = () => {
    setRefreshTrigger(prev => prev + 1);
  };

  // 处理上传成功
  const handleUploadSuccess = () => {
    setViewMode('list');
    triggerRefresh();
  };

  // 处理返回（从详情返回列表）
  const handleBackFromDetail = () => {
    setViewMode('list');
  };

  // 处理点击新建按钮
  const handleCreateClick = () => {
    setViewMode('create');
  };

  // 处理取消创建
  const handleCreateCancel = () => {
    if (currentKbId) {
      setViewMode('list');
    } else {
      setViewMode('empty');
    }
  };

  // 处理创建成功
  const handleCreateSuccess = (newKbId: number) => {
    refreshKnowledgeBases().then(() => {
      setCurrentKbId(newKbId);
      setViewMode('list');
    });
  };

  const handleDeleteKb = async (id: number) => {
    try {
      await deleteKnowledgeBase(id);
      toast.success('知识库删除成功');
      // 从列表中移除已删除的知识库
      setKnowledgeBases(prev => prev.filter(kb => kb.id !== id));
      // 如果删除的是当前选中的知识库，切换到第一个或空状态
      if (currentKbId === id) {
        const remainingKbs = knowledgeBases.filter(kb => kb.id !== id);
        if (remainingKbs.length > 0) {
          setCurrentKbId(remainingKbs[0].id);
          setViewMode('list');
        } else {
          setCurrentKbId(null);
          setViewMode('empty');
        }
      }
    } catch (error) {
      toast.error('删除知识库失败');
      console.error('Failed to delete knowledge base:', error);
    }
  };

  const handleDeleteDocs = async (ids: string[]) => {
    try {
      for (const docId of ids) {
        await deleteDocument(docId);
      }
      toast.success(`成功删除 ${ids.length} 个文档`);
      triggerRefresh();
    } catch (error) {
      toast.error('删除文档失败');
      console.error('Failed to delete documents:', error);
    }
  };

  // 处理预览文档（跳转到文档详情）
  const handlePreviewDocument = (document: Document) => {
    setSelectedDocument(document);
    setViewMode('document-detail');
  };

  // 处理从文档详情返回
  const handleBackFromDocumentDetail = () => {
    setViewMode('list');
    setSelectedDocument(null);
  };

  // 渲染右侧内容
  const renderContent = () => {
    switch (viewMode) {
      case 'create':
        return (
          <CreateKnowledgeBaseWizard
            onCancel={handleCreateCancel}
            onSuccess={handleCreateSuccess}
          />
        );
      case 'detail':
        if (currentKb) {
          return (
            <KnowledgeBaseDetail
              knowledgeBase={currentKb}
              onBack={handleBackFromDetail}
            />
          );
        }
        return renderEmptyState();
      case 'list':
        if (currentKb) {
          return (
            <KnowledgeBaseDocumentList
              knowledgeBase={currentKb}
              onDeleteDocs={handleDeleteDocs}
              onUploadClick={handleUploadClick}
              onPreview={handlePreviewDocument}
              refreshTrigger={refreshTrigger}
            />
          );
        }
        return renderEmptyState();
      case 'document-detail':
        if (selectedDocument) {
          return (
            <DocumentDetailView
              document={selectedDocument}
              onBack={handleBackFromDocumentDetail}
            />
          );
        }
        return renderEmptyState();
      case 'search':
        if (currentKb) {
          return (
            <SearchTestPanel
              onClose={handleBackFromSearch}
              knowledgeBaseName={currentKb.name}
              kbId={currentKb.id}
            />
          );
        }
        return renderEmptyState();
      case 'upload':
        if (currentKb) {
          return (
            <UploadDocument
              kbId={currentKb.id}
              knowledgeBaseName={currentKb.name}
              onClose={handleBackFromUpload}
              onSuccess={handleUploadSuccess}
            />
          );
        }
        return renderEmptyState();
      case 'empty':
      default:
        return renderEmptyState();
    }
  };

  // 渲染空状态
  const renderEmptyState = () => (
    <div className="h-full flex flex-col items-center justify-center text-center px-6">
      <div className="w-20 h-20 rounded-full bg-primary/10 flex items-center justify-center mb-6">
        <Loader2 className="h-10 w-10 text-primary" />
      </div>
      <h3 className="text-xl font-semibold mb-2">欢迎使用知识库</h3>
      <p className="text-muted-foreground mb-6 max-w-sm">
        请从左侧选择知识库，或创建新的知识库来管理您的文档
      </p>
    </div>
  );

  if (isLoading) {
    return (
      <div className="h-full flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="h-full flex">
      {/* 知识库 Sidebar */}
      <KnowledgeSidebar
        knowledgeBases={knowledgeBases}
        currentKbId={currentKbId}
        onSelectKb={handleSelectKb}
        onCreateClick={handleCreateClick}
        onSettingsClick={handleSettingsClick}
        onDeleteKb={handleDeleteKb}
        onSearchTestClick={handleSearchTestClick}
        onUploadClick={handleUploadClick}
      />

      {/* 右侧主内容区 */}
      <div className="flex-1 min-w-0">
        {renderContent()}
      </div>
    </div>
  );
}
