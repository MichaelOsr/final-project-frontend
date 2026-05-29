import type { ReactNode } from "react"
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card"
import { usePageTitle } from "@/hooks/usePageTitle"
import { ProfileForm } from "../components/ProfileForm"
import { ChangeEmailForm } from "../components/ChangeEmailForm"
import { ChangePasswordForm } from "../components/ChangePasswordForm"

function Section({ title, description, children }: { title: string; description: string; children: ReactNode }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">{title}</CardTitle>
        <CardDescription>{description}</CardDescription>
      </CardHeader>
      <CardContent>{children}</CardContent>
    </Card>
  )
}

export function ProfilePage() {
  usePageTitle("Profile")
  return (
    <div className="mx-auto grid max-w-xl gap-6">
      <h1 className="text-2xl font-semibold">Your profile</h1>
      <Section title="Personal information" description="Update your name and photo">
        <ProfileForm />
      </Section>
      <Section title="Email address" description="Changing your email requires re-verification">
        <ChangeEmailForm />
      </Section>
      <Section title="Password" description="Use a strong password you don't reuse elsewhere">
        <ChangePasswordForm />
      </Section>
    </div>
  )
}
