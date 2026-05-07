import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { reviews, appointments } from "@/lib/db/schema";
import { eq } from "drizzle-orm";

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const formData = await request.formData();
    
    const ratingStr = formData.get("rating");
    const comment = formData.get("comment") as string;

    if (!ratingStr) {
      return NextResponse.json({ error: "Rating is required" }, { status: 400 });
    }

    const rating = parseInt(ratingStr as string);

    const appointment = await db.query.appointments.findFirst({
      where: eq(appointments.id, id),
    });

    if (!appointment) {
      return NextResponse.json({ error: "Appointment not found" }, { status: 404 });
    }

    // Check if review already exists
    const existingReview = await db.query.reviews.findFirst({
      where: eq(reviews.appointmentId, id),
    });

    if (existingReview) {
      return NextResponse.json({ error: "Review already submitted" }, { status: 400 });
    }

    await db.insert(reviews).values({
      tenantId: appointment.tenantId,
      appointmentId: id,
      rating,
      comment,
    });

    // In a real app, we'd redirect to a success page. 
    // For this prototype, we'll redirect back to the patient dashboard with a toast trigger.
    const url = new URL("/dashboard", request.url);
    url.searchParams.set("review", "success");
    return Response.redirect(url);
  } catch (error) {
    console.error("Error submitting review:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
