'use server';

import { createClient } from '@/utils/supabase/server';
import { revalidatePath } from 'next/cache';
import { requireTeacherId } from '@/utils/auth-guard';

export async function getQuestionsForTest(test_id: string) {
  await requireTeacherId();
  const supabase = await createClient();
  const { data, error } = await supabase
    .from('questions')
    .select('*')
    .eq('test_id', test_id)
    .order('question_no');

  if (error) {
    console.error('Error fetching questions:', error);
    return [];
  }
  return data || [];
}

export async function upsertQuestions(test_id: string, questions: any[]) {
  await requireTeacherId();
  console.log('Server Action: upsertQuestions called', { test_id, questionsCount: questions.length });
  // FIX: Await the async createClient() function
  const supabase = await createClient();

  // 1. Separate new and existing records
  const toInsert: any[] = [];
  const toUpsert: any[] = [];

  questions.forEach((q, index) => {
    const isNew = typeof q.id === 'string' && q.id.startsWith('new-');

    const data: any = {
      test_id: test_id,
      question_no: index + 1,
      category: q.category || '',
      difficulty: q.difficulty || '',
      correct_answer: q.correct_answer || '',
      points: parseInt(q.points) || 0,
    };

    if (isNew) {
      toInsert.push(data); // No ID for new records
    } else {
      data.id = q.id;
      toUpsert.push(data); // ID included for updates
    }
  });

  console.log('Prepared data for Supabase', { toInsertCount: toInsert.length, toUpsertCount: toUpsert.length });

  // 2. Perform operations
  if (toInsert.length > 0) {
    const { error } = await supabase.from('questions').insert(toInsert);
    if (error) {
      console.error('Error inserting new questions:', error);
      return { error: `문항 추가에 실패했습니다: ${error.message}` };
    }
  }

  if (toUpsert.length > 0) {
    const { error } = await supabase.from('questions').upsert(toUpsert);
    if (error) {
      console.error('Error upserting existing questions:', error);
      return { error: `문항 수정에 실패했습니다: ${error.message}` };
    }
  }

  // 3. Update total_questions count
  const { count, error: countError } = await supabase
    .from('questions')
    .select('id', { count: 'exact', head: true })
    .eq('test_id', test_id);

  if (!countError) {
    await supabase
      .from('tests')
      .update({ total_questions: count || 0 })
      .eq('id', test_id);
  }

  revalidatePath(`/tests/${test_id}`);
  return { success: true };
}

