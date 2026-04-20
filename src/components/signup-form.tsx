import { useState } from "react";
import { authService } from "@/services/authService";
import { GoogleLoginButton } from "@/components/GoogleLoginButton";
import { useNavigate } from "react-router-dom";
import { useAuthStore } from "@/services/useAuthStore";
import type { AxiosError } from "axios";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  Field,
  FieldDescription,
  FieldGroup,
  FieldLabel,
  FieldSeparator,
} from "@/components/ui/field";
import { Input } from "@/components/ui/input";

export function SignupForm({
  className,
  ...props
}: React.ComponentProps<"form">) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const navigate = useNavigate();

  const handleRegistration = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setIsSubmitting(true);

    try {
      await authService.register({ email, password });
      const response = await authService.me();
      useAuthStore.getState().setUser(response.data);
      navigate("/");
    } catch (_err: unknown) {
      const err = _err as AxiosError<{ message?: string }>;
      useAuthStore.getState().clearUser();
      setError(err.response?.data?.message || "Registration failed");
    } finally {
      useAuthStore.getState().finishLoading();
      setIsSubmitting(false);
    }
  };

  return (
    <div className="grid min-h-svh lg:grid-cols-1">
      <div className="flex flex-col gap-4 p-6 md:p-10">
        <div className="flex flex-1 items-center justify-center">
          <div className="w-full max-w-xs">
            <form className={cn("flex flex-col gap-6", className)} {...props}>
              <FieldGroup>
                <div className="flex flex-col items-center gap-1 text-center">
                  <h1 className="text-2xl font-bold">Create your account</h1>
                  <p className="text-muted-foreground text-sm text-balance">
                    Enter your email below to create your account
                  </p>
                </div>
                <Field>
                  <FieldLabel htmlFor="email">Email</FieldLabel>
                  <Input
                    id="email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="m@example.com"
                    required
                  />
                </Field>
                <Field>
                  <div className="flex items-center">
                    <FieldLabel htmlFor="password">Password</FieldLabel>
                  </div>
                  <Input
                    id="password"
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                  />
                </Field>
                <Field>
                  <Button type="submit" onClick={handleRegistration} disabled={isSubmitting}>
                    {isSubmitting ? "Creating account…" : "Create Account"}
                  </Button>
                </Field>
                <FieldSeparator>Or continue with</FieldSeparator>
                <Field>
                  {error && <p className="text-sm text-destructive">{error}</p>}
                  <GoogleLoginButton>Sign up with Google</GoogleLoginButton>
                  <FieldDescription className="text-center">
                    Already have an account?{" "}
                    <a href="login" className="underline underline-offset-4">
                      Sign in
                    </a>
                  </FieldDescription>
                </Field>
              </FieldGroup>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
