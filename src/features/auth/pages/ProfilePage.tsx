import { useState, type ReactNode } from "react"
import { PencilIcon } from "lucide-react"
import { Card, CardHeader, CardTitle, CardDescription, CardAction, CardContent } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { useAuthStore } from "@/store/auth.store"
import { usePageTitle } from "@/hooks/usePageTitle"
import type { User } from "@/types/user.types"
import { ProfileForm } from "../components/ProfileForm"
import { ChangeEmailForm } from "../components/ChangeEmailForm"
import { ChangePasswordForm } from "../components/ChangePasswordForm"

// One read-only label/value pair.
function InfoField({ label, value }: { label: string; value: string }) {
  return (
    <div className="grid gap-1">
      <span className="text-xs text-muted-foreground">{label}</span>
      <span className="font-medium">{value || "—"}</span>
    </div>
  )
}

// A card that shows `view` read-only, with an Edit button that swaps in the form.
// `children` is a render-prop that receives a `close` fn to call on save/cancel.
function EditableSection({
  title,
  description,
  view,
  children,
  locked = false,
  lockedMessage,
}: {
  title: string
  description?: string
  view: ReactNode
  children: (close: () => void) => ReactNode
  locked?: boolean
  lockedMessage?: string
}) {
  const [editing, setEditing] = useState(false)
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">{title}</CardTitle>
        {description ? <CardDescription>{description}</CardDescription> : null}
        {!editing && !locked && (
          <CardAction>
            <Button variant="outline" size="sm" onClick={() => setEditing(true)}>
              <PencilIcon /> Edit
            </Button>
          </CardAction>
        )}
      </CardHeader>
      <CardContent className="grid gap-3">
        {editing ? children(() => setEditing(false)) : view}
        {locked && lockedMessage ? (
          <p className="rounded-md bg-muted px-3 py-2 text-sm text-muted-foreground">
            {lockedMessage}
          </p>
        ) : null}
      </CardContent>
    </Card>
  )
}


function ProfileHeader({ user }: { user: User }) {
  return (
    <Card>
      <CardContent className="flex items-center gap-4">
        <Avatar size="lg" className="size-16">
          <AvatarImage src={user.avatar ?? undefined} alt={user.name} />
          <AvatarFallback>{user.name[0]?.toUpperCase() ?? "?"}</AvatarFallback>
        </Avatar>
        <div>
          <h2 className="text-lg font-semibold">{user.name}</h2>
          <p className="text-sm text-muted-foreground">{user.email}</p>
        </div>
      </CardContent>
    </Card>
  )
}

export function ProfilePage() {
  usePageTitle("Profile")
  const user = useAuthStore((s) => s.user)
  if (!user) return null // ProtectedRoute guarantees a user; guard keeps types happy

  const isGoogleUser = Boolean(user.googleId)

  return (
    <div className="mx-auto grid max-w-3xl gap-6 px-4 py-8">
      <h1 className="text-2xl font-semibold">My Profile</h1>

      <ProfileHeader user={user} />

      <EditableSection
        title="Personal information"
        view={
          <div className="grid gap-4 sm:grid-cols-2">
            <InfoField label="Full name" value={user.name} />
            <InfoField label="Referral code" value={user.referralCode ?? "—"} />
            <InfoField label="Status" value={user.isVerified ? "Verified" : "Unverified"} />
          </div>
        }
      >
        {(close) => <ProfileForm onDone={close} />}
      </EditableSection>

      <EditableSection
        title="Email address"
        description="Changing your email requires re-verification"
        view={<InfoField label="Email" value={user.email} />}
        locked={isGoogleUser}
        lockedMessage="You signed up with Google. Your email is managed by your Google account and can't be changed here."
      >
        {(close) => <ChangeEmailForm onDone={close} />}
      </EditableSection>


      <EditableSection
        title="Password"
        description="Use a strong password you don't reuse elsewhere"
        view={<InfoField label="Password" value="••••••••" />}
        locked={isGoogleUser}
        lockedMessage="You signed up with Google, so there's no password to change. Just sign in with Google."
      >
        {(close) => <ChangePasswordForm onDone={close} />}
      </EditableSection>

    </div>
  )
}
