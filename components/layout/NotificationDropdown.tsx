'use client';

import { useState, useEffect } from 'react';
import { Bell, Check, X, AlertCircle, TrendingUp, Settings } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { useUser } from '@clerk/nextjs';
import { cn } from '@/lib/utils';
import { supabase as createSupabaseClient } from '@/lib/supabase/browserClient';

interface Notification {
  id: string;
  user_id: string;
  title: string;
  message: string;
  type: 'info' | 'success' | 'warning' | 'error' | 'trade' | 'system';
  is_read: boolean;
  created_at: string;
  read_at?: string;
}

const getNotificationIcon = (type: string) => {
  const baseClass = 'h-4 w-4';
  switch (type) {
    case 'trade':
      return <TrendingUp className={baseClass} />;
    case 'warning':
      return <AlertCircle className={baseClass} />;
    case 'error':
      return <X className={baseClass} />;
    case 'success':
      return <Check className={baseClass} />;
    case 'system':
      return <Settings className={baseClass} />;
    default:
      return <Bell className={baseClass} />;
  }
};

const getNotificationBgColor = (type: string) => {
  switch (type) {
    case 'trade':
    case 'success':
      return 'bg-emerald-500/15 dark:bg-emerald-500/20 border-emerald-400/40';
    case 'warning':
      return 'bg-amber-400/15 dark:bg-amber-500/20 border-amber-300/40';
    case 'error':
      return 'bg-red-500/15 dark:bg-red-500/20 border-red-400/35';
    case 'system':
      return 'bg-cyan-500/15 dark:bg-cyan-500/20 border-cyan-400/35';
    default:
      return 'bg-slate-500/10 dark:bg-slate-900/60 border-slate-400/30';
  }
};

const getNotificationAccent = (type: string) => {
  switch (type) {
    case 'trade':
    case 'success':
      return 'text-emerald-300 border-emerald-400/40 bg-emerald-500/10';
    case 'warning':
      return 'text-amber-200 border-amber-300/40 bg-amber-500/10';
    case 'error':
      return 'text-red-300 border-red-400/40 bg-red-500/10';
    case 'system':
      return 'text-cyan-200 border-cyan-300/40 bg-cyan-500/10';
    default:
      return 'text-slate-200 border-slate-400/30 bg-slate-500/10';
  }
};

