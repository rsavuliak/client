import { useEffect } from "react";
import { Routes, Route, useLocation } from "react-router-dom";
import { TopNav } from "@/components/TopNav";
import { LoginForm } from "./components/login-form";
import { SignupForm } from "./components/signup-form";
import { ForgotPasswordForm } from "./components/forgot-password-form";
import { ResetPasswordForm } from "./components/reset-password-form";
import Main from "./components/Main";
import SettingsPage from "./pages/SettingsPage";
import TodoPage from "./pages/TodoPage";
import URLShortenerPage from "./pages/URLShortenerPage";
import { ProtectedRoute, PublicRoute } from "./components/ProtectedRoute";
import { authService } from "./services/authService";
import { userService } from "./services/userService";
import { useAuthStore } from "./services/useAuthStore";

const pageTitles: Record<string, string> = {
  "/": "Dibrova",
  "/settings": "Settings — Dibrova",
  "/todo": "Todo — Dibrova",
  "/url-shortener": "URL Shortener — Dibrova",
  "/login": "Login — Dibrova",
  "/signup": "Sign Up — Dibrova",
  "/forgot-password": "Reset Password — Dibrova",
  "/reset-password": "Reset Password — Dibrova",
};

function AppLayout() {
  const location = useLocation();

  useEffect(() => {
    document.title = pageTitles[location.pathname] ?? "Dibrova";
  }, [location.pathname]);

  return (
    <div className="min-h-screen flex flex-col">
      <TopNav />
      <main className="flex-1">
        <Routes>
          <Route path="/" element={<ProtectedRoute><Main /></ProtectedRoute>} />
          <Route path="/settings" element={<ProtectedRoute><SettingsPage /></ProtectedRoute>} />
          <Route path="/todo" element={<ProtectedRoute><TodoPage /></ProtectedRoute>} />
          <Route path="/url-shortener" element={<ProtectedRoute><URLShortenerPage /></ProtectedRoute>} />
          <Route path="/login" element={<PublicRoute><LoginForm /></PublicRoute>} />
          <Route path="/signup" element={<PublicRoute><SignupForm /></PublicRoute>} />
          <Route path="/forgot-password" element={<PublicRoute><ForgotPasswordForm /></PublicRoute>} />
          <Route path="/reset-password" element={<PublicRoute><ResetPasswordForm /></PublicRoute>} />
        </Routes>
      </main>
    </div>
  );
}

function App() {
  const isLoading = useAuthStore((s) => s.isLoading);

  useEffect(() => {
    authService.me()
      .then((res) => {
        useAuthStore.getState().setUser(res.data);
        return userService.getMe();
      })
      .then((res) => useAuthStore.getState().setProfile(res.data))
      .catch(() => useAuthStore.getState().clearUser())
      .finally(() => useAuthStore.getState().finishLoading());
  }, []);

  if (isLoading) {
    return (
      <div className="flex h-screen items-center justify-center text-muted-foreground text-sm">
        Loading…
      </div>
    );
  }

  return <AppLayout />;
}

export default App;
