export default async function BookingPage({ params }: { params: Promise<{ tenantSlug: string }> }) {
  const { tenantSlug } = await params;
  return (
    <div className="max-w-2xl mx-auto space-y-8">
      <div className="text-center space-y-2">
        <h1 className="text-4xl font-serif font-bold tracking-tight">Schedule Your Visit</h1>
        <p className="text-muted-foreground">Select a service and find a time that works for you.</p>
      </div>
      
      <div className="grid gap-6">
        <div className="p-6 rounded-2xl border bg-card shadow-sm hover:shadow-md transition-shadow">
          <div className="flex justify-between items-start">
            <div>
              <h3 className="text-xl font-semibold">General Consultation</h3>
              <p className="text-muted-foreground">Routine check-up and cleaning</p>
            </div>
            <span className="font-mono text-sm px-3 py-1 rounded-full bg-brand-secondary text-brand-primary">
              30 min
            </span>
          </div>
          <button className="w-full mt-6 bg-brand-primary text-white py-3 rounded-xl font-semibold hover:opacity-90 transition-opacity">
            View Availability
          </button>
        </div>
      </div>
    </div>
  );
}