export default function NotificationDropdown() {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);
  const [isOpen, setIsOpen] = useState(false);
  const { user } = useUser();
  const supabase = createSupabaseClient();

  const unreadCount = notifications.filter(n => !n.is_read).length;

  // Fetch notifications
  const fetchNotifications = async () => {
    if (!user) return;

    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('notifications')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(20);

      if (error) {
        console.error('Error fetching notifications:', error);
        return;
      }

      setNotifications(data || []);
    } catch (error) {
      console.error('Error fetching notifications:', error);
    } finally {
      setLoading(false);
    }
  };

  // Mark notification as read
  const markAsRead = async (notificationId: string) => {
    if (!user) return;

    try {
      const { error } = await supabase
        .from('notifications')
        .update({
          is_read: true,
          read_at: new Date().toISOString()
        })
        .eq('id', notificationId)
        .eq('user_id', user.id);

      if (error) {
        console.error('Error marking notification as read:', error);
        return;
      }

      // Update local state
      setNotifications(prev =>
        prev.map(notification =>
          notification.id === notificationId
            ? { ...notification, is_read: true, read_at: new Date().toISOString() }
            : notification
        )
      );
    } catch (error) {
      console.error('Error marking notification as read:', error);
    }
  };

  // Mark all as read
  const markAllAsRead = async () => {
    if (!user) return;

    try {
      const unreadNotifications = notifications.filter(n => !n.is_read);
      const notificationIds = unreadNotifications.map(n => n.id);

      if (notificationIds.length === 0) return;

      const { error } = await supabase
        .from('notifications')
        .update({
          is_read: true,
          read_at: new Date().toISOString()
        })
        .in('id', notificationIds)
        .eq('user_id', user.id);

      if (error) {
        console.error('Error marking all notifications as read:', error);
        return;
      }

      // Update local state
      setNotifications(prev =>
        prev.map(notification => ({
          ...notification,
          is_read: true,
          read_at: new Date().toISOString()
        }))
      );
    } catch (error) {
      console.error('Error marking all notifications as read:', error);
    }
  };

  // Format time ago
  const timeAgo = (dateString: string) => {
    const now = new Date();
    const date = new Date(dateString);
    const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);

    if (diffInSeconds < 60) return 'Just now';
    if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}m ago`;
    if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)}h ago`;
    return `${Math.floor(diffInSeconds / 86400)}d ago`;
  };

  // Fetch notifications on component mount and when user changes
  useEffect(() => {
    if (user) {
      fetchNotifications();
    }
  }, [user]);

  // Set up real-time subscription for new notifications
  useEffect(() => {
    if (!user) return;

    let channel: any = null;

    try {
      channel = supabase
        .channel('notifications_realtime', {
          config: {
            presence: {
              key: user.id,
            },
          },
        })
        .on(
          'postgres_changes',
          {
            event: 'INSERT',
            schema: 'public',
            table: 'notifications',
            filter: `user_id=eq.${user.id}`,
          },
          (payload) => {
            const newNotification = payload.new as Notification;
            setNotifications(prev => [newNotification, ...prev]);
          }
        )
        .subscribe((status) => {
          if (status === 'SUBSCRIBED') {
            console.log('Notifications realtime subscription active');
          } else if (status === 'CHANNEL_ERROR') {
            console.warn('Notifications realtime subscription error');
          } else if (status === 'TIMED_OUT') {
            console.warn('Notifications realtime subscription timed out');
          }
        });
    } catch (error) {
      console.warn('Failed to set up notifications realtime subscription:', error);
    }

    return () => {
      if (channel) {
        try {
          supabase.removeChannel(channel);
        } catch (error) {
          console.warn('Error removing notifications channel:', error);
        }
      }
    };
  }, [user, supabase]);

  if (!user) return null;

  return (
    <Popover open={isOpen} onOpenChange={setIsOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="ghost"
          size="sm"
          aria-label="Open notifications"
          className={cn(
            'relative rounded-full border border-transparent transition-all duration-200',
            'focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-accent/60 focus-visible:ring-offset-slate-900',
            isOpen ? 'bg-slate-800/70 border-slate-600/60 shadow-lg shadow-slate-900/60' : 'hover:bg-slate-800/60'
          )}
        >
          <Bell className="h-5 w-5 text-white" />
          {unreadCount > 0 && (
            <Badge
              variant="destructive"
              className="absolute -top-2 -right-2 flex h-5 w-5 items-center justify-center rounded-full p-0 text-xs shadow-[0_2px_6px_rgba(17,24,39,0.45)]"
              aria-live="polite"
            >
              {unreadCount > 99 ? '99+' : unreadCount}
            </Badge>
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent
        className="w-[320px] sm:w-[360px] p-0 border border-slate-700/60 bg-slate-950/90 backdrop-blur-xl shadow-2xl shadow-slate-950/40 rounded-2xl"
        align="end"
      >
        <div className="flex items-center justify-between gap-3 px-4 py-3 border-b border-slate-700/60 bg-slate-900/80">
          <div>
            <h3 className="text-sm font-semibold text-white">Notifications</h3>
            <p className="text-[11px] uppercase tracking-wider text-white/50">Latest updates & alerts</p>
          </div>
          {unreadCount > 0 && (
            <Button
              variant="ghost"
              size="sm"
              onClick={markAllAsRead}
              className="h-8 px-3 text-xs font-semibold text-white/85 hover:text-white hover:bg-slate-800/80 focus-visible:ring-1 focus-visible:ring-accent"
            >
              Mark all read
            </Button>
          )}
        </div>

        <ScrollArea className="max-h-[26rem]">
          {loading ? (
            <div className="flex items-center justify-center p-8">
              <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-[#33E1DA]"></div>
            </div>
          ) : notifications.length === 0 ? (
            <div className="flex flex-col items-center justify-center p-8 text-center">
              <Bell className="h-8 w-8 text-white/60 mb-2" />
              <p className="text-sm text-white/90">No notifications yet</p>
              <p className="text-xs text-white/70 mt-1">
                You'll see notifications about trades, market updates, and system alerts here
              </p>
            </div>
          ) : (
            <div className="p-0">
              {notifications.map((notification, index) => {
                const unread = !notification.is_read;
                return (
                  <div key={notification.id}>
                    <button
                      type="button"
                      className={cn(
                        'w-full text-left p-4 transition-all duration-200 rounded-2xl border',
                        'focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-accent/60 focus-visible:ring-offset-slate-900',
                        getNotificationBgColor(notification.type),
                        unread
                          ? 'shadow-[0_0_0_1px_rgba(51,225,218,0.25)] hover:shadow-[0_0_0_1px_rgba(51,225,218,0.4)]'
                          : 'hover:bg-slate-800/40 border-slate-700/60'
                      )}
                      onClick={() => {
                        if (unread) {
                          markAsRead(notification.id);
                        }
                      }}
                    >
                      <div className="flex items-start gap-3">
                        <span
                          className={cn(
                            'flex h-9 w-9 items-center justify-center rounded-full border transition-transform duration-200',
                            getNotificationAccent(notification.type),
                            unread ? 'scale-100' : 'scale-95 opacity-80'
                          )}
                        >
                          {getNotificationIcon(notification.type)}
                        </span>
                        <div className="flex-1 min-w-0 space-y-1.5">
                          <div className="flex items-start justify-between gap-2">
                            <p
                              className={cn(
                                'text-sm font-semibold leading-tight',
                                unread ? 'text-white' : 'text-white/85'
                              )}
                            >
                              {notification.title}
                            </p>
                            {unread && (
                              <span
                                className="mt-1 inline-flex h-2.5 w-2.5 flex-shrink-0 rounded-full bg-[#33E1DA]"
                                aria-hidden="true"
                              />
                            )}
                          </div>
                          <p
                            className={cn(
                              'text-xs leading-relaxed line-clamp-2',
                              unread ? 'text-white/90' : 'text-white/60'
                            )}
                          >
                            {notification.message}
                          </p>
                          <p className="text-[11px] font-medium uppercase tracking-wide text-white/50">
                            {timeAgo(notification.created_at)}
                          </p>
                        </div>
                      </div>
                    </button>
                    {index < notifications.length - 1 && <Separator className="bg-slate-700/50" />}
                  </div>
                );
              })}
            </div>
          )}
        </ScrollArea>

        {notifications.length > 0 && (
          <>
            <Separator className="bg-slate-600/50" />
            <div className="p-2">
              <Button
                variant="ghost"
                size="sm"
                className="w-full text-xs text-white/90 hover:text-white hover:bg-slate-700/60"
                onClick={() => {
                  setIsOpen(false);
                  // Could navigate to a full notifications page here
                }}
              >
                View all notifications
              </Button>
            </div>
          </>
        )}
      </PopoverContent>
    </Popover>
  );
}