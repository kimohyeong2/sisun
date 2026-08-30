'use server';

import { createClient } from '@/utils/supabase/server';
import { revalidatePath } from 'next/cache';

export async function addTest(formData: FormData) {
  const supabase = await createClient();
  
  const title = formData.get('title') as string;
  const subject = formData.get('subject') as string;
  const test_year = parseInt(formData.get('test_year') as string);
  const test_month = parseInt(formData.get('test_month') as string);

  const { error } = await supabase.from('tests').insert({ 
    title, 
    subject,
    test_year,
    test_month
  });

  if (error) {
    console.error('Error adding test:', error);
    return { error: '시험지 생성에 실패했습니다.' };
  }

  revalidatePath('/tests');
  return { success: true };
}

export async function deleteTest(testId: string) {
  const supabase = await createClient();
  const { error } = await supabase.from('tests').delete().eq('id', testId);
  if (error) {
    console.error('Error deleting test:', error);
    return { error: `삭제 실패: ${error.message} (코드: ${error.code})` };
  }
  revalidatePath('/tests');
  return { success: true };
}

export async function updateTest(testId: string, formData: FormData) {
  const supabase = await createClient();
  
  const title = formData.get('title') as string;
  const subject = formData.get('subject') as string;
  const test_year = parseInt(formData.get('test_year') as string);
  const test_month = parseInt(formData.get('test_month') as string);

  const { error } = await supabase.from('tests').update({ 
    title, 
    subject,
    test_year,
    test_month
  }).eq('id', testId);

  if (error) {
    console.error('Error updating test:', error);
    return { error: '수정 실패' };
  }
  
  revalidatePath('/tests');
  revalidatePath(`/tests/${testId}`);
  return { success: true };
}
