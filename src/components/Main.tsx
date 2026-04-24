import { Link } from "react-router-dom";
import { CheckSquare, Link2 } from "lucide-react";
import { useAuthStore } from "@/services/useAuthStore";

const apps = [
  {
    title: "Todo List",
    description: "Track tasks and stay organized.",
    icon: CheckSquare,
    href: "/todo",
  },
  {
    title: "URL Shortener",
    description: "Shorten and manage your links.",
    icon: Link2,
    href: "/url-shortener",
  },
];

const Main = () => {
  const profile = useAuthStore((s) => s.profile);
  const user = useAuthStore((s) => s.user);

  const name = profile?.displayName ?? user?.email ?? "there";

  return (
    <div className="flex flex-col gap-8 p-6">
      <div>
        <h1 className="text-xl font-semibold">Welcome back, {name}</h1>
        <p className="text-sm text-muted-foreground">Pick an app to get started.</p>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {apps.map(({ title, description, icon: Icon, href }) => (
          <Link
            key={href}
            to={href}
            className="group flex flex-col gap-3 rounded-xl border border-border bg-card p-5 shadow-sm transition-shadow hover:shadow-md"
          >
            <div className="flex size-10 items-center justify-center rounded-lg bg-muted text-muted-foreground group-hover:bg-primary group-hover:text-primary-foreground transition-colors">
              <Icon className="size-5" />
            </div>
            <div>
              <p className="font-medium text-sm">{title}</p>
              <p className="text-xs text-muted-foreground mt-0.5">{description}</p>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
};

export default Main;
