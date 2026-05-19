import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://lrvlaguyankuoknckbze.supabase.co';
const supabaseAnonKey = 'sb_publishable_rP-tPNEbuk8-p6wHoE3roQ_GpZLStp-';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
