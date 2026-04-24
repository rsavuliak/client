import { useState } from "react";
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

export function ForgotPasswordForm({
  className,
  ...props
}: React.ComponentProps<"form">) {
  const [email, setEmail] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setIsSubmitting(true);

    try {
      await authService.forgotPassword(email);
      setSubmitted(true);
    } catch (_err: unknown) {
      const err = _err as AxiosError<{ message?: string }>;
      if (err.response?.status === 429) {
        setError("Please wait before requesting another reset.");
      } else if (err.response?.status === 400) {
        setError("Please enter a valid email address.");
      } else {
        setError("Something went wrong. Please try again.");
      }
    } finally {
      setIsSubmitting(false);
    }
  };

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
                  <h1 className="text-2xl font-bold">Reset your password</h1>
                  <p className="text-muted-foreground text-sm text-balance">
                    Enter your email and we'll send you a reset link.
                  </p>
                </div>

                {submitted ? (
                  <div className="rounded-lg border border-border bg-muted/40 px-4 py-3 text-sm text-center text-muted-foreground">
                    If that email is registered, you'll receive a link shortly.
                    Check your inbox (and spam folder).
                  </div>
                ) : (
                  <>
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
                      {error && <p className="text-sm text-destructive">{error}</p>}
                      <Button type="submit" disabled={isSubmitting}>
                        {isSubmitting ? "Sending…" : "Send reset link"}
                      </Button>
                    </Field>
                  </>
                )}

                <FieldDescription className="text-center">
                  Remembered it?{" "}
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
