import { useEffect } from "react";
import { getSocket } from "../../features/notification/hook/useSocket";

export const useRealtime = (resourceName, refreshCallback) => {
  useEffect(() => {
    let socket = getSocket();
    let intervalId = null;

    const handleDataUpdate = (payload) => {
      if (payload && payload.resource === resourceName) {
        console.log(`[Realtime] Triggering refresh for ${resourceName}`);
        refreshCallback();
      }
    };

    const attachListener = () => {
      socket = getSocket();
      if (socket) {
        socket.on("data_updated", handleDataUpdate);
        if (intervalId) clearInterval(intervalId);
      }
    };

    if (socket) {
      attachListener();
    } else {

      intervalId = setInterval(attachListener, 500);
    }

    return () => {
      if (intervalId) clearInterval(intervalId);
      if (socket) {
        socket.off("data_updated", handleDataUpdate);
      }
    };
  }, [resourceName, refreshCallback]);
};
