export default function PatientDashboard() {
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">My Appointments</h1>
          <p className="text-muted-foreground">Manage your upcoming and past dental visits.</p>
        </div>
      </div>
      <div className="grid gap-6">
        {/* Appointments will go here */}
        <div className="text-center py-12 border rounded-lg bg-white">
          <p className="text-muted-foreground">Loading your appointments...</p>
        </div>
      </div>
    </div>
  );
}
