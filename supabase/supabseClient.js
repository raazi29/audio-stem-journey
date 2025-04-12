import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://hupeyekrlkfgfwdmxjzg.supabase.co' // your Supabase project URL
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imh1cGV5ZWtybGtmZ2Z3ZG14anpnIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDQzOTY1NDgsImV4cCI6MjA1OTk3MjU0OH0.Vmld-xkYvnVYbEsKwWMC_G6s1dYvh03oXZuYORUFl40'
export const supabase = createClient(supabaseUrl, supabaseKey)