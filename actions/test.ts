'use server';

import { createClient } from '@/utils/supabase/server';
import { revalidatePath } from 'next/cache';
import { requireTeacherId } from '@/utils/auth-guard';

export async function getTests() {
  await requireTeacherId();
  const supabase = await createClient();
  const { data, error } = await supabase.from('tests').select('*').order('created_at', { ascending: false });
  if (error) {
    console.error('Error fetching tests:', error);
    return [];
  }
  return data || [];
}

export async function getTestDetailData(test_id: string) {
  await requireTeacherId();
  const supabase = await createClient();

  const { data: test } = await supabase.from('tests').select('*').eq('id', test_id).single();
  const { data: questions } = await supabase.from('questions').select('*').eq('test_id', test_id).order('question_no');

  const { data: answers } = await supabase
    .from('student_answers')
    .select(`is_correct, questions!inner(question_no)`)
    .eq('questions.test_id', test_id);

  const accuracyStats: Record<number, number> = {};
  if (answers) {
    const stats = answers.reduce((acc: any, curr: any) => {
      const qNo = curr.questions.question_no;
      if (!acc[qNo]) acc[qNo] = { total: 0, correct: 0 };
      acc[qNo].total += 1;
      if (curr.is_correct) acc[qNo].correct += 1;
      return acc;
    }, {});

    Object.keys(stats).forEach((qNo: any) => {
      accuracyStats[qNo] = Math.round((stats[qNo].correct / stats[qNo].total) * 100);
    });
  }

  return { test: test || null, questions: questions || [], accuracyStats };
}

export async function addTest(formData: FormData) {
  await requireTeacherId();
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
  await requireTeacherId();
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
  await requireTeacherId();
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
