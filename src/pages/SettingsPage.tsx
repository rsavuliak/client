import { useState } from "react";
import { useAuthStore } from "@/services/useAuthStore";
import { userService } from "@/services/userService";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import type { PatchUserRequest, UserProfile } from "@/types/User";
import type { AxiosError } from "axios";

export default function SettingsPage() {
  const profile = useAuthStore((s) => s.profile);
  const setProfile = useAuthStore((s) => s.setProfile);

  const [displayName, setDisplayName] = useState(profile?.displayName ?? "");
  const [avatarUrl, setAvatarUrl] = useState(profile?.avatarUrl ?? "");
  const [errors, setErrors] = useState<string[]>([]);
  const [serverError, setServerError] = useState("");
  const [saving, setSaving] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrors([]);
    setServerError("");

    const patch: PatchUserRequest = {};

    const newDisplayName = displayName.trim() === "" ? null : displayName.trim();
    const newAvatarUrl = avatarUrl.trim() === "" ? null : avatarUrl.trim();

    if (newDisplayName !== (profile?.displayName ?? null)) {
      patch.displayName = newDisplayName;
    }
    if (newAvatarUrl !== (profile?.avatarUrl ?? null)) {
      patch.avatarUrl = newAvatarUrl;
    }

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

  return (
    <div className="flex flex-col gap-6 p-6 max-w-lg">
      <div>
        <h1 className="text-xl font-semibold">Settings</h1>
        <p className="text-sm text-muted-foreground">Update your profile information.</p>
      </div>

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
        {serverError && (
          <p className="text-sm text-destructive">{serverError}</p>
        )}

        <Button type="submit" disabled={saving} className="self-start">
          {saving ? "Saving…" : "Save changes"}
        </Button>
      </form>
    </div>
  );
}
