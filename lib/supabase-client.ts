import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

export async function uploadListingPhoto(file: File): Promise<string> {
  const ext = file.name.split('.').pop();
  const fileName = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}.${ext}`;
  const { error } = await supabase.storage.from('listing-photos').upload(fileName, file);
  if (error) throw error;
  const { data } = supabase.storage.from('listing-photos').getPublicUrl(fileName);
  return data.publicUrl;
}

export async function uploadPastPaperFile(file: File): Promise<string> {
  const ext = file.name.split('.').pop();
  const fileName = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}.${ext}`;
  const { error } = await supabase.storage.from('past-papers').upload(fileName, file);
  if (error) throw error;
  const { data } = supabase.storage.from('past-papers').getPublicUrl(fileName);
  return data.publicUrl;
}
