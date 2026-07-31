"use client";

import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { toast } from "sonner";
import { X, Plus, Eye, Brain, Wrench, Users, Loader2, Crown, ClipboardList, Share2, Crosshair, Workflow } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Checkbox } from "@/components/ui/checkbox";
import { AgentAvatar } from "@/pages/agents/components/AgentAvatar";
import { AgentDetailDialog } from "@/pages/agents/components/AgentDetailDialog";
import { Canvas } from "@/components/ai-elements/canvas";
import { Controls } from "@/components/ai-elements/controls";
import {
  fetchAgentPage, createTeam, updateTeam, fetchTeamDetails,
  type AgentItem, type TeamStrategy,
} from "@/lib/agents";

const strategyOptions: {
  value: TeamStrategy;
  icon: React.ElementType;
  iconBg: string;
  title: string;
  color: string;
  description: string;
  scenario: string;
}[] = [
  {
    value: "SUPERVISOR",
    icon: Crown,
    iconBg: "bg-blue-100 text-blue-700 dark:bg-blue-500/20 dark:text-blue-400",
    title: "主管模式",
    color: "border-blue-500/30 hover:border-blue-500/60 data-[state=selected]:border-blue-500 data-[state=selected]:bg-blue-500/5",
    description: "由一个「主管」智能体负责调度和协调其他智能体工作。主管根据任务类型分配子任务、收集结果、决策下一步行动，形成集中式管理。",
    scenario: "适用于有明确层级的团队协作，如项目管理、客服中心、内容审核流程。",
  },
  {
    value: "BLACKBOARD",
    icon: ClipboardList,
    iconBg: "bg-amber-100 text-amber-700 dark:bg-amber-500/20 dark:text-amber-400",
    title: "黑板模式",
    color: "border-amber-500/30 hover:border-amber-500/60 data-[state=selected]:border-amber-500 data-[state=selected]:bg-amber-500/5",
    description: "所有智能体共享一块「黑板」（公共内存），通过读写黑板上的信息来协作。每个智能体独立感知、处理并写入结果，无需中心调度。",
    scenario: "适用于复杂问题分解、多方协作分析、数据融合等场景。",
  },
  {
    value: "P2P",
    icon: Share2,
    iconBg: "bg-green-100 text-green-700 dark:bg-green-500/20 dark:text-green-400",
    title: "点对点模式",
    color: "border-green-500/30 hover:border-green-500/60 data-[state=selected]:border-green-500 data-[state=selected]:bg-green-500/5",
    description: "智能体之间直接通信，没有中心节点。每个智能体可以自由地向其他成员发送消息、发起协作，形成去中心化的协作网络。",
    scenario: "适用于对等协作、分布式问题求解、动态团队组合。",
  },
  {
    value: "GOAL",
    icon: Crosshair,
    iconBg: "bg-purple-100 text-purple-700 dark:bg-purple-500/20 dark:text-purple-400",
    title: "目标驱动模式",
    color: "border-purple-500/30 hover:border-purple-500/60 data-[state=selected]:border-purple-500 data-[state=selected]:bg-purple-500/5",
    description: "基于共同目标自主协作。系统将总目标分解为子目标，智能体根据自身能力认领任务，自动协调依赖关系，最终汇聚完成整体目标。",
    scenario: "适用于开放式任务、科研协作、复杂创意生成。",
  },
  {
    value: "WORKFLOW",
    icon: Workflow,
    iconBg: "bg-rose-100 text-rose-700 dark:bg-rose-500/20 dark:text-rose-400",
    title: "工作流模式",
    color: "border-rose-500/30 hover:border-rose-500/60 data-[state=selected]:border-rose-500 data-[state=selected]:bg-rose-500/5",
    description: "通过可视化 DAG 画布编排智能体工作流。每个节点代表一个智能体，连接线定义数据流向和处理顺序，支持条件分支和并行执行。",
    scenario: "适用于有明确处理流程的场景，如数据流水线、内容生产流程、自动化审批链。",
  },
];

