import { useEffect } from "react";
import { RouterProvider } from "react-router";
import { useDispatch, useSelector } from "react-redux";
import { router } from "./app/routes/AppRoutes";
import { useSocket } from "./features/notification/hook/useSocket";
import { useNotifications } from "./features/notification/hook/useNotifications";

function App() {
  useSocket(); 
  const { user } = useSelector(state => state.auth);
  const { fetchNotifications } = useNotifications();

  useEffect(() => {
    if (user) {
      fetchNotifications();
    }
  }, [user, fetchNotifications]);
  useEffect(() => {
    const savedTheme = localStorage.getItem("theme");
    if (savedTheme === "dark" || (!savedTheme && window.matchMedia("(prefers-color-scheme: dark)").matches)) {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
  }, []);

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900 font-sans text-slate-900 dark:text-slate-100 transition-colors duration-300">
      <RouterProvider router={router} />
    </div>
  );
}

export default App;
