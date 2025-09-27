import { useState, useEffect, useRef } from 'react';
import { notificationsAPI } from '../utils/api';
import toast from 'react-hot-toast';

export const useNotifications = () => {
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const lastNotificationId = useRef(null);
  const isInitialized = useRef(false);

  const fetchNotifications = async () => {
    try {
      const response = await notificationsAPI.getRecent();
      const newNotifications = response.data || [];
      
      // Only show notifications after initial load
      if (isInitialized.current && newNotifications.length > 0) {
        const latestNotification = newNotifications[0];
        
        // Only show if it's a different notification than the last one
        if (latestNotification._id !== lastNotificationId.current) {
          lastNotificationId.current = latestNotification._id;
          
          // Show toast notification
          toast(latestNotification.notification, {
            icon: '⏰',
            duration: 6000,
            position: 'top-right'
          });
          
          // Show browser notification if permission granted
          if (Notification.permission === 'granted') {
            new Notification('Lively Task Alert', {
              body: latestNotification.notification,
              icon: '/vite.svg'
            });
          }
        }
      }
      
      setNotifications(newNotifications);
      setUnreadCount(newNotifications.length);
      
      // Mark as initialized after first fetch
      if (!isInitialized.current) {
        isInitialized.current = true;
        if (newNotifications.length > 0) {
          lastNotificationId.current = newNotifications[0]._id;
        }
      }
    } catch (error) {
      console.error('Failed to fetch notifications');
    }
  };

  const clearNotifications = async () => {
    try {
      await notificationsAPI.clear();
      setNotifications([]);
      setUnreadCount(0);
      lastNotificationId.current = null;
      toast.success('Notifications cleared');
    } catch (error) {
      toast.error('Failed to clear notifications');
    }
  };

  const requestNotificationPermission = async () => {
    if ('Notification' in window && Notification.permission === 'default') {
      await Notification.requestPermission();
    }
  };

  useEffect(() => {
    // Request notification permission
    requestNotificationPermission();
    
    // Initial fetch
    fetchNotifications();
    
    // Poll every 60 seconds (less frequent)
    const interval = setInterval(fetchNotifications, 60000);
    
    return () => clearInterval(interval);
  }, []);

  return {
    notifications,
    unreadCount,
    fetchNotifications,
    clearNotifications
  };
};