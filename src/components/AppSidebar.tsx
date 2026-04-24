import { useState } from "react";
import { Link, NavLink, useNavigate } from "react-router-dom";
import {
  Home, ListTodo, Link2, MessageSquare, Settings, LogOut, Menu,
  PanelLeftClose, PanelLeftOpen,
} from "lucide-react";
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
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";

const navItems = [
  { to: "/", label: "Home", icon: Home, end: true },
  { to: "/todo", label: "Todo", icon: ListTodo },
  { to: "/url-shortener", label: "URL Shortener", icon: Link2 },
  { to: "/messenger", label: "Messenger", icon: MessageSquare },
];

function useSidebarCollapsed() {
  const [collapsed, setCollapsed] = useState(
    () => localStorage.getItem("sidebar") === "collapsed"
  );
  const toggle = () => {
    setCollapsed((prev) => {
      const next = !prev;
      localStorage.setItem("sidebar", next ? "collapsed" : "expanded");
      return next;
    });
  };
  return { collapsed, toggle };
}

function NavItem({
  to,
  label,
  icon: Icon,
  end,
  collapsed,
  onClick,
}: {
  to: string;
  label: string;
  icon: typeof Home;
  end?: boolean;
  collapsed: boolean;
  onClick?: () => void;
}) {
  const linkClass = ({ isActive }: { isActive: boolean }) =>
    cn(
      "flex items-center gap-3 rounded-lg text-sm transition-colors",
      collapsed ? "justify-center px-0 py-2 w-full" : "px-3 py-2",
      isActive
        ? "bg-accent text-accent-foreground font-medium"
        : "text-muted-foreground hover:bg-accent/50 hover:text-foreground"
    );

  const link = (
    <NavLink to={to} end={end} onClick={onClick} className={linkClass}>
      <Icon className="size-4 shrink-0" />
      {!collapsed && label}
    </NavLink>
  );

  if (!collapsed) return link;

  return (
    <Tooltip>
      <TooltipTrigger asChild>{link}</TooltipTrigger>
      <TooltipContent side="right" sideOffset={8}>{label}</TooltipContent>
    </Tooltip>
  );
}

function UserSection({ collapsed }: { collapsed: boolean }) {
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

  const trigger = collapsed ? (
    <button className="flex justify-center w-full py-2 rounded-lg hover:bg-accent/50 transition-colors outline-none focus-visible:ring-2 focus-visible:ring-ring">
      <Avatar className="h-7 w-7">
        <AvatarImage src={profile?.avatarUrl ?? undefined} alt={displayName} />
        <AvatarFallback className="text-[11px]">{initials}</AvatarFallback>
      </Avatar>
    </button>
  ) : (
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
  );

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>{trigger}</DropdownMenuTrigger>
      <DropdownMenuContent
        side="top"
        align={collapsed ? "center" : "start"}
        className="w-52 mb-1"
      >
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

function SidebarContent({
  collapsed,
  onToggle,
  onNavClick,
}: {
  collapsed: boolean;
  onToggle?: () => void;
  onNavClick?: () => void;
}) {
  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className={cn(
        "flex items-center h-14 border-b shrink-0",
        collapsed ? "justify-center px-2" : "px-3 gap-2"
      )}>
        {!collapsed && (
          <Link to="/" className="flex items-center gap-2.5 flex-1 min-w-0">
            <div className="flex size-7 items-center justify-center rounded-md bg-primary text-primary-foreground text-xs font-bold shrink-0">
              D
            </div>
            <span className="font-semibold text-sm">Dibrova</span>
          </Link>
        )}
        {onToggle && (
          <Tooltip>
            <TooltipTrigger asChild>
              <button
                onClick={onToggle}
                className="shrink-0 flex items-center justify-center size-7 rounded-md text-muted-foreground hover:text-foreground hover:bg-accent transition-colors"
              >
                {collapsed
                  ? <PanelLeftOpen className="size-4" />
                  : <PanelLeftClose className="size-4" />
                }
              </button>
            </TooltipTrigger>
            <TooltipContent side={collapsed ? "right" : "bottom"} sideOffset={8}>
              {collapsed ? "Expand sidebar" : "Collapse sidebar"}
            </TooltipContent>
          </Tooltip>
        )}
      </div>

      {/* Nav */}
      <nav className={cn(
        "flex-1 py-3 flex flex-col gap-0.5 overflow-y-auto",
        collapsed ? "px-1 items-center" : "px-2"
      )}>
        {navItems.map((item) => (
          <NavItem
            key={item.to}
            {...item}
            collapsed={collapsed}
            onClick={onNavClick}
          />
        ))}
      </nav>

      {/* User */}
      <div className={cn("border-t py-2", collapsed ? "px-1" : "px-2")}>
        <UserSection collapsed={collapsed} />
      </div>
    </div>
  );
}

export function AppSidebar() {
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  const { collapsed, toggle } = useSidebarCollapsed();

  if (!isAuthenticated) return null;

  return (
    <aside
      className={cn(
        "hidden md:flex flex-col border-r bg-background h-screen sticky top-0 shrink-0 overflow-hidden",
        "transition-all duration-200 ease-in-out",
        collapsed ? "w-[56px]" : "w-60"
      )}
    >
      <SidebarContent collapsed={collapsed} onToggle={toggle} />
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
          <SidebarContent
            collapsed={false}
            onNavClick={() => setOpen(false)}
          />
        </SheetContent>
      </Sheet>

      <Link to="/" className="flex items-center gap-2">
        <div className="flex size-6 items-center justify-center rounded bg-primary text-primary-foreground text-xs font-bold">
          D
        </div>
        <span className="font-semibold text-sm">Dibrova</span>
      </Link>
    </header>
  );
}
