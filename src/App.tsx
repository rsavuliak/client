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