export function TeamFormPage() {
  const navigate = useNavigate();
  const { id } = useParams();
  const isEdit = !!id;

  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [strategy, setStrategy] = useState<TeamStrategy>("SUPERVISOR");
  const [agentIds, setAgentIds] = useState<number[]>([]);
  const [memberList, setMemberList] = useState<AgentItem[]>([]);
  const [errors, setErrors] = useState<Record<string, string>>({});

  // Agent picker dialog
  const [pickerOpen, setPickerOpen] = useState(false);
  const [agents, setAgents] = useState<AgentItem[]>([]);
  const [agentPageNum, setAgentPageNum] = useState(1);
  const [agentTotal, setAgentTotal] = useState(0);
  const [agentLoading, setAgentLoading] = useState(false);

  // Preview
  const [previewAgentId, setPreviewAgentId] = useState<number | null>(null);

  // Edit mode
  useEffect(() => {
    if (!id) return;
    fetchTeamDetails(Number(id))
      .then((data) => {
        setName(data.name);
        setDescription(data.description);
        setStrategy(data.strategy);
        setAgentIds(data.agentIds || []);
      })
      .catch(() => toast.error("加载团队详情失败"));
  }, [id]);

  // Load full member details when agentIds change
  useEffect(() => {
    if (agentIds.length === 0) {
      setMemberList([]);
      return;
    }
    fetchAgentPage({ pageNum: 1, pageSize: Math.max(agentIds.length, 20) })
      .then((result) => {
        const list = (result.records || []).filter((a) => agentIds.includes(a.id));
        setMemberList(list);
      })
      .catch(() => {});
  }, [agentIds]);

  const loadAgents = async (page: number, append = false) => {
    setAgentLoading(true);
    try {
      const result = await fetchAgentPage({ pageNum: page, pageSize: 12 });
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
    }
  };

  const openPicker = () => {
    setPickerOpen(true);
    if (agents.length === 0) loadAgents(1);
  };

  const toggleAgent = (agentId: number) => {
    setAgentIds((prev) =>
      prev.includes(agentId) ? prev.filter((i) => i !== agentId) : [...prev, agentId],
    );
  };

  const handleSubmit = async () => {
    const newErrors: Record<string, string> = {};
    if (!name.trim()) newErrors.name = "请输入团队名称";
    if (agentIds.length === 0) newErrors.members = "请选择至少一个成员";

    setErrors(newErrors);
    if (Object.keys(newErrors).length > 0) return;

    const payload = {
      name: name.trim(),
      description: description.trim(),
      strategy,
      agentIds,
    };

    try {
      if (isEdit) {
        await updateTeam({ id: Number(id), ...payload });
        toast.success("团队已更新");
      } else {
        await createTeam(payload);
        toast.success("团队创建成功");
      }
      navigate("/agents");
    } catch {
      toast.error(isEdit ? "更新失败" : "创建失败");
    }
  };

  const agentHasMore = agents.length < agentTotal;

  return (
    <div className="flex-1 h-full overflow-y-auto">
      <div className="sticky top-0 z-10 bg-background/95 backdrop-blur-sm px-6 pt-8 pb-0">
        <div className="flex items-center gap-3 mb-4">
          <button
            onClick={() => navigate("/agents")}
            className="text-sm text-muted-foreground hover:text-foreground transition-colors"
          >
            ← 返回
          </button>
          <span className="text-sm text-muted-foreground/30">/</span>
          <h1 className="text-sm font-medium text-foreground/90">
            {isEdit ? "编辑团队" : "新建团队"}
          </h1>
        </div>
      </div>

      <div className="px-6 py-6">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <div className="space-y-8">
            {/* Basic info */}
            <section>
              <h2 className="text-xs font-semibold text-muted-foreground/60 tracking-wider uppercase mb-3">
                基本信息
              </h2>
              <div className="space-y-4">
                <div className="space-y-1.5">
                  <label className="text-xs text-muted-foreground/80">
                    团队名称 <span className="text-destructive">*</span>
                  </label>
                  <Input
                    placeholder="输入团队名称"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    onFocus={() => setErrors((prev) => ({ ...prev, name: "" }))}
                    className={cn("h-10", errors.name && "border-destructive")}
                  />
                  {errors.name && <p className="text-xs text-destructive">{errors.name}</p>}
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs text-muted-foreground/80">团队描述</label>
                  <Input
                    placeholder="描述团队的用途和目标"
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                  />
                </div>
              </div>
            </section>

            {/* Collaboration strategy */}
            <section>
              <h2 className="text-xs font-semibold text-muted-foreground/60 tracking-wider uppercase mb-3">
                协作模式
              </h2>
              <div className="grid grid-cols-2 gap-3">
                {strategyOptions.map((opt) => {
                  const isSelected = strategy === opt.value;
                  return (
                    <button
                      key={opt.value}
                      type="button"
                      data-state={isSelected ? "selected" : undefined}
                      onClick={() => setStrategy(opt.value)}
                      className={cn(
                        "flex items-center gap-3 p-3 rounded-xl border-2 text-left transition-all",
                        "relative overflow-hidden",
                        opt.color,
                        isSelected ? "shadow-sm" : "",
                      )}
                    >
                      {/* Left accent bar */}
                      {isSelected && (
                        <div className={cn("absolute left-0 top-0 bottom-0 w-1 rounded-r-full", opt.iconBg.split(" ")[0])} />
                      )}
                      <div className={cn("w-10 h-10 rounded-xl flex items-center justify-center shrink-0", opt.iconBg)}>
                        <opt.icon className="w-5 h-5" />
                      </div>
                      <div>
                        <div className="text-sm font-medium text-sidebar-foreground/90">
                          {opt.title}
                        </div>
                        <div className="text-[11px] text-muted-foreground/50 mt-0.5">
                          {opt.value}
                        </div>
                      </div>
                    </button>
                  );
                })}
              </div>

              {/* Strategy detail */}
              {(() => {
                const opt = strategyOptions.find((o) => o.value === strategy);
                if (!opt) return null;
                return (
                  <div className="mt-4 p-4 rounded-xl border border-sidebar-border/20 bg-sidebar/40">
                    <div className="flex items-center gap-3 mb-2">
                      <div className={cn("w-8 h-8 rounded-lg flex items-center justify-center shrink-0", opt.iconBg)}>
                        <opt.icon className="w-4 h-4" />
                      </div>
                      <div>
                        <div className="text-sm font-medium text-sidebar-foreground/90">
                          {opt.title}
                        </div>
                        <div className="text-[11px] text-muted-foreground/50 mt-0.5">
                          {opt.value}
                        </div>
                      </div>
                    </div>
                    <p className="text-sm text-muted-foreground leading-relaxed">{opt.description}</p>
                    <p className="text-xs text-muted-foreground/60 mt-2">
                      <span className="font-medium">适用场景：</span>
                      {opt.scenario}
                    </p>
                  </div>
                );
              })()}
            </section>

            {/* Members */}
            <section>
              <div className="flex items-center justify-between mb-3">
                <h2 className="text-xs font-semibold text-muted-foreground/60 tracking-wider uppercase">
                  成员 {agentIds.length > 0 && <span className="text-muted-foreground/50 ml-1 font-normal">({agentIds.length})</span>}
                </h2>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  className="h-7 text-xs gap-1"
                  onClick={openPicker}
                >
                  <Plus className="w-3 h-3" />
                  添加成员
                </Button>
              </div>

              {memberList.length > 0 ? (
                <div className="space-y-1.5">
                  {memberList.map((agent) => (
                    <div
                      key={agent.id}
                      className="flex items-center gap-3 px-3 py-2.5 rounded-lg border border-sidebar-border/20 hover:bg-sidebar/40 transition-colors"
                    >
                      <AgentAvatar avatar={agent.avatar} size="sm" />
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-medium truncate">{agent.name}</span>
                          {agent.modelName && (
                            <span className="text-[10px] text-muted-foreground/50 flex items-center gap-0.5 shrink-0">
                              <Brain className="w-2.5 h-2.5" />
                              {agent.modelName}
                            </span>
                          )}
                          <span className="text-[10px] text-muted-foreground/50 flex items-center gap-0.5 shrink-0">
                            <Wrench className="w-2.5 h-2.5" />
                            {agent.skillsCount ?? 0}
                          </span>
                        </div>
                        <p className="text-[11px] text-muted-foreground/60 truncate mt-0.5">
                          {agent.description || "暂无描述"}
                        </p>
                      </div>
                      <button
                        type="button"
                        onClick={() => setPreviewAgentId(agent.id)}
                        className="shrink-0 w-6 h-6 rounded-md flex items-center justify-center text-muted-foreground/50 hover:text-foreground hover:bg-accent/50 transition-colors"
                      >
                        <Eye className="w-3.5 h-3.5" />
                      </button>
                      <button
                        type="button"
                        onClick={() => setAgentIds((prev) => prev.filter((i) => i !== agent.id))}
                        className="shrink-0 w-6 h-6 rounded-md flex items-center justify-center text-muted-foreground/50 hover:text-destructive hover:bg-destructive/10 transition-colors"
                      >
                        <X className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center py-8 text-muted-foreground/50 rounded-xl border border-dashed border-sidebar-border/30">
                  <Users className="w-8 h-8 mb-2 opacity-30" />
                  <p className="text-xs">尚未添加成员</p>
                  <button
                    type="button"
                    onClick={openPicker}
                    className="text-xs text-primary hover:text-primary/80 mt-1 transition-colors"
                  >
                    点击选择智能体
                  </button>
                </div>
              )}
              {errors.members && <p className="text-xs text-destructive mt-1">{errors.members}</p>}
            </section>
          </div>

          {/* Right column — canvas or placeholder */}
          <div className="min-h-0">
            {strategy === "WORKFLOW" ? (
              <div className="h-[calc(100vh-12rem)] rounded-xl border overflow-hidden sticky top-24">
                <Canvas>
                  <Controls />
                </Canvas>
              </div>
            ) : (
              <div className="h-[calc(100vh-12rem)] rounded-xl border border-dashed border-sidebar-border/30 flex items-center justify-center">
                <p className="text-xs text-muted-foreground/50">选择「工作流模式」以启用可视化画布</p>
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end gap-3 pt-6 pb-4 border-t border-sidebar-border/20 mt-8">
          <Button variant="ghost" onClick={() => navigate("/agents")} className="text-muted-foreground">
            取消
          </Button>
          <Button onClick={handleSubmit}>
            {isEdit ? "保存" : "创建团队 →"}
          </Button>
        </div>
      </div>

      {/* Member picker dialog */}
      <Dialog open={pickerOpen} onOpenChange={setPickerOpen}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>选择成员</DialogTitle>
          </DialogHeader>
          <div className="max-h-64 overflow-y-auto space-y-1 rounded-lg border p-1">
            {agentLoading && agents.length === 0 ? (
              <div className="flex items-center justify-center py-6 text-xs text-muted-foreground">
                <Loader2 className="w-3.5 h-3.5 animate-spin mr-2" />
                加载中...
              </div>
            ) : agents.length === 0 ? (
              <p className="text-xs text-muted-foreground/50 text-center py-6">暂无可用智能体</p>
            ) : (
              <>
                {agents.map((agent) => {
                  const checked = agentIds.includes(agent.id);
                  return (
                    <div
                      key={agent.id}
                      className="flex items-center gap-3 px-3 py-2.5 rounded-md hover:bg-accent/30 transition-colors group"
                    >
                      <Checkbox
                        checked={checked}
                        onCheckedChange={() => toggleAgent(agent.id)}
                      />
                      <AgentAvatar avatar={agent.avatar} size="sm" />
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-medium truncate">{agent.name}</span>
                          {agent.modelName && (
                            <span className="text-[10px] text-muted-foreground/50 flex items-center gap-0.5 shrink-0">
                              <Brain className="w-2.5 h-2.5" />
                              {agent.modelName}
                            </span>
                          )}
                          <span className="text-[10px] text-muted-foreground/50 flex items-center gap-0.5 shrink-0">
                            <Wrench className="w-2.5 h-2.5" />
                            {agent.skillsCount ?? 0}
                          </span>
                        </div>
                        <p className="text-[11px] text-muted-foreground/60 truncate mt-0.5">
                          {agent.description || "暂无描述"}
                        </p>
                      </div>
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          setPreviewAgentId(agent.id);
                        }}
                        className="shrink-0 w-6 h-6 rounded-md flex items-center justify-center opacity-0 group-hover:opacity-100 text-muted-foreground/50 hover:text-foreground hover:bg-accent/50 transition-all"
                      >
                        <Eye className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  );
                })}
                {agentHasMore && (
                  <button
                    type="button"
                    onClick={() => loadAgents(agentPageNum + 1, true)}
                    disabled={agentLoading}
                    className="w-full text-xs text-muted-foreground/60 hover:text-muted-foreground py-2 text-center transition-colors disabled:opacity-50"
                  >
                    {agentLoading ? "加载中..." : "加载更多 →"}
                  </button>
                )}
              </>
            )}
          </div>
        </DialogContent>
      </Dialog>

      {/* Agent detail preview */}
      <AgentDetailDialog
        open={!!previewAgentId}
        onOpenChange={(v) => { if (!v) setPreviewAgentId(null) }}
        agentId={previewAgentId!}
      />
    </div>
  );
}
