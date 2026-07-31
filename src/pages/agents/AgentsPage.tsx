"use client";

import { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { fetchAgentPage, fetchTeamPage, deleteAgent, type AgentItem, type TeamItem } from "@/lib/agents";
import { AgentTabContent } from "./components/AgentTabContent";
import { TeamTabContent } from "./components/TeamTabContent";
import { AgentDetailDialog } from "./components/AgentDetailDialog";

const PAGE_SIZE = 12;

export function AgentsPage() {
  const navigate = useNavigate();
  const [tab, setTab] = useState("agents");
  const [detailAgentId, setDetailAgentId] = useState<number | null>(null);
  const [deleteTargetId, setDeleteTargetId] = useState<number | null>(null);

  // Agents state
  const [agents, setAgents] = useState<AgentItem[]>([]);
  const [agentPageNum, setAgentPageNum] = useState(1);
  const [agentTotal, setAgentTotal] = useState(0);
  const [agentLoading, setAgentLoading] = useState(false);
  const [agentInitialLoaded, setAgentInitialLoaded] = useState(false);

  // Teams state
  const [teams, setTeams] = useState<TeamItem[]>([]);
  const [teamPageNum, setTeamPageNum] = useState(1);
  const [teamTotal, setTeamTotal] = useState(0);
  const [teamLoading, setTeamLoading] = useState(false);
  const [teamInitialLoaded, setTeamInitialLoaded] = useState(false);

  const loadAgents = useCallback(async (page: number, append = false) => {
    setAgentLoading(true);
    try {
      const result = await fetchAgentPage({ pageNum: page, pageSize: PAGE_SIZE });
      if (append) {
        setAgents((prev) => [...prev, ...(result.records || [])]);
      } else {
        setAgents(result.records || []);
      }
      setAgentTotal(result.total || 0);
      setAgentPageNum(page);
    } catch {
      if (!append) setAgents([]);
      setAgentTotal(0);
    } finally {
      setAgentLoading(false);
      setAgentInitialLoaded(true);
    }
  }, []);

  const loadTeams = useCallback(async (page: number, append = false) => {
    setTeamLoading(true);
    try {
      const result = await fetchTeamPage({ pageNum: page, pageSize: PAGE_SIZE });
      if (append) {
        setTeams((prev) => [...prev, ...(result.records || [])]);
      } else {
        setTeams(result.records || []);
      }
      setTeamTotal(result.total || 0);
      setTeamPageNum(page);
    } catch {
      if (!append) setTeams([]);
      setTeamTotal(0);
    } finally {
      setTeamLoading(false);
      setTeamInitialLoaded(true);
    }
  }, []);

  useEffect(() => {
    loadAgents(1);
  }, [loadAgents]);

  useEffect(() => {
    if (tab === "teams" && !teamInitialLoaded) loadTeams(1);
  }, [tab, teamInitialLoaded, loadTeams]);

  const agentHasMore = agents.length < agentTotal;
  const teamHasMore = teams.length < teamTotal;

  const handleDelete = useCallback(async () => {
    if (!deleteTargetId) return;
    try {
      await deleteAgent(deleteTargetId);
      setAgents((prev) => prev.filter((a) => a.id !== deleteTargetId));
      setAgentTotal((prev) => prev - 1);
      toast.success("智能体已删除");
    } catch {
      toast.error("删除失败");
    } finally {
      setDeleteTargetId(null);
    }
  }, [deleteTargetId]);

  return (
    <div className="flex-1 h-full overflow-y-auto">
      <div className="sticky top-0 z-10 bg-background/95 backdrop-blur-sm px-6 pt-8 pb-0">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-6">
            <button
              onClick={() => setTab("agents")}
              className={cn(
                "text-xl transition-colors",
                tab === "agents"
                  ? "text-foreground font-medium"
                  : "text-muted-foreground hover:text-foreground",
              )}
            >
              我的智能体
            </button>
            <button
              onClick={() => setTab("teams")}
              className={cn(
                "text-xl transition-colors",
                tab === "teams"
                  ? "text-foreground font-medium"
                  : "text-muted-foreground hover:text-foreground",
              )}
            >
              我的团队
            </button>
          </div>
          <div className="flex items-center gap-3">
            {tab === "agents" && agentInitialLoaded && agentTotal > 0 && (
              <span className="text-xs text-muted-foreground/50">
                共 {agentTotal} 个智能体
              </span>
            )}
            {tab === "teams" && teamInitialLoaded && teamTotal > 0 && (
              <span className="text-xs text-muted-foreground/50">
                共 {teamTotal} 个团队
              </span>
            )}
            <Button
              size="sm"
              className="gap-1.5"
              onClick={() => {
                if (tab === "teams") {
                  navigate("/teams/new");
                } else {
                  navigate("/agents/new");
                }
              }}
            >
              <Plus className="w-4 h-4" />
              {tab === "agents" ? "新建智能体" : "新建团队"}
            </Button>
          </div>
        </div>
      </div>

      <div className="px-6 py-6">
        {tab === "agents" ? (
          <AgentTabContent
            agents={agents}
            loading={agentLoading}
            hasMore={agentHasMore}
            onLoadMore={() => loadAgents(agentPageNum + 1, true)}
            onCardClick={(agent) => setDetailAgentId(agent.id)}
            onCardConfigure={(agent) => navigate(`/agents/${agent.id}/edit`)}
            onCardDelete={(agent) => setDeleteTargetId(agent.id)}
          />
        ) : (
          <TeamTabContent
            teams={teams}
            loading={teamLoading}
            hasMore={teamHasMore}
            onLoadMore={() => loadTeams(teamPageNum + 1, true)}
          />
        )}
      </div>

      <AlertDialog open={!!deleteTargetId} onOpenChange={(v) => { if (!v) setDeleteTargetId(null); }}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>确认删除</AlertDialogTitle>
            <AlertDialogDescription>
              确定要删除此智能体吗？此操作不可恢复。
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setDeleteTargetId(null)}>取消</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} className="bg-destructive hover:bg-destructive/90">
              删除
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <AgentDetailDialog
        open={!!detailAgentId}
        onOpenChange={(v) => { if (!v) setDetailAgentId(null); }}
        agentId={detailAgentId!}
      />
    </div>
  );
}
