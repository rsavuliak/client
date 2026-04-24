import { useState } from "react";
import { useAuthStore } from "@/services/useAuthStore";
import { authService } from "@/services/authService";
import { userService } from "@/services/userService";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import type { PatchUserRequest, UserProfile } from "@/types/User";
import type { AxiosError } from "axios";
import { useNavigate } from "react-router-dom";

function Section({ title, description, children }: { title: string; description?: string; children: React.ReactNode }) {
  return (
    <div className="flex flex-col gap-4">
      <div>
        <h2 className="text-base font-semibold">{title}</h2>
        {description && <p className="text-sm text-muted-foreground">{description}</p>}
      </div>
      {children}
    </div>
  );
}

function ReadOnlyField({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="flex flex-col gap-1.5">
      <Label className="text-muted-foreground">{label}</Label>
      <div className="flex h-9 items-center rounded-md border border-input bg-muted/40 px-3 text-sm text-foreground">
        {value}
      </div>
    </div>
  );
}

export default function SettingsPage() {
  const navigate = useNavigate();
  const profile = useAuthStore((s) => s.profile);
  const user = useAuthStore((s) => s.user);
  const setProfile = useAuthStore((s) => s.setProfile);

  const [displayName, setDisplayName] = useState(profile?.displayName ?? "");
  const [avatarUrl, setAvatarUrl] = useState(profile?.avatarUrl ?? "");
  const [errors, setErrors] = useState<string[]>([]);
  const [serverError, setServerError] = useState("");
  const [saving, setSaving] = useState(false);

  const [deleteConfirm, setDeleteConfirm] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrors([]);
    setServerError("");

    const patch: PatchUserRequest = {};
    const newDisplayName = displayName.trim() === "" ? null : displayName.trim();
    const newAvatarUrl = avatarUrl.trim() === "" ? null : avatarUrl.trim();

    if (newDisplayName !== (profile?.displayName ?? null)) patch.displayName = newDisplayName;
    if (newAvatarUrl !== (profile?.avatarUrl ?? null)) patch.avatarUrl = newAvatarUrl;
    if (Object.keys(patch).length === 0) return;

    const previousProfile = profile;
    const optimistic: UserProfile = {
      ...(profile as UserProfile),
      displayName: "displayName" in patch ? (patch.displayName ?? null) : (profile?.displayName ?? null),
      avatarUrl: "avatarUrl" in patch ? (patch.avatarUrl ?? null) : (profile?.avatarUrl ?? null),
    };
    setProfile(optimistic);
    setSaving(true);

    try {
      const res = await userService.patchMe(patch);
      setProfile(res.data);
    } catch (_err: unknown) {
      if (previousProfile) setProfile(previousProfile);
      const err = _err as AxiosError<{ errors?: string[]; error?: string }>;
      if (err.response?.status === 400 && err.response.data?.errors) {
        setErrors(err.response.data.errors);
      } else {
        setServerError("Something went wrong. Please try again.");
      }
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    setDeleting(true);
    setDeleteError("");
    try {
      await authService.deleteAccount();
      useAuthStore.getState().clearUser();
      navigate("/login");
    } catch {
      setDeleteError("Failed to delete account. Please try again.");
    } finally {
      setDeleting(false);
    }
  };

  const memberSince = profile?.createdAt
    ? new Date(profile.createdAt).toLocaleDateString(undefined, { year: "numeric", month: "long", day: "numeric" })
    : "—";

  const providerLabel: Record<string, string> = {
    google: "Google",
    local: "Email & Password",
  };

  return (
    <div className="flex flex-col gap-8 p-6 max-w-lg">
      <div>
        <h1 className="text-xl font-semibold">Settings</h1>
        <p className="text-sm text-muted-foreground">Manage your account and profile.</p>
      </div>

      <Section title="Profile" description="Your public-facing information.">
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="displayName">Display Name</Label>
            <Input
              id="displayName"
              value={displayName}
              onChange={(e) => setDisplayName(e.target.value)}
              placeholder="Your name"
              maxLength={100}
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <Label htmlFor="avatarUrl">Avatar URL</Label>
            <Input
              id="avatarUrl"
              value={avatarUrl}
              onChange={(e) => setAvatarUrl(e.target.value)}
              placeholder="https://example.com/avatar.jpg"
              maxLength={500}
            />
          </div>

          {errors.length > 0 && (
            <ul className="text-sm text-destructive list-disc list-inside">
              {errors.map((e) => <li key={e}>{e}</li>)}
            </ul>
          )}
          {serverError && <p className="text-sm text-destructive">{serverError}</p>}

          <Button type="submit" disabled={saving} className="self-start">
            {saving ? "Saving…" : "Save changes"}
          </Button>
        </form>
      </Section>

      <Separator />

      <Section title="Account" description="Your account details. These cannot be changed here.">
        <div className="flex flex-col gap-3">
          <ReadOnlyField label="Email" value={user?.email ?? "—"} />
          <ReadOnlyField
            label="Sign-in method"
            value={providerLabel[user?.provider ?? ""] ?? (user?.provider ?? "—")}
          />
          <ReadOnlyField
            label="Email verified"
            value={
              profile?.emailVerified
                ? <span className="text-green-600 font-medium">Verified</span>
                : <span className="text-amber-600 font-medium">Not verified</span>
            }
          />
          <ReadOnlyField label="Member since" value={memberSince} />
        </div>
      </Section>

      <Separator />

      <Section title="Danger Zone">
        <div className="rounded-lg border border-destructive/30 p-4 flex flex-col gap-3">
          <div>
            <p className="text-sm font-medium">Delete account</p>
            <p className="text-sm text-muted-foreground">Permanently delete your account and all associated data. This cannot be undone.</p>
          </div>
          {!deleteConfirm ? (
            <Button variant="destructive" className="self-start" onClick={() => setDeleteConfirm(true)}>
              Delete account
            </Button>
          ) : (
            <div className="flex flex-col gap-2">
              <p className="text-sm font-medium text-destructive">Are you sure? This action is irreversible.</p>
              <div className="flex gap-2">
                <Button variant="destructive" disabled={deleting} onClick={handleDelete}>
                  {deleting ? "Deleting…" : "Yes, delete my account"}
                </Button>
                <Button variant="outline" onClick={() => setDeleteConfirm(false)}>
                  Cancel
                </Button>
              </div>
              {deleteError && <p className="text-sm text-destructive">{deleteError}</p>}
            </div>
          )}
        </div>
      </Section>
    </div>
  );
}
