import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Skeleton } from '@/components/ui/skeleton';
import { formatDistanceToNow } from '@/lib/utils';
import { UserPlus, MessageSquare, Database, Settings, Bell } from 'lucide-react';

interface Activity {
  id: string;
  type: 'user_registered' | 'conversation_created' | 'knowledge_updated' | 'system_notification' | 'settings_changed';
  message: string;
  timestamp: string;
  user?: {
    email: string;
    avatar?: string;
  };
}

interface ActivityFeedProps {
  activities: Activity[];
  loading?: boolean;
}

const activityIcons = {
  user_registered: { icon: UserPlus, color: 'bg-emerald-500' },
  conversation_created: { icon: MessageSquare, color: 'bg-blue-500' },
  knowledge_updated: { icon: Database, color: 'bg-amber-500' },
  system_notification: { icon: Bell, color: 'bg-purple-500' },
  settings_changed: { icon: Settings, color: 'bg-slate-500' },
};

export const ActivityFeed: React.FC<ActivityFeedProps> = ({
  activities,
  loading = false,
}) => {
  if (loading) {
    return (
      <Card>
        <CardHeader>
          <Skeleton className="h-6 w-24" />
        </CardHeader>
        <CardContent className="space-y-4">
          {[1, 2, 3, 4, 5].map((i) => (
            <div key={i} className="flex items-start gap-3">
              <Skeleton className="h-9 w-9 rounded-full" />
              <div className="flex-1 space-y-2">
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-3 w-24" />
              </div>
            </div>
          ))}
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">最近活动</CardTitle>
      </CardHeader>
      <CardContent className="max-h-[320px] overflow-y-auto">
        <div className="space-y-4">
          {activities.length === 0 ? (
            <p className="text-center text-muted-foreground py-8">暂无活动记录</p>
          ) : (
            activities.map((activity) => {
              const { icon: Icon, color } = activityIcons[activity.type];
              return (
                <div
                  key={activity.id}
                  className="flex items-start gap-3 p-3 rounded-lg hover:bg-accent/50 transition-colors"
                >
                  <div
                    className={`w-9 h-9 rounded-full ${color} flex items-center justify-center flex-shrink-0`}
                  >
                    <Icon className="w-4 h-4 text-white" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm">{activity.message}</p>
                    <p className="text-xs text-muted-foreground mt-1">
                      {formatDistanceToNow(new Date(activity.timestamp))}
                    </p>
                  </div>
                  {activity.user && (
                    <Avatar className="h-7 w-7">
                      <AvatarFallback className="text-xs bg-indigo-100 text-indigo-700">
                        {activity.user.email.charAt(0).toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                  )}
                </div>
              );
            })
          )}
        </div>
      </CardContent>
    </Card>
  );
};
