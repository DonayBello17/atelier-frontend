import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://zztuddopobgxwizwohzn.supabase.co'
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inp6dHVkZG9wb2JneHdpendvaHpuIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzQ0NzYxNjksImV4cCI6MjA5MDA1MjE2OX0.--EUhtUjrG5z-Y42JqlHeECdb7beMh1BA_hrHg9_O18'

export const supabase = createClient(supabaseUrl, supabaseKey)