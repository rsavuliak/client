import { useState } from "react";
import { Link, NavLink, useNavigate } from "react-router-dom";
import { Home, ListTodo, Link2, Settings, LogOut, Menu } from "lucide-react";
import { useAuthStore } from "@/services/useAuthStore";
import { authService } from "@/services/authService";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { cn } from "@/lib/utils";

const navItems = [
  { to: "/", label: "Home", icon: Home, end: true },
  { to: "/todo", label: "Todo", icon: ListTodo },
  { to: "/url-shortener", label: "URL Shortener", icon: Link2 },
];

function NavItem({
  to,
  label,
  icon: Icon,
  end,
  onClick,
}: {
  to: string;
  label: string;
  icon: typeof Home;
  end?: boolean;
  onClick?: () => void;
}) {
  return (
    <NavLink
      to={to}
      end={end}
      onClick={onClick}
      className={({ isActive }) =>
        cn(
          "flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-colors",
          isActive
            ? "bg-accent text-accent-foreground font-medium"
            : "text-muted-foreground hover:bg-accent/50 hover:text-foreground"
        )
      }
    >
      <Icon className="size-4 shrink-0" />
      {label}
    </NavLink>
  );
}

function SidebarBrand() {
  return (
    <Link to="/" className="flex items-center gap-2.5 px-3 py-1">
      <div className="flex size-7 items-center justify-center rounded-md bg-primary text-primary-foreground text-xs font-bold shrink-0">
        D
      </div>
      <span className="font-semibold text-sm">Dibrova</span>
    </Link>
  );
}

function UserSection() {
  const navigate = useNavigate();
  const user = useAuthStore((s) => s.user);
  const profile = useAuthStore((s) => s.profile);

  const displayName = profile?.displayName ?? user?.email ?? "";
  const initials = displayName.slice(0, 2).toUpperCase();

  const handleLogout = async () => {
    try { await authService.logout(); } catch { /* ignore */ } finally {
      useAuthStore.getState().clearUser();
      navigate("/login");
    }
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button className="flex items-center gap-3 px-3 py-2.5 rounded-lg w-full text-left hover:bg-accent/50 transition-colors outline-none focus-visible:ring-2 focus-visible:ring-ring">
          <Avatar className="h-7 w-7 shrink-0">
            <AvatarImage src={profile?.avatarUrl ?? undefined} alt={displayName} />
            <AvatarFallback className="text-[11px]">{initials}</AvatarFallback>
          </Avatar>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium leading-none truncate">{displayName}</p>
            <p className="text-xs text-muted-foreground mt-0.5 truncate">{user?.email}</p>
          </div>
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent side="top" align="start" className="w-56 mb-1">
        <DropdownMenuItem onClick={() => navigate("/settings")}>
          <Settings className="size-4" />
          Settings
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem
          onClick={handleLogout}
          className="text-destructive focus:text-destructive"
        >
          <LogOut className="size-4" />
          Log out
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

function SidebarContent({ onNavClick }: { onNavClick?: () => void }) {
  return (
    <div className="flex flex-col h-full">
      <div className="flex items-center h-14 px-1 border-b shrink-0">
        <SidebarBrand />
      </div>

      <nav className="flex-1 px-2 py-3 flex flex-col gap-0.5 overflow-y-auto">
        {navItems.map((item) => (
          <NavItem key={item.to} {...item} onClick={onNavClick} />
        ))}
      </nav>

      <div className="border-t px-2 py-2 shrink-0">
        <UserSection />
      </div>
    </div>
  );
}

export function AppSidebar() {
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  if (!isAuthenticated) return null;

  return (
    <aside className="hidden md:flex flex-col w-60 border-r bg-background h-screen sticky top-0 shrink-0">
      <SidebarContent />
    </aside>
  );
}

export function MobileHeader() {
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  const [open, setOpen] = useState(false);

  if (!isAuthenticated) return null;

  return (
    <header className="md:hidden flex items-center h-14 px-4 border-b bg-background shrink-0 gap-3">
      <Sheet open={open} onOpenChange={setOpen}>
        <SheetTrigger asChild>
          <Button variant="ghost" size="icon" className="-ml-2">
            <Menu className="size-4" />
          </Button>
        </SheetTrigger>
        <SheetContent side="left" className="w-60 p-0">
          <SidebarContent onNavClick={() => setOpen(false)} />
        </SheetContent>
      </Sheet>

      <div className="flex-1">
        <SidebarBrand />
      </div>
    </header>
  );
}
