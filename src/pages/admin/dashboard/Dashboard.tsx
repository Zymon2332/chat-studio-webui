import React, { useState, useEffect } from 'react';
import { StatCard } from '../components/StatCard';
import { LineChartCard, PieChartCard } from '../components/ChartComponents';
import { ActivityFeed } from '../components/ActivityFeed';
import { Users, MessageSquare, Zap, Activity } from 'lucide-react';

// 模拟数据
const mockStats = {
  users: { total: 1234, change: '+12%', today: 23 },
  conversations: { total: 5680, change: '+8%', today: 156 },
  tokens: { consumed: '2.4M', change: '+23%', today: '125K' },
  activeUsers: { total: 89, change: '-5%', today: 12 },
};

const mockTrendData = [
  { date: '01-20', value: 120, secondaryValue: 80 },
  { date: '01-21', value: 132, secondaryValue: 92 },
  { date: '01-22', value: 101, secondaryValue: 71 },
  { date: '01-23', value: 134, secondaryValue: 94 },
  { date: '01-24', value: 190, secondaryValue: 130 },
  { date: '01-25', value: 230, secondaryValue: 170 },
  { date: '01-26', value: 210, secondaryValue: 150 },
];

const mockPieData = [
  { name: 'GPT-4', value: 450, color: '#6366f1' },
  { name: 'GPT-3.5', value: 300, color: '#8b5cf6' },
  { name: 'Claude', value: 200, color: '#ec4899' },
  { name: '其他', value: 50, color: '#94a3b8' },
];

const mockActivities = [
  {
    id: '1',
    type: 'user_registered' as const,
    message: '新用户 zhangsan@example.com 注册了账号',
    timestamp: new Date(Date.now() - 5 * 60 * 1000).toISOString(),
    user: { email: 'zhangsan@example.com' },
  },
  {
    id: '2',
    type: 'conversation_created' as const,
    message: '用户 lisi@example.com 开始了新对话',
    timestamp: new Date(Date.now() - 15 * 60 * 1000).toISOString(),
    user: { email: 'lisi@example.com' },
  },
  {
    id: '3',
    type: 'knowledge_updated' as const,
    message: '知识库 "产品文档" 已更新',
    timestamp: new Date(Date.now() - 30 * 60 * 1000).toISOString(),
  },
  {
    id: '4',
    type: 'system_notification' as const,
    message: 'Token 使用量接近月度限额 80%',
    timestamp: new Date(Date.now() - 45 * 60 * 1000).toISOString(),
  },
  {
    id: '5',
    type: 'settings_changed' as const,
    message: '系统默认模型已更改为 GPT-4',
    timestamp: new Date(Date.now() - 60 * 60 * 1000).toISOString(),
  },
];

export const Dashboard: React.FC = () => {
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // 模拟数据加载
    const timer = setTimeout(() => {
      setLoading(false);
    }, 1500);
    return () => clearTimeout(timer);
  }, []);

  return (
    <div className="space-y-6">
      {/* 页面标题 */}
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Dashboard</h1>
        <p className="text-muted-foreground">
          系统数据概览与实时监控
        </p>
      </div>

      {/* 统计卡片 */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <StatCard
          title="总用户数"
          value={mockStats.users.total.toLocaleString()}
          change={mockStats.users.change}
          changeType="positive"
          icon={Users}
          iconBgColor="bg-blue-500"
          loading={loading}
        />
        <StatCard
          title="今日对话"
          value={mockStats.conversations.today.toLocaleString()}
          change={mockStats.conversations.change}
          changeType="positive"
          icon={MessageSquare}
          iconBgColor="bg-emerald-500"
          loading={loading}
        />
        <StatCard
          title="Token 消耗"
          value={mockStats.tokens.consumed}
          change={mockStats.tokens.change}
          changeType="positive"
          icon={Zap}
          iconBgColor="bg-violet-500"
          loading={loading}
        />
        <StatCard
          title="活跃用户"
          value={mockStats.activeUsers.total.toString()}
          change={mockStats.activeUsers.change}
          changeType="negative"
          icon={Activity}
          iconBgColor="bg-orange-500"
          loading={loading}
        />
      </div>

      {/* 图表区域 */}
      <div className="grid gap-4 md:grid-cols-2">
        <LineChartCard
          title="用户增长趋势"
          description="过去 30 天"
          data={mockTrendData}
          dataKey="value"
          secondaryDataKey="secondaryValue"
          loading={loading}
        />
        <PieChartCard
          title="模型调用分布"
          description="今日数据"
          data={mockPieData}
          loading={loading}
        />
      </div>

      {/* 底部区域 */}
      <div className="grid gap-4 md:grid-cols-2">
        <ActivityFeed activities={mockActivities} loading={loading} />
        
        {/* 快捷操作 */}
        <div className="space-y-4">
          <div className="text-sm font-medium">快捷操作</div>
          <div className="grid gap-3">
            <button className="flex items-center gap-3 p-4 rounded-lg border hover:bg-accent transition-colors text-left">
              <div className="w-10 h-10 rounded-lg bg-indigo-100 flex items-center justify-center">
                <Users className="w-5 h-5 text-indigo-600" />
              </div>
              <div>
                <p className="font-medium">用户管理</p>
                <p className="text-sm text-muted-foreground">查看和管理所有用户</p>
              </div>
            </button>
            
            <button className="flex items-center gap-3 p-4 rounded-lg border hover:bg-accent transition-colors text-left">
              <div className="w-10 h-10 rounded-lg bg-emerald-100 flex items-center justify-center">
                <MessageSquare className="w-5 h-5 text-emerald-600" />
              </div>
              <div>
                <p className="font-medium">对话监控</p>
                <p className="text-sm text-muted-foreground">查看对话统计和分析</p>
              </div>
            </button>
            
            <button className="flex items-center gap-3 p-4 rounded-lg border hover:bg-accent transition-colors text-left">
              <div className="w-10 h-10 rounded-lg bg-violet-100 flex items-center justify-center">
                <Zap className="w-5 h-5 text-violet-600" />
              </div>
              <div>
                <p className="font-medium">系统设置</p>
                <p className="text-sm text-muted-foreground">配置模型参数和全局设置</p>
              </div>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
