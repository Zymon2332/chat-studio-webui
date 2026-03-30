import type { RouteObject } from "react-router-dom";
import { ProtectedMainLayout } from "@/components/layout/ProtectedMainLayout";
import { Chat } from "@/pages/Chat";
import { Conversation } from "@/pages/Conversation";
import { KnowledgeBase } from "@/pages/knowledge";
import { settingsRoutes } from "./settings";

export const chatRoutes: RouteObject[] = [
  {
    path: "/",
    element: (
      <ProtectedMainLayout>
        <Chat />
      </ProtectedMainLayout>
    ),
  },
  {
    path: "/chat/:id?",
    element: (
      <ProtectedMainLayout>
        <Chat />
      </ProtectedMainLayout>
    ),
  },
];

export const conversationRoutes: RouteObject[] = [
  {
    path: "/conversation/:id",
    element: (
      <ProtectedMainLayout>
        <Conversation />
      </ProtectedMainLayout>
    ),
  },
];

export const knowledgeRoutes: RouteObject[] = [
  {
    path: "/knowledge",
    element: (
      <ProtectedMainLayout>
        <KnowledgeBase />
      </ProtectedMainLayout>
    ),
  },
];

export const toolRoutes: RouteObject[] = [
  {
    path: "/tools",
    element: (
      <ProtectedMainLayout>
        <div className="p-8">
          <h1 className="text-2xl font-bold">工具与技能</h1>
          <p className="text-muted-foreground mt-2">工具功能开发中...</p>
        </div>
      </ProtectedMainLayout>
    ),
  },
];

export const workflowRoutes: RouteObject[] = [
  {
    path: "/workflows",
    element: (
      <ProtectedMainLayout>
        <div className="p-8">
          <h1 className="text-2xl font-bold">工作流</h1>
          <p className="text-muted-foreground mt-2">工作流功能开发中...</p>
        </div>
      </ProtectedMainLayout>
    ),
  },
];

export const mainRoutes: RouteObject[] = [
  ...chatRoutes,
  ...conversationRoutes,
  ...knowledgeRoutes,
  ...toolRoutes,
  ...workflowRoutes,
  ...settingsRoutes,
];
