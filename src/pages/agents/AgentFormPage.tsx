"use client";

import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { toast } from "sonner";
import { Eye, Plus, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { cn } from "@/lib/utils";
import { MarkdownRenderer } from "@/components/ai-elements/MarkdownRenderer";
import { IconPicker } from "./components/IconPicker";
import { ModelPicker } from "./components/ModelPicker";
import { SkillSelector } from "./components/SkillSelector";
import { AdvancedSettings } from "./components/AdvancedSettings";
import { createAgent, updateAgent, fetchAgentDetails, type TemplateVariable } from "@/lib/agents";

export function AgentFormPage() {
  const navigate = useNavigate();
  const { id } = useParams();
  const isEdit = !!id;

  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [systemPrompt, setSystemPrompt] = useState("");
  const [triggerTemplate, setTriggerTemplate] = useState("");
  const [variables, setTemplateVariables] = useState<TemplateVariable[]>([]);
  const [previewOpen, setPreviewOpen] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [variableErrors, setVariableErrors] = useState<Record<string, string>>({});
  const [selectedAvatar, setSelectedAvatar] = useState("avatar01");
  const [model, setModel] = useState("");
  const [rollbackModel, setRollbackModel] = useState("");
  const [skills, setSkills] = useState<string[]>([]);
  const [kbEnabled, setKbEnabled] = useState(false);
  const [maxTokensPerSession, setMaxTokensPerSession] = useState(10000);
  const [rateLimit, setRateLimit] = useState(10);
  const [maxConcurrency, setMaxConcurrency] = useState(5);

  useEffect(() => {
    if (!id) return;
    fetchAgentDetails(Number(id)).then((data) => {
      setName(data.name);
      setDescription(data.description);
      setSystemPrompt(data.systemPrompt);
      setTriggerTemplate(data.triggerTemplate ?? "");
      setTemplateVariables(data.variables ?? []);
      setSelectedAvatar(data.avatar);
      setModel(String(data.modelId));
      setRollbackModel(data.rollbackModelId ? String(data.rollbackModelId) : "");
      setKbEnabled(data.enableKnowledgeBase);
      setSkills(data.skills.map((s) => s.id));
    }).catch(() => toast.error("加载智能体详情失败"));
  }, [id]);

  const handleAddVariable = () => {
    setTemplateVariables([...variables, { key: '', type: 'STRING', description: '', defaultValue: '', isOptional: false }]);
  };

  const handleUpdateVariable = (index: number, field: keyof TemplateVariable, value: string | boolean) => {
    setTemplateVariables(variables.map((v, i) =>
      i === index ? { ...v, [field]: value } : v
    ));
    setVariableErrors((prev) => {
      const next = { ...prev };
      delete next[`key-${index}`];
      delete next[`description-${index}`];
      delete next[`defaultValue-${index}`];
      return next;
    });
  };

  const handleRemoveVariable = (index: number) => {
    setTemplateVariables(variables.filter((_, i) => i !== index));
    setVariableErrors((prev) => {
      const next = { ...prev };
      delete next[`key-${index}`];
      delete next[`description-${index}`];
      delete next[`defaultValue-${index}`];
      return next;
    });
  };

  const handleCreate = async () => {
    const newErrors: Record<string, string> = {};
    if (!name.trim()) newErrors.name = "请输入智能体名称";
    if (!description.trim()) newErrors.description = "请输入智能体描述";
    if (!systemPrompt.trim()) newErrors.systemPrompt = "请输入系统提示词";
    if (!triggerTemplate.trim()) newErrors.triggerTemplate = "请输入触发模板";

    setErrors(newErrors);

    const newVariableErrors: Record<string, string> = {};
    const validVariables = variables.filter((v) => v.key.trim());
    validVariables.forEach((v, i) => {
      if (!v.key.trim()) newVariableErrors[`key-${i}`] = "请输入变量名";
      if (!v.description?.trim()) newVariableErrors[`description-${i}`] = "请输入变量描述";
      if (v.type === 'NUMBER' && v.defaultValue?.trim() && isNaN(Number(v.defaultValue))) {
        newVariableErrors[`defaultValue-${i}`] = "请输入有效数字";
      }
    });
    setVariableErrors(newVariableErrors);

    if (Object.keys(newErrors).length > 0) return;
    if (Object.keys(newVariableErrors).length > 0) return;

    const payload = {
      name: name.trim(),
      avatar: selectedAvatar,
      description: description.trim(),
      systemPrompt: systemPrompt.trim(),
      triggerTemplate: triggerTemplate.trim(),
      variables: variables.filter(v => v.key.trim()),
      modelId: Number(model),
      rollbackModelId: rollbackModel ? Number(rollbackModel) : undefined,
      enableKnowledgeBase: kbEnabled,
      skillIds: skills.map(Number),
    };

    try {
      if (isEdit) {
        await updateAgent({ id: Number(id), ...payload });
        toast.success("智能体已更新");
      } else {
        await createAgent(payload);
        toast.success("智能体创建成功");
      }
      navigate("/agents");
    } catch {
      toast.error(isEdit ? "更新失败" : "创建失败");
    }
  };

  const clearError = (field: string) => {
    if (errors[field]) setErrors((prev) => ({ ...prev, [field]: "" }));
  };

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
          <h1 className="text-sm font-medium text-foreground/90">{isEdit ? "编辑智能体" : "新建智能体"}</h1>
        </div>
      </div>

      <div className="px-6 py-6">
        <div className="grid grid-cols-1 md:grid-cols-5 gap-8">
          {/* Left column — main form */}
          <div className="md:col-span-3 flex flex-col gap-8 min-h-[60vh]">
            <section className="shrink-0">
              <h2 className="text-xs font-semibold text-muted-foreground/60 tracking-wider uppercase mb-3">
                基本信息
              </h2>
              <div className="space-y-4">
                <div className="space-y-1.5">
                  <label className="text-xs text-muted-foreground/80">
                    名称 <span className="text-destructive">*</span>
                  </label>
                  <Input
                    placeholder="智能体名称"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    onFocus={() => clearError("name")}
                    className={cn("h-10 text-base", errors.name && "border-destructive")}
                  />
                  {errors.name && (
                    <p className="text-xs text-destructive">{errors.name}</p>
                  )}
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs text-muted-foreground/80">
                    描述 <span className="text-destructive">*</span>
                  </label>
                  <Input
                    placeholder="一句话描述这个智能体的能力"
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    onFocus={() => clearError("description")}
                    className={cn("h-10 text-sm", errors.description && "border-destructive")}
                  />
                  {errors.description && (
                    <p className="text-xs text-destructive">{errors.description}</p>
                  )}
                </div>
              </div>
            </section>

            <section className="flex-1 flex flex-col min-h-[280px]">
              <div className="flex items-center justify-between mb-3">
                <h2 className="text-xs font-semibold text-muted-foreground/60 tracking-wider uppercase">
                  系统提示词 <span className="text-destructive">*</span>
                </h2>
                <div className="flex items-center gap-3">
                  <span className="text-xs text-muted-foreground/50">{systemPrompt.length} 字符</span>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    className="h-7 text-xs gap-1"
                    onClick={() => setPreviewOpen(true)}
                  >
                    <Eye className="w-3 h-3" />
                    预览
                  </Button>
                </div>
              </div>

              <textarea
                placeholder="定义智能体的角色、行为和回应风格...&#10;&#10;支持 Markdown 语法：&#10;- **粗体** *斜体* &#10;- 列表&#10;- `代码块`"
                value={systemPrompt}
                onChange={(e) => setSystemPrompt(e.target.value)}
                onFocus={() => clearError("systemPrompt")}
                className={cn(
                  "w-full min-h-0 flex-1 rounded-xl border border-sidebar-border/20 bg-background/50 px-4 py-3 text-sm resize-none focus:outline-none focus:border-primary/40 transition-colors placeholder:text-muted-foreground/50 font-mono leading-relaxed overflow-y-auto",
                  errors.systemPrompt && "border-destructive",
                )}
              />
              {errors.systemPrompt && (
                <p className="text-xs text-destructive mt-1">{errors.systemPrompt}</p>
              )}
            </section>

            <section className="shrink-0">
              <div className="flex items-center justify-between mb-3">
                <h2 className="text-xs font-semibold text-muted-foreground/60 tracking-wider uppercase">
                  触发模板 <span className="text-destructive">*</span>
                </h2>
                <span className="text-xs text-muted-foreground/50">{triggerTemplate.length} 字符</span>
              </div>

              <p className="text-xs text-muted-foreground/60 mb-4 leading-relaxed">
                先定义变量，再在模板中使用 {'{{变量名}}'} 引用。用户在对话中匹配到模板内容时触发该智能体。
              </p>

              <h3 className="text-xs font-semibold text-muted-foreground/60 tracking-wider uppercase mb-3">
                模板变量
              </h3>

              {variables.length > 0 && (
                <div className="rounded-xl border border-sidebar-border/20 overflow-hidden mb-4">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b border-sidebar-border/20 bg-sidebar/20">
                        <th className="text-left text-xs text-muted-foreground/60 font-medium px-4 py-2.5 w-[140px]">变量名 <span className="text-destructive">*</span></th>
                        <th className="text-left text-xs text-muted-foreground/60 font-medium px-4 py-2.5 w-[110px]">类型</th>
                        <th className="text-left text-xs text-muted-foreground/60 font-medium px-4 py-2.5 min-w-[140px]">
                          <span className="inline-flex items-center gap-1">
                            描述 <span className="text-destructive">*</span>
                            <TooltipProvider>
                              <Tooltip>
                                <TooltipTrigger asChild>
                                  <span className="cursor-help text-muted-foreground/40 hover:text-muted-foreground/70 transition-colors text-xs">ⓘ</span>
                                </TooltipTrigger>
                                <TooltipContent side="top" className="max-w-[280px] text-xs leading-relaxed">
                                  描述该变量的用途和含义，帮助模型理解每个 {'{{变量}}'} 应填入什么内容，以生成更准确的回复。
                                  <br /><br />
                                  例如：用户姓名、查询关键词、语言偏好等
                                </TooltipContent>
                              </Tooltip>
                            </TooltipProvider>
                          </span>
                        </th>
                        <th className="text-left text-xs text-muted-foreground/60 font-medium px-4 py-2.5 w-[130px]">默认值</th>
                        <th className="text-center text-xs text-muted-foreground/60 font-medium px-4 py-2.5 w-[50px]">可选</th>
                        <th className="w-9 px-4 py-2.5"></th>
                      </tr>
                    </thead>
                    <tbody>
                      {variables.map((v, i) => (
                        <tr key={i} className="border-b border-sidebar-border/10 last:border-b-0">
                          <td className="px-3 py-2">
                            <div>
                              <Input
                                placeholder="变量名"
                                value={v.key}
                                onChange={(e) => handleUpdateVariable(i, 'key', e.target.value)}
                                className={cn("h-8 text-sm", variableErrors[`key-${i}`] && "border-destructive")}
                              />
                              {variableErrors[`key-${i}`] && (
                                <p className="text-xs text-destructive mt-1">{variableErrors[`key-${i}`]}</p>
                              )}
                            </div>
                          </td>
                          <td className="px-3 py-2">
                            <Select
                              value={v.type}
                              onValueChange={(val) => handleUpdateVariable(i, 'type', val)}
                            >
                              <SelectTrigger className="h-8 text-sm">
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="STRING">STRING</SelectItem>
                                <SelectItem value="BOOLEAN">BOOLEAN</SelectItem>
                                <SelectItem value="NUMBER">NUMBER</SelectItem>
                              </SelectContent>
                              </Select>
                            </td>
                            <td className="px-3 py-2 min-w-[140px]">
                              <div>
                                <Input
                                  placeholder="变量说明"
                                  value={v.description || ''}
                                  onChange={(e) => handleUpdateVariable(i, 'description', e.target.value)}
                                  className={cn("h-8 text-sm", variableErrors[`description-${i}`] && "border-destructive")}
                                />
                                {variableErrors[`description-${i}`] && (
                                  <p className="text-xs text-destructive mt-1">{variableErrors[`description-${i}`]}</p>
                                )}
                              </div>
                            </td>
                            <td className="px-3 py-2">
                              {v.type === 'BOOLEAN' ? (
                              <Select
                                value={v.defaultValue || 'false'}
                                onValueChange={(val) => handleUpdateVariable(i, 'defaultValue', val)}
                              >
                                <SelectTrigger className="h-8 text-sm">
                                  <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                  <SelectItem value="true">true</SelectItem>
                                  <SelectItem value="false">false</SelectItem>
                                </SelectContent>
                              </Select>
                            ) : (
                              <div>
                                <Input
                                  placeholder={v.type === 'NUMBER' ? '0' : ''}
                                  value={v.defaultValue || ''}
                                  onChange={(e) => handleUpdateVariable(i, 'defaultValue', e.target.value)}
                                  className={cn("h-8 text-sm", variableErrors[`defaultValue-${i}`] && "border-destructive")}
                                />
                                {variableErrors[`defaultValue-${i}`] && (
                                  <p className="text-xs text-destructive mt-1">{variableErrors[`defaultValue-${i}`]}</p>
                                )}
                              </div>
                            )}
                          </td>
                          <td className="px-3 py-2 text-center">
                            <Checkbox
                              checked={v.isOptional || false}
                              onCheckedChange={(checked) => handleUpdateVariable(i, 'isOptional', !!checked)}
                            />
                          </td>
                          <td className="px-3 py-2 text-center">
                            <button
                              onClick={() => handleRemoveVariable(i)}
                              className="text-muted-foreground hover:text-destructive transition-colors"
                            >
                              <X className="h-4 w-4" />
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}

              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={handleAddVariable}
                className="mb-4 h-8 text-xs gap-1"
              >
                <Plus className="h-3.5 w-3.5" />
                添加变量
              </Button>

              <h3 className="text-xs font-semibold text-muted-foreground/60 tracking-wider uppercase mb-3">
                模板内容
              </h3>
              <textarea
                placeholder="用户在对话中匹配到此模板时触发该智能体"
                value={triggerTemplate}
                onChange={(e) => setTriggerTemplate(e.target.value)}
                onFocus={() => clearError("triggerTemplate")}
                className={cn(
                  "w-full h-[180px] rounded-xl border border-sidebar-border/20 bg-background/50 px-4 py-3 text-sm resize-none focus:outline-none focus:border-primary/40 transition-colors placeholder:text-muted-foreground/50 font-mono leading-relaxed",
                  errors.triggerTemplate && "border-destructive"
                )}
              />
              {errors.triggerTemplate && (
                <p className="text-xs text-destructive mt-1">{errors.triggerTemplate}</p>
              )}
            </section>

            <section className="shrink-0">
              <h2 className="text-xs font-semibold text-muted-foreground/60 tracking-wider uppercase mb-3">
                 模型
              </h2>
              <ModelPicker value={model} onChange={setModel} />
            </section>
          </div>

          {/* Right column — supplementary */}
          <div className="md:col-span-2 space-y-8">
            <section>
              <h2 className="text-xs font-semibold text-muted-foreground/60 tracking-wider uppercase mb-3">
                头像
              </h2>
               <div className="rounded-2xl bg-sidebar/30 p-5">
                <IconPicker
                  selectedAvatar={selectedAvatar}
                  onAvatarChange={setSelectedAvatar}
                />
              </div>
            </section>

            <section>
              <h2 className="text-xs font-semibold text-muted-foreground/60 tracking-wider uppercase mb-3">
                工具 / 技能
              </h2>
                             <div className="rounded-2xl bg-sidebar/30 p-5">
                <SkillSelector selected={skills} onChange={setSkills} />
              </div>
            </section>
          </div>
        </div>

        {/* Preview dialog */}
        <Dialog open={previewOpen} onOpenChange={setPreviewOpen}>
          <DialogContent className="sm:max-w-3xl max-h-[80vh] flex flex-col">
            <DialogHeader>
              <DialogTitle>预览系统提示词</DialogTitle>
            </DialogHeader>
            <div className="flex-1 overflow-y-auto px-1 py-2 text-sm prose prose-sm max-w-none dark:prose-invert">
              {systemPrompt.trim() ? (
                <MarkdownRenderer content={systemPrompt} />
              ) : (
                <p className="text-muted-foreground/50 italic py-8 text-center">暂无内容</p>
              )}
            </div>
          </DialogContent>
        </Dialog>

        {/* Advanced settings */}
        <div className="mt-8">
          <AdvancedSettings
            rollbackModel={rollbackModel}
            onRollbackModelChange={setRollbackModel}
            maxTokensPerSession={maxTokensPerSession}
            onMaxTokensChange={setMaxTokensPerSession}
            rateLimit={rateLimit}
            onRateLimitChange={setRateLimit}
            maxConcurrency={maxConcurrency}
            onMaxConcurrencyChange={setMaxConcurrency}
            kbEnabled={kbEnabled}
            onKbEnabledChange={setKbEnabled}
          />
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end gap-3 pt-8 pb-4 border-t border-sidebar-border/20 mt-8">
          <Button variant="ghost" onClick={() => navigate("/agents")} className="text-muted-foreground">
            取消
          </Button>
          <Button onClick={handleCreate}>
            {isEdit ? "保存" : "创建智能体"}
          </Button>
        </div>
      </div>
    </div>
  );
}
