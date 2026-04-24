import { useState, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { authService } from "@/services/authService";
import type { AxiosError } from "axios";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  Field,
  FieldDescription,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field";
import { Input } from "@/components/ui/input";

export function ResetPasswordForm({
  className,
  ...props
}: React.ComponentProps<"form">) {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const token = searchParams.get("token");

  const [newPassword, setNewPassword] = useState("");
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [expired, setExpired] = useState(false);

  useEffect(() => {
    if (!token) navigate("/forgot-password", { replace: true });
  }, [token, navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setIsSubmitting(true);

    try {
      await authService.resetPassword(token!, newPassword);
      navigate("/login", {
        state: { notice: "Password updated. You can now log in." },
        replace: true,
      });
    } catch (_err: unknown) {
      const err = _err as AxiosError<{ errors?: string[]; message?: string }>;
      if (err.response?.status === 401) {
        setExpired(true);
      } else if (err.response?.status === 400) {
        const msgs = err.response.data?.errors;
        setError(msgs?.length ? msgs[0] : "Password must be at least 8 characters.");
      } else {
        setError("Something went wrong. Please try again.");
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!token) return null;

  return (
    <div className="grid min-h-svh lg:grid-cols-1">
      <div className="flex flex-col gap-4 p-6 md:p-10">
        <div className="flex flex-1 items-center justify-center">
          <div className="w-full max-w-xs">
            <form
              className={cn("flex flex-col gap-6", className)}
              onSubmit={handleSubmit}
              {...props}
            >
              <FieldGroup>
                <div className="flex flex-col items-center gap-1 text-center">
                  <h1 className="text-2xl font-bold">Set new password</h1>
                  <p className="text-muted-foreground text-sm text-balance">
                    Choose a new password for your account.
                  </p>
                </div>

                {expired ? (
                  <div className="flex flex-col gap-3 text-center text-sm">
                    <p className="text-destructive">
                      This link is invalid or has expired.
                    </p>
                    <a
                      href="/forgot-password"
                      className="underline underline-offset-4 text-muted-foreground hover:text-foreground"
                    >
                      Request a new reset link
                    </a>
                  </div>
                ) : (
                  <>
                    <Field>
                      <FieldLabel htmlFor="newPassword">New password</FieldLabel>
                      <Input
                        id="newPassword"
                        type="password"
                        value={newPassword}
                        onChange={(e) => setNewPassword(e.target.value)}
                        placeholder="At least 8 characters"
                        minLength={8}
                        required
                      />
                    </Field>
                    <Field>
                      {error && <p className="text-sm text-destructive">{error}</p>}
                      <Button type="submit" disabled={isSubmitting}>
                        {isSubmitting ? "Updating…" : "Update password"}
                      </Button>
                    </Field>
                  </>
                )}

                <FieldDescription className="text-center">
                  <a href="/login" className="underline underline-offset-4">
                    Back to login
                  </a>
                </FieldDescription>
              </FieldGroup>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
