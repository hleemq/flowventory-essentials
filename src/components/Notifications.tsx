
import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { Bell } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { supabase } from "@/integrations/supabase/client";
import { useLanguage } from "@/contexts/LanguageContext";
import { toast } from "sonner";

const translations = {
  en: {
    noNotifications: "No new notifications",
    notifications: "Notifications",
    lowStock: "Low Stock Alert",
    markAllAsRead: "Mark all as read"
  },
  fr: {
    noNotifications: "Aucune nouvelle notification",
    notifications: "Notifications",
    lowStock: "Alerte de stock bas",
    markAllAsRead: "Marquer tout comme lu"
  },
  ar: {
    noNotifications: "لا توجد إشعارات جديدة",
    notifications: "الإشعارات",
    lowStock: "تنبيه المخزون المنخفض",
    markAllAsRead: "تعليم الكل كمقروء"
  }
};

type Notification = {
  id: string;
  message: string;
  created_at: string;
  is_read: boolean;
  type?: string;
  related_item?: string;
};

const Notifications = () => {
  const { language } = useLanguage();
  const t = translations[language];
  const [isOpen, setIsOpen] = useState(false);

  const { data: notifications, isLoading, refetch } = useQuery({
    queryKey: ["notifications"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("notifications")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) throw error;
      return data as Notification[];
    }
  });

  useEffect(() => {
    // Listen for new notifications in real-time
    const channel = supabase
      .channel('public:notifications')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public', 
          table: 'notifications'
        },
        (payload) => {
          console.log('New notification received:', payload);
          refetch();
          
          // Show toast for new notification
          const newNotification = payload.new as Notification;
          toast.info(newNotification.message, {
            duration: 5000,
          });
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [refetch]);

  const unreadCount = notifications?.filter(n => !n.is_read).length || 0;

  const markAllAsRead = async () => {
    try {
      const { error } = await supabase
        .from("notifications")
        .update({ is_read: true })
        .eq("is_read", false);
      
      if (error) throw error;
      refetch();
    } catch (error) {
      console.error("Error marking notifications as read:", error);
    }
  };

  const markAsRead = async (id: string) => {
    try {
      const { error } = await supabase
        .from("notifications")
        .update({ is_read: true })
        .eq("id", id);
      
      if (error) throw error;
      refetch();
    } catch (error) {
      console.error("Error marking notification as read:", error);
    }
  };

  return (
    <DropdownMenu open={isOpen} onOpenChange={setIsOpen}>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className="relative"
        >
          <Bell className="h-5 w-5" />
          {unreadCount > 0 && (
            <span className="absolute -top-1 -right-1 h-4 w-4 rounded-full bg-destructive text-[10px] font-medium text-destructive-foreground flex items-center justify-center">
              {unreadCount}
            </span>
          )}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-80">
        <div className="flex items-center justify-between px-3 py-2 border-b">
          <h3 className="font-medium">{t.notifications}</h3>
          {unreadCount > 0 && (
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={markAllAsRead}
              className="text-xs h-7"
            >
              {t.markAllAsRead}
            </Button>
          )}
        </div>
        
        {isLoading ? (
          <DropdownMenuItem disabled>Loading...</DropdownMenuItem>
        ) : !notifications?.length ? (
          <DropdownMenuItem disabled className="text-muted-foreground">
            {t.noNotifications}
          </DropdownMenuItem>
        ) : (
          <div className="max-h-[300px] overflow-y-auto">
            {notifications.map((notification) => (
              <DropdownMenuItem
                key={notification.id}
                onClick={() => markAsRead(notification.id)}
                className={`flex flex-col items-start py-3 cursor-pointer ${!notification.is_read ? 'bg-muted/50' : ''}`}
              >
                <div className="flex items-start justify-between w-full">
                  <span className="text-sm font-medium">
                    {notification.type === 'low_stock' && `${t.lowStock}: `}
                    {notification.message}
                  </span>
                  {!notification.is_read && (
                    <span className="h-2 w-2 rounded-full bg-primary ml-2 mt-1 flex-shrink-0"></span>
                  )}
                </div>
                <span className="text-xs text-muted-foreground mt-1">
                  {new Date(notification.created_at).toLocaleDateString(
                    language === 'ar' ? 'ar-SA' : 
                    language === 'fr' ? 'fr-FR' : 
                    'en-US',
                    { 
                      day: 'numeric', 
                      month: 'short', 
                      hour: '2-digit', 
                      minute: '2-digit' 
                    }
                  )}
                </span>
              </DropdownMenuItem>
            ))}
          </div>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export default Notifications;
