'use server';

import { createClient } from '@/utils/supabase/server';
import { revalidatePath } from 'next/cache';
import { requireTeacherId } from '@/utils/auth-guard';

export async function gradeTest(formData: FormData) {
  await requireTeacherId();
  const supabase = await createClient();
  
  const student_id = formData.get('student_id') as string;
  const test_id = formData.get('test_id') as string;
  
  // 1. 해당 시험의 문제들을 가져옴
  const { data: questions } = await supabase
    .from('questions')
    .select('*')
    .eq('test_id', test_id)
    .order('question_no');

  if (!questions) return { error: '문제를 찾을 수 없습니다.' };

  // 2. 답안 채점 및 데이터 생성
  const answersToInsert = questions.map((q) => {
    const studentAnswer = formData.get(`answer_${q.question_no}`) as string;
    const isCorrect = studentAnswer === q.correct_answer;
    return {
      student_id,
      question_id: q.id,
      student_answer: studentAnswer,
      is_correct: isCorrect,
      earned_points: isCorrect ? q.points : 0,
    };
  });

  // 3. 채점 결과 저장 (Bulk Insert)
  const { error } = await supabase
    .from('student_answers')
    .insert(answersToInsert);

  if (error) {
    console.error('Error saving answers:', error);
    return { error: '채점 결과 저장에 실패했습니다.' };
  }

  revalidatePath('/grading');
  return { success: true };
}
