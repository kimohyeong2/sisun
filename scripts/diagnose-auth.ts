import { createClient } from '../utils/supabase/server';

async function diagnose() {
  const supabase = await createClient();
  const { data, error } = await supabase.from('teachers').select('id, pw');
  
  if (error) {
    console.error('Error fetching teachers:', error);
    return;
  }
  
  console.log('Teachers data:', JSON.stringify(data, null, 2));
}

diagnose();
