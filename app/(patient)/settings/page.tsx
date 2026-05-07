import { UserProfile } from "@clerk/nextjs";

export default function SettingsPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold font-heading">Settings</h1>
        <p className="text-muted-foreground">Manage your account preferences and profile information.</p>
      </div>

      <div className="flex justify-start">
        <UserProfile 
          routing="hash"
          appearance={{
            elements: {
              rootBox: "w-full shadow-none",
              card: "shadow-none border w-full max-w-none bg-card",
              navbar: "hidden md:flex",
              headerTitle: "font-serif text-2xl",
              headerSubtitle: "text-muted-foreground",
            }
          }}
        />
      </div>
    </div>
  );
}
