import { useEffect } from "react";
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
import Main from "./components/Main";
import SettingsPage from "./pages/SettingsPage";
import { ProtectedRoute, PublicRoute } from "./components/ProtectedRoute";
import { authService } from "./services/authService";
import { userService } from "./services/userService";
import { useAuthStore } from "./services/useAuthStore";

const breadcrumbLabels: Record<string, string> = {
  "/": "Main",
  "/settings": "Settings",
};

function EmailVerificationBanner() {
  const profile = useAuthStore((s) => s.profile);
  if (!profile || profile.emailVerified) return null;

  return (
    <div className="flex items-center gap-2 bg-amber-50 border-b border-amber-200 px-4 py-2 text-sm text-amber-800">
      <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="shrink-0"><path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3"/><path d="M12 9v4"/><path d="M12 17h.01"/></svg>
      Please verify your email address. Check your inbox for a verification link.
    </div>
  );
}

function AppLayout() {
  const location = useLocation();
  const label = breadcrumbLabels[location.pathname] ?? "Main";
  const href = location.pathname === "/settings" ? "/settings" : "/";

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
          <Route path="/login" element={<PublicRoute><LoginForm /></PublicRoute>} />
          <Route path="/signup" element={<PublicRoute><SignupForm /></PublicRoute>} />
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
