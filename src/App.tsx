import { useEffect, useState } from "react";
import { MailWarning, X } from "lucide-react";
import { Routes, Route, useLocation } from "react-router-dom";
import { AppSidebar } from "@/components/app-sidebar";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
} from "@/components/ui/breadcrumb";
import { Separator } from "@/components/ui/separator";
import {
  SidebarInset,
  SidebarProvider,
  SidebarTrigger,
} from "@/components/ui/sidebar";
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

const breadcrumbLabels: Record<string, string> = {
  "/": "Home",
  "/settings": "Settings",
  "/todo": "Todo List",
  "/url-shortener": "URL Shortener",
};

function EmailVerificationBanner() {
  const profile = useAuthStore((s) => s.profile);
  const [dismissed, setDismissed] = useState(false);

  if (!profile || profile.emailVerified || dismissed) return null;

  return (
    <div className="flex items-center justify-between gap-3 border-b border-amber-200 bg-amber-50 px-6 py-2.5 text-amber-900">
      <div className="flex items-center gap-2.5 text-sm">
        <MailWarning className="size-4 shrink-0 text-amber-600" />
        <span>
          Please verify your email address — check your inbox for a verification link.
        </span>
      </div>
      <button
        onClick={() => setDismissed(true)}
        className="rounded p-0.5 text-amber-600 hover:bg-amber-100 hover:text-amber-900 transition-colors"
        aria-label="Dismiss"
      >
        <X className="size-3.5" />
      </button>
    </div>
  );
}

function AppLayout() {
  const location = useLocation();
  const label = breadcrumbLabels[location.pathname] ?? "Home";
  const href = location.pathname;

  return (
    <SidebarProvider>
      <AppSidebar />
      <SidebarInset>
        <header className="flex h-16 shrink-0 items-center gap-2">
          <div className="flex items-center gap-2 px-4">
            <SidebarTrigger className="-ml-1" />
            <Separator
              orientation="vertical"
              className="mr-2 data-[orientation=vertical]:h-4"
            />
            <Breadcrumb>
              <BreadcrumbList>
                <BreadcrumbItem className="hidden md:block">
                  <BreadcrumbLink href={href}>{label}</BreadcrumbLink>
                </BreadcrumbItem>
              </BreadcrumbList>
            </Breadcrumb>
          </div>
        </header>
        <EmailVerificationBanner />
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
      </SidebarInset>
    </SidebarProvider>
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
