
import { createClient } from '@supabase/supabase-js'
const supabaseUrl = 'https://rejpsnftseljbnrhucth.supabase.co'
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJlanBzbmZ0c2VsamJucmh1Y3RoIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTc4NDg5NzgsImV4cCI6MjA3MzQyNDk3OH0.8iqnohd-t8v-sdIXSDuQmW_azIcac89ghsV8-Jqr8mE'
export const supabase = createClient(supabaseUrl, supabaseKey)