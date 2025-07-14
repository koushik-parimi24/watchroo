
import { createClient } from '@supabase/supabase-js';

const suparbaseUrl = import.meta.env.VITE_SUPABASE_URL;
const suparbaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;


export const supabase = createClient(suparbaseUrl, suparbaseAnonKey);