'use client';

import { useState, useEffect } from 'react';
import { Bell, Check, X, AlertCircle, TrendingUp, Settings, Users } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { useUser } from '@clerk/nextjs';
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
  switch (type) {
    case 'trade':
      return <TrendingUp className="h-4 w-4 text-emerald-400" />;
    case 'warning':
      return <AlertCircle className="h-4 w-4 text-amber-400" />;
    case 'error':
      return <X className="h-4 w-4 text-red-400" />;
    case 'success':
      return <Check className="h-4 w-4 text-emerald-400" />;
    case 'system':
      return <Settings className="h-4 w-4 text-cyan-400" />;
    default:
      return <Bell className="h-4 w-4 text-slate-400" />;
  }
};

const getNotificationBgColor = (type: string) => {
  switch (type) {
    case 'trade':
      return 'bg-emerald-50 dark:bg-emerald-950/30 border-emerald-200 dark:border-emerald-700/50';
    case 'warning':
      return 'bg-amber-50 dark:bg-amber-950/30 border-amber-200 dark:border-amber-700/50';
    case 'error':
      return 'bg-red-50 dark:bg-red-950/30 border-red-200 dark:border-red-700/50';
    case 'success':
      return 'bg-emerald-50 dark:bg-emerald-950/30 border-emerald-200 dark:border-emerald-700/50';
    case 'system':
      return 'bg-cyan-50 dark:bg-cyan-950/30 border-cyan-200 dark:border-cyan-700/50';
    default:
      return 'bg-slate-50 dark:bg-slate-800/50 border-slate-200 dark:border-slate-600/50';
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
        <Button variant="ghost" size="sm" className="relative">
          <Bell className="h-5 w-5" />
          {unreadCount > 0 && (
            <Badge
              variant="destructive"
              className="absolute -top-2 -right-2 h-5 w-5 rounded-full p-0 flex items-center justify-center text-xs"
            >
              {unreadCount > 99 ? '99+' : unreadCount}
            </Badge>
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-80 p-0" align="end">
        <div className="flex items-center justify-between p-4 border-b border-slate-600/50">
          <h3 className="font-semibold text-white">Notifications</h3>
          {unreadCount > 0 && (
            <Button
              variant="ghost"
              size="sm"
              onClick={markAllAsRead}
              className="text-xs text-slate-300 hover:text-white hover:bg-slate-700/50"
            >
              Mark all read
            </Button>
          )}
        </div>

        <ScrollArea className="h-96">
          {loading ? (
            <div className="flex items-center justify-center p-8">
              <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-[#33E1DA]"></div>
            </div>
          ) : notifications.length === 0 ? (
            <div className="flex flex-col items-center justify-center p-8 text-center">
              <Bell className="h-8 w-8 text-slate-400 mb-2" />
              <p className="text-sm text-slate-300">No notifications yet</p>
              <p className="text-xs text-slate-400 mt-1">
                You'll see notifications about trades, market updates, and system alerts here
              </p>
            </div>
          ) : (
            <div className="p-0">
              {notifications.map((notification, index) => (
                <div key={notification.id}>
                  <div
                    className={`p-4 cursor-pointer transition-colors hover:bg-slate-700/30 ${
                      !notification.is_read ? 'bg-slate-800/40' : ''
                    }`}
                    onClick={() => {
                      if (!notification.is_read) {
                        markAsRead(notification.id);
                      }
                    }}
                  >
                    <div className="flex items-start space-x-3">
                      <div className="flex-shrink-0 mt-0.5">
                        {getNotificationIcon(notification.type)}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between">
                          <p className={`text-sm font-medium truncate ${
                            !notification.is_read ? 'text-white' : 'text-slate-300'
                          }`}>
                            {notification.title}
                          </p>
                          {!notification.is_read && (
                            <div className="w-2 h-2 bg-[#33E1DA] rounded-full flex-shrink-0" />
                          )}
                        </div>
                        <p className={`text-xs mt-1 line-clamp-2 ${
                          !notification.is_read ? 'text-slate-200' : 'text-slate-400'
                        }`}>
                          {notification.message}
                        </p>
                        <p className="text-xs text-slate-400 mt-2">
                          {timeAgo(notification.created_at)}
                        </p>
                      </div>
                    </div>
                  </div>
                  {index < notifications.length - 1 && <Separator />}
                </div>
              ))}
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
                className="w-full text-xs text-slate-300 hover:text-white hover:bg-slate-700/50"
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