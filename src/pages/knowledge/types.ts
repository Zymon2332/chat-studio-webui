export interface Document {
  id: string;
  name: string;
  type: 'file' | 'link';
  status: 'pending' | 'processing' | 'indexed' | 'failed';
  size?: string;
  url?: string;
  chunks: number;
  updatedAt: string;
  citations: number;
  fileType?: string;
}

export interface KnowledgeBase {
  id: string;
  name: string;
  description: string;
  documents: Document[];
  createdAt: string;
  updatedAt: string;
  totalDocuments: number;
  totalLinks: number;
}

export const mockKnowledgeBases: KnowledgeBase[] = [
  {
    id: 'kb-1',
    name: '产品文档',
    description: '产品PRD、需求文档等',
    createdAt: '2024-01-15',
    updatedAt: '2小时前',
    totalDocuments: 8,
    totalLinks: 3,
    documents: [
      {
        id: 'doc-1',
        name: '2024产品规划.pdf',
        type: 'file',
        status: 'indexed',
        size: '2.3MB',
        chunks: 12,
        updatedAt: '2小时前',
        citations: 5,
        fileType: 'pdf'
      },
      {
        id: 'doc-2',
        name: 'API设计规范.docx',
        type: 'file',
        status: 'processing',
        size: '1.5MB',
        chunks: 8,
        updatedAt: '今天',
        citations: 0,
        fileType: 'docx'
      },
      {
        id: 'doc-3',
        name: '用户调研报告.pdf',
        type: 'file',
        status: 'indexed',
        size: '4.2MB',
        chunks: 24,
        updatedAt: '昨天',
        citations: 12,
        fileType: 'pdf'
      },
      {
        id: 'link-1',
        name: 'Confluence: 架构设计',
        type: 'link',
        status: 'indexed',
        url: 'https://confluence.example.com/architecture',
        chunks: 15,
        updatedAt: '昨天',
        citations: 3
      },
      {
        id: 'link-2',
        name: 'Notion: 产品路线图',
        type: 'link',
        status: 'failed',
        url: 'https://notion.example.com/roadmap',
        chunks: 0,
        updatedAt: '3天前',
        citations: 0
      },
      {
        id: 'doc-4',
        name: '竞品分析报告.xlsx',
        type: 'file',
        status: 'indexed',
        size: '890KB',
        chunks: 6,
        updatedAt: '1周前',
        citations: 8,
        fileType: 'xlsx'
      },
      {
        id: 'doc-5',
        name: 'UI设计规范.sketch',
        type: 'file',
        status: 'indexed',
        size: '12.5MB',
        chunks: 32,
        updatedAt: '2周前',
        citations: 15,
        fileType: 'sketch'
      },
      {
        id: 'link-3',
        name: 'Figma: 原型设计',
        type: 'link',
        status: 'pending',
        url: 'https://figma.example.com/prototype',
        chunks: 0,
        updatedAt: '刚刚',
        citations: 0
      }
    ]
  },
  {
    id: 'kb-2',
    name: '技术规范',
    description: '技术文档、代码规范等',
    createdAt: '2024-01-10',
    updatedAt: '5小时前',
    totalDocuments: 15,
    totalLinks: 5,
    documents: [
      {
        id: 'doc-6',
        name: '代码规范.md',
        type: 'file',
        status: 'indexed',
        size: '45KB',
        chunks: 3,
        updatedAt: '5小时前',
        citations: 28,
        fileType: 'md'
      },
      {
        id: 'doc-7',
        name: '数据库设计.pdf',
        type: 'file',
        status: 'indexed',
        size: '1.8MB',
        chunks: 18,
        updatedAt: '昨天',
        citations: 16,
        fileType: 'pdf'
      }
    ]
  },
  {
    id: 'kb-3',
    name: '竞品分析',
    description: '竞争对手产品分析',
    createdAt: '2024-02-01',
    updatedAt: '3天前',
    totalDocuments: 6,
    totalLinks: 8,
    documents: [
      {
        id: 'doc-8',
        name: 'ChatGPT分析报告.pdf',
        type: 'file',
        status: 'indexed',
        size: '3.2MB',
        chunks: 20,
        updatedAt: '3天前',
        citations: 4,
        fileType: 'pdf'
      }
    ]
  },
  {
    id: 'kb-4',
    name: '会议纪要',
    description: '团队会议纪要',
    createdAt: '2024-02-15',
    updatedAt: '1周前',
    totalDocuments: 12,
    totalLinks: 2,
    documents: []
  }
];

export type ViewMode = 'all' | 'files' | 'links';
export type SortBy = 'updated' | 'name' | 'citations';
