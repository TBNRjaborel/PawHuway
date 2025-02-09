import AsyncStorage from '@react-native-async-storage/async-storage';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://vhpzcsquzwkruvewwmxf.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZocHpjc3F1endrcnV2ZXd3bXhmIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzkxMDE0NzYsImV4cCI6MjA1NDY3NzQ3Nn0.9wFPrGfBCIXdW_XR6BDh2Y9UEaVj43X_JWldk8CTo9A';

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    storage: AsyncStorage,
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false,
  },
});
