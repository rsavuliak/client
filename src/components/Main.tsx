import { useAuthStore } from "@/services/useAuthStore";

const Main = () => {
  const user = useAuthStore((s) => s.user);
  if (!user) return <div>Welcome</div>;

  return <div>Welcome {user.email}</div>;
};

export default Main;
