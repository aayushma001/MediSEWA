import React, { useState, useEffect } from 'react';
import { Bell, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface Notification {
  id: number;
  title: string;
  message: string;
  type: 'appointment' | 'reminder' | 'success' | 'warning' | 'info';
  timestamp: string;
  read: boolean;
  actionUrl?: string;
}

const NotificationBell: React.FC = () => {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);

  // Load notifications from appointments and localStorage
  useEffect(() => {
    const loadNotifications = async () => {
      const allNotifications: Notification[] = [];
      
      // Fetch appointments for appointment reminders
      try {
        const response = await fetch('http://127.0.0.1:8001/api/appointments/');
        if (response.ok) {
          const appointments = await response.json();
          const today = new Date().toISOString().split('T')[0];
          
          appointments.forEach((apt: any) => {
            const aptDate = apt.date;
            const daysUntil = Math.ceil((new Date(aptDate).getTime() - new Date(today).getTime()) / (1000 * 60 * 60 * 24));
            
            if (daysUntil === 1) {
              allNotifications.push({
                id: apt.id,
                title: 'Appointment Tomorrow',
                message: `Your appointment with ${apt.doctor || apt.specialty} is tomorrow at ${apt.time}`,
                type: 'appointment',
                timestamp: new Date().toISOString(),
                read: false
              });
            } else if (daysUntil === 0) {
              allNotifications.push({
                id: apt.id,
                title: 'Appointment Today',
                message: `Your appointment with ${apt.doctor || apt.specialty} is today at ${apt.time}. Don't forget to join!`,
                type: 'reminder',
                timestamp: new Date().toISOString(),
                read: false
              });
            }
          });
        }
      } catch (err) {
        console.log('Could not fetch appointments for notifications');
      }
      
      // Load saved notifications from localStorage
      const savedNotifications = localStorage.getItem('notifications');
      if (savedNotifications) {
        const parsed = JSON.parse(savedNotifications);
        // Add any saved notifications that aren't already in the list
        parsed.forEach((notif: Notification) => {
          if (!allNotifications.find(n => n.id === notif.id)) {
            allNotifications.push(notif);
          }
        });
      }

      // If no notifications, show welcome message
      if (allNotifications.length === 0) {
        allNotifications.push({
          id: Date.now(),
          title: 'Welcome to MediSewa',
          message: 'Your health dashboard is ready. Book your first appointment today!',
          type: 'success',
          timestamp: new Date().toISOString(),
          read: true
        });
      }

      setNotifications(allNotifications);
      setUnreadCount(allNotifications.filter(n => !n.read).length);
    };

    loadNotifications();

    // Poll for new notifications every 60 seconds
    const interval = setInterval(loadNotifications, 60000);

    return () => clearInterval(interval);
  }, []);

  const markAsRead = (id: number) => {
    const updated = notifications.map(n => 
      n.id === id ? { ...n, read: true } : n
    );
    setNotifications(updated);
    setUnreadCount(prev => Math.max(0, prev - 1));
    localStorage.setItem('notifications', JSON.stringify(updated));
  };

  const removeNotification = (id: number) => {
    const notification = notifications.find(n => n.id === id);
    const updated = notifications.filter(n => n.id !== id);
    setNotifications(updated);
    if (notification && !notification.read) {
      setUnreadCount(prev => Math.max(0, prev - 1));
    }
    localStorage.setItem('notifications', JSON.stringify(updated));
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'appointment': return 'text-blue-600 bg-blue-50 border-blue-200';
      case 'reminder': return 'text-amber-600 bg-amber-50 border-amber-200';
      case 'success': return 'text-green-600 bg-green-50 border-green-200';
      case 'warning': return 'text-yellow-600 bg-yellow-50 border-yellow-200';
      default: return 'text-slate-600 bg-slate-50 border-slate-200';
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'appointment': return '📅';
      case 'reminder': return '⏰';
      case 'success': return '✅';
      case 'warning': return '⚠️';
      default: return 'ℹ️';
    }
  };

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="relative p-2 rounded-full hover:bg-slate-100 transition-colors"
        aria-label={`Notifications ${unreadCount > 0 ? `(${unreadCount} unread)` : ''}`}
      >
        <Bell size={20} className="text-slate-600" />
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center font-bold">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: -10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -10, scale: 0.95 }}
            className="absolute right-0 mt-2 w-80 bg-white rounded-2xl shadow-xl border border-slate-200 z-50 max-h-96 overflow-hidden"
          >
            <div className="p-4 border-b border-slate-100">
              <h3 className="font-bold text-slate-800">Notifications</h3>
            </div>

            <div className="max-h-80 overflow-y-auto">
              {notifications.length === 0 ? (
                <div className="p-4 text-center text-slate-500">
                  <Bell size={32} className="mx-auto mb-2 opacity-50" />
                  <p className="text-sm">No notifications yet</p>
                </div>
              ) : (
                notifications.map((notification) => (
                  <div
                    key={notification.id}
                    className={`p-4 border-b border-slate-50 hover:bg-slate-50 transition-colors ${!notification.read ? 'bg-blue-50/50' : ''}`}
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <span className={`px-2 py-0.5 text-xs font-bold rounded-full border ${getTypeColor(notification.type)}`}>
                            {notification.type}
                          </span>
                          {!notification.read && (
                            <span className="w-2 h-2 bg-blue-500 rounded-full"></span>
                          )}
                        </div>
                        <h4 className="font-bold text-sm text-slate-800 mb-1">
                          {notification.title}
                        </h4>
                        <p className="text-xs text-slate-600 leading-relaxed">
                          {notification.message}
                        </p>
                        <p className="text-xs text-slate-400 mt-2">
                          {new Date(notification.timestamp).toLocaleString()}
                        </p>
                      </div>
                      <div className="flex gap-1">
                        {!notification.read && (
                          <button
                            onClick={() => markAsRead(notification.id)}
                            className="p-1 text-blue-500 hover:bg-blue-50 rounded"
                            aria-label="Mark as read"
                          >
                            ✓
                          </button>
                        )}
                        <button
                          onClick={() => removeNotification(notification.id)}
                          className="p-1 text-slate-400 hover:bg-slate-100 rounded"
                          aria-label="Remove notification"
                        >
                          <X size={14} />
                        </button>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>

            {notifications.length > 0 && (
              <div className="p-3 bg-slate-50 border-t border-slate-100">
                <button
                  onClick={() => {
                    setNotifications([]);
                    setUnreadCount(0);
                  }}
                  className="w-full text-xs text-slate-600 hover:text-slate-800 font-medium"
                >
                  Clear all notifications
                </button>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default NotificationBell;
