"use client";

import * as React from "react";
import { Bot, Command, SquareTerminal } from "lucide-react";
import { useAuthStore } from "@/services/useAuthStore";
import { useNavigate, useLocation } from "react-router-dom";

import { NavMain } from "@/components/nav-main";
import { NavUser } from "@/components/nav-user";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";
import { Button } from "./ui/button";

const data = {
  user: {
    name: "shadcn",
    email: "m@example.com",
    avatar: "/avatars/shadcn.jpg",
  },
  navMain: [
    {
      title: "Games",
      url: "#",
      icon: Bot,
      isActive: true,
      items: [
        {
          title: "Game 1",
          url: "#",
        },
        {
          title: "Game 2",
          url: "#",
        },
        {
          title: "Game 3",
          url: "#",
        },
      ],
    },
    {
      title: "Apps",
      url: "#",
      icon: SquareTerminal,
      items: [
        {
          title: "Todo List",
          url: "#",
        },
        {
          title: "URL Shortener",
          url: "#",
        },
        {
          title: "App 3",
          url: "#",
        },
      ],
    },
  ],
};

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  const navigate = useNavigate();

  const location = useLocation();
  const hideAuthButtons =
    location.pathname === "/login" || location.pathname === "/signup";
  console.log(location.pathname);
  const onLogin = () => {
    navigate("/login");
  };
  const onSignup = () => {
    navigate("/signup");
  };

  return (
    <Sidebar variant="inset" {...props}>
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton size="lg" asChild>
              <a href="#">
                <div className="bg-sidebar-primary text-sidebar-primary-foreground flex aspect-square size-8 items-center justify-center rounded-lg">
                  <Command className="size-4" />
                </div>
                <div className="grid flex-1 text-left text-sm leading-tight">
                  <span className="truncate font-medium">Dibrova</span>
                </div>
              </a>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>
      <SidebarContent>
        <NavMain items={data.navMain} />
      </SidebarContent>
      <SidebarFooter>
        {!hideAuthButtons && (
          <>
            {!useAuthStore.getState().isAuthenticated && (
              <Button onClick={onLogin}>Login</Button>
            )}
            {!useAuthStore.getState().isAuthenticated && (
              <Button onClick={onSignup}>Sign up</Button>
            )}
          </>
        )}
        {useAuthStore.getState().isAuthenticated && (
          <NavUser user={data.user} />
        )}
      </SidebarFooter>
    </Sidebar>
  );
}
