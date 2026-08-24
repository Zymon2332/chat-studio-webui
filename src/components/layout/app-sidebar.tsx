import { useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { SettingsDialog } from "@/pages/settings/SettingsDialog";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarGroup,
  SidebarGroupLabel,
  SidebarGroupContent,
  SidebarTrigger,
  useSidebar,
} from "@/components/ui/sidebar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
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
import { Plus, BookOpen, Wrench, Bot, Settings, ChevronUp, ChevronDown, LogOut, MoreVertical, Edit, Trash } from "lucide-react";
import { useState, useEffect, useRef } from "react";
import { BrandMark } from "@/components/BrandMark";
import { renameSession, deleteSessions } from "@/lib/session";
import { Input } from "@/components/ui/input";
import { useSession } from "@/contexts/SessionContext";
import type { Session } from "@/types/session";

export function AppSidebar({ variant = "sidebar" }: { variant?: "sidebar" | "inset" }) {
  const navigate = useNavigate();
  const location = useLocation();
  const { state } = useSidebar();
  const { user, logout } = useAuth();
  
  const isCollapsed = state === "collapsed";
  const isActive = (path: string) => location.pathname === path;

  const handleNewChat = () => navigate("/");
  const handleNavigate = (path: string) => navigate(path);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const handleSettings = () => setSettingsOpen(true);
  const [showAllSessions, setShowAllSessions] = useState(false);
  
  // 退出登录确认对话框状态
  const [showLogoutDialog, setShowLogoutDialog] = useState(false);
  
  const { sessions, isLoading, fetchSessions } = useSession();
  
  // 行内编辑状态
  const [editingSessionId, setEditingSessionId] = useState<string | null>(null);
  const [editingTitle, setEditingTitle] = useState("");
  const editInputRef = useRef<HTMLInputElement>(null);
  
  // 删除确认对话框状态
  const [sessionToDelete, setSessionToDelete] = useState<string | null>(null);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  
  useEffect(() => {
    fetchSessions();
  }, [fetchSessions]);
  
  const handleLogoutClick = () => {
    setShowLogoutDialog(true);
  };
  
  const handleConfirmLogout = async () => {
    setShowLogoutDialog(false);
    await logout();
    navigate("/login");
  };
  
  // 开始编辑会话名称
  const handleStartEdit = (session: Session) => {
    setEditingSessionId(session.sessionId);
    setEditingTitle(session.sessionTitle);
    setTimeout(() => editInputRef.current?.focus(), 0);
  };
  
  // 保存编辑
  const handleSaveEdit = async () => {
    if (!editingSessionId || !editingTitle.trim()) {
      setEditingSessionId(null);
      return;
    }
    
    try {
      await renameSession(editingSessionId, editingTitle.trim());
      await fetchSessions();
    } catch {
      // 静默失败
    } finally {
      setEditingSessionId(null);
    }
  };
  
  // 取消编辑
  const handleCancelEdit = () => {
    setEditingSessionId(null);
    setEditingTitle("");
  };
  
  // 处理编辑键盘事件
  const handleEditKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSaveEdit();
    } else if (e.key === 'Escape') {
      handleCancelEdit();
    }
  };
  
  // 显示删除确认
  const handleShowDelete = (sessionId: string) => {
    setSessionToDelete(sessionId);
    setShowDeleteDialog(true);
  };
  
  // 确认删除
  const handleConfirmDelete = async () => {
    if (!sessionToDelete) return;
    
    setShowDeleteDialog(false);
    try {
      await deleteSessions([sessionToDelete]);
      
      const currentPath = location.pathname;
      if (currentPath.includes(`/conversation/${sessionToDelete}`)) {
        navigate("/");
      }
      
      await fetchSessions();
    } catch {
      // 静默失败
    } finally {
      setSessionToDelete(null);
    }
  };

  return (
    <>
      <Sidebar collapsible="icon" variant={variant}>
      <SidebarHeader className="p-4">
        <div className={"flex items-center " + (isCollapsed ? "justify-center" : "justify-between")}>
          {!isCollapsed && (
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                <BrandMark className="size-5 text-primary" />
              </div>
              <div className="flex flex-col">
                <span className="text-sm font-medium text-sidebar-foreground tracking-tight">Chat Studio</span>
                <span className="text-[10px] text-sidebar-foreground/40 tracking-widest uppercase">Agent Platform</span>
              </div>
            </div>
          )}
          <SidebarTrigger />
        </div>
      </SidebarHeader>

      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupContent>
            <SidebarMenu>
              <SidebarMenuItem>
                <SidebarMenuButton 
                  asChild 
                  onClick={handleNewChat}
                  tooltip="新建任务"
                  className="text-primary hover:text-primary data-[active=true]:bg-primary/10"
                >
                  <div className="flex items-center gap-2 cursor-pointer font-medium">
                    <Plus className="h-4 w-4" />
                    <span>新建任务</span>
                  </div>
                </SidebarMenuButton>
              </SidebarMenuItem>

              <SidebarMenuItem>
                <SidebarMenuButton 
                  asChild 
                  isActive={isActive("/knowledge")}
                  onClick={() => handleNavigate("/knowledge")}
                  tooltip="知识库"
                >
                  <div className="flex items-center gap-2 cursor-pointer">
                    <BookOpen className="h-4 w-4" />
                    <span>知识库</span>
                  </div>
                </SidebarMenuButton>
              </SidebarMenuItem>

              <SidebarMenuItem>
                <SidebarMenuButton 
                  asChild 
                  isActive={isActive("/skills")}
                  onClick={() => handleNavigate("/skills")}
                  tooltip="技能"
                >
                  <div className="flex items-center gap-2 cursor-pointer">
                    <Wrench className="h-4 w-4" />
                    <span>技能</span>
                  </div>
                </SidebarMenuButton>
              </SidebarMenuItem>

              <SidebarMenuItem>
                <SidebarMenuButton 
                  asChild 
                  isActive={isActive("/agents")}
                  onClick={() => handleNavigate("/agents")}
                  tooltip="智能体管理"
                >
                  <div className="flex items-center gap-2 cursor-pointer">
                    <Bot className="h-4 w-4" />
                    <span>智能体管理</span>
                  </div>
                </SidebarMenuButton>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        {!isCollapsed && (
          <SidebarGroup className="flex-1 overflow-hidden">
            <SidebarGroupLabel>任务</SidebarGroupLabel>
            <SidebarGroupContent className="overflow-y-auto max-h-[calc(100vh-340px)]">
              {isLoading ? (
                <div className="px-4 py-2 text-sm text-muted-foreground">加载中...</div>
              ) : sessions.length === 0 ? (
                <div className="px-4 py-2 text-sm text-muted-foreground">暂无任务</div>
              ) : (<>
                <SidebarMenu>
                  {(showAllSessions ? sessions : sessions.slice(0, 5)).map((session) => (
                    <SidebarMenuItem key={session.sessionId}>
                      {editingSessionId === session.sessionId ? (
                        <div className="flex items-center px-2 py-1">
                          <Input
                            ref={editInputRef}
                            value={editingTitle}
                            onChange={(e) => setEditingTitle(e.target.value)}
                            onBlur={handleSaveEdit}
                            onKeyDown={handleEditKeyDown}
                            className="h-7 text-sm"
                          />
                        </div>
                      ) : (
                        <div className="flex items-center w-full">
                          <SidebarMenuButton
                            className="flex-1"
                            onClick={() => navigate(`/conversation/${session.sessionId}`, { state: { sessionTitle: session.sessionTitle } })}
                          >
                            <span className="truncate">{session.sessionTitle}</span>
                          </SidebarMenuButton>
                          <div className="opacity-0 group-hover/menu-item:opacity-100 transition-opacity">
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <button 
                                  className="p-1 hover:bg-accent rounded shrink-0"
                                  onClick={(e) => e.stopPropagation()}
                                >
                                  <MoreVertical className="h-4 w-4" />
                                </button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="end">
                                <DropdownMenuItem onClick={() => handleStartEdit(session)}>
                                  <Edit className="mr-2 h-4 w-4" />
                                  修改名称
                                </DropdownMenuItem>
                                <DropdownMenuItem 
                                  onClick={() => handleShowDelete(session.sessionId)}
                                  className="text-destructive"
                                >
                                  <Trash className="mr-2 h-4 w-4" />
                                  删除任务
                                </DropdownMenuItem>
                              </DropdownMenuContent>
                            </DropdownMenu>
                          </div>
                        </div>
                      )}
                    </SidebarMenuItem>
                  ))}
                </SidebarMenu>
                {sessions.length > 5 && (
                  <button
                    onClick={() => setShowAllSessions(!showAllSessions)}
                    className="flex items-center justify-start w-full gap-1 px-4 py-2 text-xs text-muted-foreground hover:text-foreground transition-colors"
                  >
                    {showAllSessions ? (
                      <>收起 <ChevronUp className="h-3 w-3 inline" /></>
                    ) : (
                      <>查看更多 ({sessions.length - 5}) <ChevronDown className="h-3 w-3 inline" /></>
                    )}
                  </button>
                )}
              </>
              )}
            </SidebarGroupContent>
          </SidebarGroup>
        )}
      </SidebarContent>

      <SidebarFooter className="p-4">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button 
              className={"flex items-center w-full hover:bg-sidebar-accent rounded-md p-2 transition-colors " +
                (isCollapsed ? "justify-center" : "justify-between")}
            >
              <div className="flex items-center gap-3">
                <Avatar className="h-8 w-8 shrink-0">
                  <AvatarImage src={user?.profileAvatarUrl} />
                  <AvatarFallback className="bg-primary/10 text-primary text-sm">
                    {user?.nickName?.slice(0, 2) || user?.email?.slice(0, 2) || 'U'}
                  </AvatarFallback>
                </Avatar>
                
                {!isCollapsed && (
                  <div className="flex flex-col items-start text-left">
                    <span className="text-sm font-medium truncate max-w-[120px]">
                      {user?.nickName || user?.email}
                    </span>
                    <span className="text-xs text-muted-foreground truncate max-w-[120px]">
                      {user?.userRole === 'ADMIN' ? '管理员' : '普通用户'}
                    </span>
                  </div>
                )}
              </div>
              
              {!isCollapsed && (
                <ChevronUp className="h-4 w-4 text-muted-foreground shrink-0" />
              )}
            </button>
          </DropdownMenuTrigger>
          
          <DropdownMenuContent side="right" align="start" className="w-56 bg-popover border shadow-xl">
            {/* 用户信息头部 */}
            <div className="flex items-center gap-3 p-3 border-b border-border">
              <Avatar className="h-10 w-10 shrink-0">
                <AvatarImage src={user?.profileAvatarUrl} />
                <AvatarFallback className="bg-primary/10 text-primary text-sm">
                  {user?.nickName?.slice(0, 2) || user?.email?.slice(0, 2) || 'U'}
                </AvatarFallback>
              </Avatar>
              <div className="flex flex-col min-w-0">
                <span className="text-sm font-medium truncate">{user?.nickName || user?.email}</span>
                <span className="text-xs text-muted-foreground truncate">{user?.userRole === 'ADMIN' ? '管理员' : '普通用户'}</span>
              </div>
            </div>

            <DropdownMenuItem onClick={handleSettings}>
              <Settings className="mr-2 h-4 w-4" />
              <span>设置</span>
            </DropdownMenuItem>

            <DropdownMenuSeparator />

            <DropdownMenuItem onClick={handleLogoutClick}>
              <LogOut className="mr-2 h-4 w-4" />
              <span>退出登录</span>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </SidebarFooter>
    </Sidebar>
    
    {/* 退出登录确认对话框 */}
    <AlertDialog open={showLogoutDialog} onOpenChange={setShowLogoutDialog}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>确认退出</AlertDialogTitle>
          <AlertDialogDescription>
            您确定要退出登录吗？
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel onClick={() => setShowLogoutDialog(false)}>
            取消
          </AlertDialogCancel>
          <AlertDialogAction onClick={handleConfirmLogout}>
            退出登录
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
    
    <SettingsDialog open={settingsOpen} onOpenChange={setSettingsOpen} />

    {/* 删除会话确认对话框 */}
    <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>确认删除</AlertDialogTitle>
          <AlertDialogDescription>
            您确定要删除这个会话吗？此操作不可恢复。
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel onClick={() => setShowDeleteDialog(false)}>
            取消
          </AlertDialogCancel>
          <AlertDialogAction onClick={handleConfirmDelete} className="bg-destructive hover:bg-destructive/90">
            删除
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
    </>
  );
}
