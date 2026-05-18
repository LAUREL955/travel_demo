import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://gyzweqkiyugjhcjabstu.supabase.co';
const supabaseKey = 'sb_publishable_C-OWBiwzomT2N53H-hNKOg_iww--XDu';

export const supabase = createClient(supabaseUrl, supabaseKey);
