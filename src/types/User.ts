export type User = {
  id: string
  email: string
  provider: string
}

export type UserProfile = {
  id: string
  displayName: string | null
  avatarUrl: string | null
  settings: Record<string, unknown>
  balance: string
  emailVerified: boolean
  createdAt: string
}

export type PatchUserRequest = {
  displayName?: string | null
  avatarUrl?: string | null
  settings?: Record<string, unknown>
}