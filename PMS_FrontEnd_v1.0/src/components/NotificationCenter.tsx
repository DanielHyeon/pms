import React, { useMemo, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { ScrollArea } from './ui/scroll-area';
import { Separator } from './ui/separator';
import { Popover, PopoverContent, PopoverTrigger } from './ui/popover';
import {
  Bell,
  BellRing,
  X,
  AlertTriangle,
  Info,
  CheckCircle,
  Clock,
} from 'lucide-react';
import { useProjectNotifications } from '../hooks/useProjectNotifications';

interface NotificationCenterProps {
  projectId: string;
}

const typeIconMap = {
  alert: AlertTriangle,
  warning: AlertTriangle,
  info: Info,
  success: CheckCircle,
};

function formatTimestamp(timestamp: string) {
  try {
    return new Date(timestamp).toLocaleString('ko-KR');
  } catch {
    return timestamp;
  }
}

export function NotificationCenter({ projectId }: NotificationCenterProps) {
  const { notifications, isLoading, error, markRead } = useProjectNotifications(projectId);
  const [isOpen, setIsOpen] = useState(false);
  const [filter, setFilter] = useState<'all' | 'unread'>('all');

  const unreadCount = useMemo(() => notifications.filter((notification) => !notification.read).length, [notifications]);
  const filteredNotifications = useMemo(
    () => (filter === 'unread' ? notifications.filter((notification) => !notification.read) : notifications),
    [filter, notifications],
  );

  return (
    <Popover open={isOpen} onOpenChange={setIsOpen}>
      <PopoverTrigger asChild>
        <Button variant="ghost" size="icon" className="relative">
          <Bell className="w-5 h-5" />
          {unreadCount > 0 && (
            <span className="absolute -top-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full bg-destructive text-xs text-destructive-foreground">
              {unreadCount}
            </span>
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[360px] p-0" align="end">
        <Card className="border-none shadow-none">
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center justify-between text-base">
              <span>프로젝트 알림</span>
              <div className="flex items-center gap-2">
                <Button
                  variant={filter === 'all' ? 'secondary' : 'ghost'}
                  size="xs"
                  onClick={() => setFilter('all')}
                >
                  전체
                </Button>
                <Button
                  variant={filter === 'unread' ? 'secondary' : 'ghost'}
                  size="xs"
                  onClick={() => setFilter('unread')}
                >
                  읽지 않음
                </Button>
              </div>
            </CardTitle>
            <p className="text-xs text-muted-foreground">
              최신 프로젝트 이벤트와 품질 알림을 확인하세요.
            </p>
          </CardHeader>
          <Separator />
          <CardContent className="p-0">
            {isLoading && (
              <div className="p-4 text-sm text-muted-foreground">알림을 불러오는 중입니다...</div>
            )}

            {error && (
              <div className="p-4 text-sm text-destructive">알림을 불러오는 중 오류가 발생했습니다.</div>
            )}

            {!isLoading && !error && filteredNotifications.length === 0 && (
              <div className="p-4 text-sm text-muted-foreground">표시할 알림이 없습니다.</div>
            )}

            <ScrollArea className="h-[320px]">
              <div className="space-y-2 p-4">
                {filteredNotifications.map((notification) => {
                  const Icon = typeIconMap[notification.type as keyof typeof typeIconMap] ?? BellRing;
                  return (
                    <div
                      key={notification.id}
                      className={`rounded-lg border p-3 transition ${notification.read ? 'bg-muted/40' : 'bg-background shadow-sm'}`}
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex items-center gap-2">
                          <Icon className="h-4 w-4 text-muted-foreground" />
                          <h4 className="text-sm font-medium">{notification.title}</h4>
                        </div>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-6 w-6"
                          onClick={() => markRead(notification.id)}
                          aria-label="알림 읽음 처리"
                        >
                          <X className="h-3 w-3" />
                        </Button>
                      </div>
                      <p className="mt-2 text-sm text-muted-foreground">{notification.message}</p>
                      <div className="mt-3 flex items-center justify-between text-xs text-muted-foreground">
                        <div className="flex items-center gap-2">
                          <Badge variant={notification.priority === 'critical' ? 'destructive' : 'outline'}>
                            {notification.priority.toUpperCase()}
                          </Badge>
                          {notification.actionable && <Badge variant="secondary">추가 조치 필요</Badge>}
                        </div>
                        <span className="flex items-center gap-1">
                          <Clock className="h-3 w-3" />
                          {formatTimestamp(notification.timestamp)}
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </ScrollArea>
          </CardContent>
        </Card>
      </PopoverContent>
    </Popover>
  );
}
