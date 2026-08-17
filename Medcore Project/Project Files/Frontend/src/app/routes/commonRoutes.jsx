import AuthLayout from "../layouts/AuthLayout";
import Home from "../../features/public/pages/Home";
import Login from "../../features/auth/pages/Login";
import Register from "../../features/auth/pages/Register";
import VerifyOtp from "../../features/auth/pages/VerifyOtp";
import ForgotPassword from "../../features/auth/pages/ForgotPassword";
import ResetPassword from "../../features/auth/pages/ResetPassword";

export const commonRoutes = [
    {
        path: "/",
        element: <Home />,
    },
    {
        element: <AuthLayout />,
        children: [
            {path: "/login", element: <Login />},
            {path: "/register", element: <Register />},
            {path: "/verify-otp", element: <VerifyOtp />},
            {path: "/forgot-password", element: <ForgotPassword />},
            {path: "/reset-password", element: <ResetPassword />},
        ],
    },
    {
        path: "/unauthorized",
        element: (
            <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-slate-900">
                <div className="text-center">
                    <h1 className="text-4xl font-bold text-red-500 mb-2">403</h1>
                    <p className="text-slate-600 dark:text-slate-400 mb-4">
                        You don't have permission to access this page.
                    </p>
                    <a href="/login" className="text-hospital-blue hover:underline text-sm cursor-pointer">
                        Go to Login
                    </a>
                </div>
            </div>
        ),
    },
];
