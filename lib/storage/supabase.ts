import { createClient } from "@supabase/supabase-js";

// Use service role key if available for server-side operations, fallback to anon key
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

export const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  supabaseKey
);

/**
 * Uploads a clinic logo to Supabase Storage
 * @param tenantId The Clerk organization ID
 * @param file The logo file
 * @returns The public URL of the uploaded logo
 */
export async function uploadClinicLogo(tenantId: string, file: File) {
  const fileExt = file.name.split('.').pop();
  const fileName = `logos/${tenantId}-${Date.now()}.${fileExt}`;
  
  const { data, error } = await supabase.storage
    .from("branding_assets")
    .upload(fileName, file, { 
      upsert: true,
      contentType: file.type
    });

  if (error) {
    console.error("Supabase storage error:", error);
    throw new Error(`Failed to upload logo: ${error.message}`);
  }

  const { data: { publicUrl } } = supabase.storage
    .from("branding_assets")
    .getPublicUrl(data.path);

  return publicUrl;
}
