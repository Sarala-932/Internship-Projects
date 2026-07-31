import { useDispatch, useSelector } from "react-redux";
import notificationService from "../service/notification.service";
import { setLoading, setError, setNotificationsData, markReadLocally } from "../state/notificationSlice";
import { useCallback } from "react";
import toast from "react-hot-toast";

export const useNotifications = () => {
  const dispatch = useDispatch();
  const { notifications, unreadCount, loading, error } = useSelector((state) => state.notifications);

  const fetchNotifications = useCallback(async () => {
    try {
      dispatch(setLoading(true));
      const data = await notificationService.fetchNotifications();
      dispatch(setNotificationsData(data));
    } catch (err) {
      dispatch(setError(err.response?.data?.message || "Failed to load notifications"));
    } finally {
      dispatch(setLoading(false));
    }
  }, [dispatch]);

  const markAsRead = async (id) => {
    try {
      await notificationService.markAsRead(id);
      dispatch(markReadLocally(id));
    } catch (err) {
      toast.error("Failed to mark as read");
    }
  };

  return {
    notifications,
    unreadCount,
    loading,
    error,
    fetchNotifications,
    markAsRead
  };
};
