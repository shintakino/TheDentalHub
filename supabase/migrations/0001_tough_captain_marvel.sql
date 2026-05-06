CREATE TABLE "audit_logs" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"tenant_id" text NOT NULL,
	"appointment_id" uuid NOT NULL,
	"user_id" text NOT NULL,
	"action" text NOT NULL,
	"payload" jsonb,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "clinical_notes" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"tenant_id" text NOT NULL,
	"appointment_id" uuid NOT NULL,
	"dentist_id" text NOT NULL,
	"content" text NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "communications_log" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"tenant_id" text NOT NULL,
	"appointment_id" uuid NOT NULL,
	"type" text NOT NULL,
	"recipient" text NOT NULL,
	"subject" text,
	"template_name" text NOT NULL,
	"provider_id" text,
	"status" text NOT NULL,
	"error" text,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "appointments" ALTER COLUMN "status" SET DEFAULT 'confirmed';--> statement-breakpoint
ALTER TABLE "services" ALTER COLUMN "duration" SET DATA TYPE integer;--> statement-breakpoint
ALTER TABLE "appointments" ADD COLUMN "patient_id" text;--> statement-breakpoint
ALTER TABLE "branches" ADD COLUMN "timezone" text DEFAULT 'UTC' NOT NULL;--> statement-breakpoint
ALTER TABLE "branches" ADD COLUMN "operating_hours" jsonb DEFAULT '[]'::jsonb NOT NULL;--> statement-breakpoint
ALTER TABLE "branches" ADD COLUMN "latitude" numeric(10, 7);--> statement-breakpoint
ALTER TABLE "branches" ADD COLUMN "longitude" numeric(10, 7);--> statement-breakpoint
ALTER TABLE "branches" ADD COLUMN "next_slots" jsonb DEFAULT '[]'::jsonb NOT NULL;--> statement-breakpoint
ALTER TABLE "branches" ADD COLUMN "availability_updated_at" timestamp;--> statement-breakpoint
ALTER TABLE "branches" ADD COLUMN "rating" numeric(2, 1) DEFAULT '4.5';--> statement-breakpoint
ALTER TABLE "clinics" ADD COLUMN "logo_url" text;--> statement-breakpoint
ALTER TABLE "clinics" ADD COLUMN "primary_color" text DEFAULT '#0047FF';--> statement-breakpoint
ALTER TABLE "clinics" ADD COLUMN "secondary_color" text;--> statement-breakpoint
ALTER TABLE "clinics" ADD COLUMN "subdomain" text;--> statement-breakpoint
ALTER TABLE "clinics" ADD COLUMN "seo_title" text;--> statement-breakpoint
ALTER TABLE "clinics" ADD COLUMN "seo_description" text;--> statement-breakpoint
ALTER TABLE "staff" ADD COLUMN "target_daily_hours" integer DEFAULT 8 NOT NULL;--> statement-breakpoint
ALTER TABLE "audit_logs" ADD CONSTRAINT "audit_logs_tenant_id_clinics_tenant_id_fk" FOREIGN KEY ("tenant_id") REFERENCES "public"."clinics"("tenant_id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "audit_logs" ADD CONSTRAINT "audit_logs_appointment_id_appointments_id_fk" FOREIGN KEY ("appointment_id") REFERENCES "public"."appointments"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "clinical_notes" ADD CONSTRAINT "clinical_notes_tenant_id_clinics_tenant_id_fk" FOREIGN KEY ("tenant_id") REFERENCES "public"."clinics"("tenant_id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "clinical_notes" ADD CONSTRAINT "clinical_notes_appointment_id_appointments_id_fk" FOREIGN KEY ("appointment_id") REFERENCES "public"."appointments"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "communications_log" ADD CONSTRAINT "communications_log_tenant_id_clinics_tenant_id_fk" FOREIGN KEY ("tenant_id") REFERENCES "public"."clinics"("tenant_id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "communications_log" ADD CONSTRAINT "communications_log_appointment_id_appointments_id_fk" FOREIGN KEY ("appointment_id") REFERENCES "public"."appointments"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "clinics" ADD CONSTRAINT "clinics_subdomain_unique" UNIQUE("subdomain");