import { db } from "@/lib/db";
import { appointments, clinics } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import { notFound } from "next/navigation";
import { Star } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";

export default async function ReviewPage({
  params,
  searchParams,
}: {
  params: Promise<{ appointmentId: string }>;
  searchParams: Promise<{ rating?: string }>;
}) {
  const { appointmentId } = await params;
  const { rating } = await searchParams;

  const appointment = await db.query.appointments.findFirst({
    where: eq(appointments.id, appointmentId),
  });

  if (!appointment) notFound();

  const clinic = await db.query.clinics.findFirst({
    where: eq(clinics.tenantId, appointment.tenantId),
  });

  const initialRating = rating ? parseInt(rating) : 0;

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-4">
      <div className="w-full max-w-md bg-white rounded-2xl shadow-xl p-8 space-y-8">
        <div className="text-center space-y-2">
          {clinic?.logoUrl && (
            <img src={clinic.logoUrl} alt={clinic.name} className="h-12 mx-auto mb-4" />
          )}
          <h1 className="text-2xl font-bold font-heading text-slate-900">
            How was your visit?
          </h1>
          <p className="text-slate-500">
            Your feedback helps <strong>{clinic?.name}</strong> improve their care.
          </p>
        </div>

        <form className="space-y-6" action={`/api/appointments/${appointmentId}/review`} method="POST">
          <div className="flex justify-center gap-2">
            {[1, 2, 3, 4, 5].map((star) => (
              <label key={star} className="cursor-pointer group">
                <input
                  type="radio"
                  name="rating"
                  value={star}
                  defaultChecked={star === initialRating}
                  className="sr-only"
                  required
                />
                <Star
                  className={`h-10 w-10 transition-colors ${
                    star <= initialRating
                      ? "fill-yellow-400 text-yellow-400"
                      : "text-slate-200 group-hover:text-slate-300"
                  }`}
                />
              </label>
            ))}
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-slate-700">
              Any specific comments? (Optional)
            </label>
            <Textarea
              name="comment"
              placeholder="Tell us what you liked or what we could do better..."
              className="min-h-[120px] resize-none"
            />
          </div>

          <Button type="submit" className="w-full h-12 text-lg font-medium bg-indigo-600 hover:bg-indigo-700">
            Submit Review
          </Button>
        </form>

        <p className="text-center text-[10px] text-slate-400 uppercase tracking-widest">
          Thank you for your time
        </p>
      </div>
    </div>
  );
}
