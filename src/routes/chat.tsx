import { type RouteObject, Navigate } from "react-router-dom";
import { ProtectedMainLayout } from "@/components/layout/ProtectedMainLayout";
import { ChatPage } from "@/pages/chat/ChatPage";
import { ConversationPage } from "@/pages/chat/ConversationPage";
import { SkillsPage } from "@/pages/skills/SkillsPage";
import { AgentsPage } from "@/pages/agents/AgentsPage";
import { AgentFormPage } from "@/pages/agents/AgentFormPage";
import { TeamFormPage } from "@/pages/teams/TeamFormPage";
import { KnowledgeBase } from "@/pages/knowledge";

export const mainLayoutRoutes: RouteObject[] = [
  {
    element: <ProtectedMainLayout />,
    children: [
      { index: true, element: <ChatPage /> },
      { path: "chat/:id?", element: <ChatPage /> },
      { path: "conversation/new", element: <Navigate to="/" replace /> },
      { path: "conversation/:id", element: <ConversationPage /> },
      { path: "knowledge", element: <KnowledgeBase /> },
      { path: "skills", element: <SkillsPage /> },
      { path: "agents", element: <AgentsPage /> },
      { path: "agents/new", element: <AgentFormPage /> },
      { path: "agents/:id/edit", element: <AgentFormPage /> },
      { path: "teams/new", element: <TeamFormPage /> },
      { path: "teams/:id/edit", element: <TeamFormPage /> },
    ],
  },
];
