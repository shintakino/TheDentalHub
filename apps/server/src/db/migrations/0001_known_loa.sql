CREATE TYPE "public"."user_role" AS ENUM('PATIENT', 'STAFF', 'OWNER', 'SUPER_ADMIN');--> statement-breakpoint
ALTER TABLE "user" ADD COLUMN "role" "user_role" DEFAULT 'PATIENT' NOT NULL;