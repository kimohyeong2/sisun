'use server';

import { createClient } from '@/utils/supabase/server';
import { revalidatePath } from 'next/cache';
import { requireTeacherId } from '@/utils/auth-guard';

export async function getExistingAnswers(test_id: string): Promise<Record<string, string>> {
  await requireTeacherId();
  const supabase = await createClient();

  const { data: questions } = await supabase
    .from('questions')
    .select('id, question_no')
    .eq('test_id', test_id)
    .order('question_no');

  if (!questions || questions.length === 0) return {};

  const { data: answersData } = await supabase
    .from('student_answers')
    .select('student_id, question_id, student_answer')
    .in('question_id', questions.map((q) => q.id));

  if (!answersData) return {};

  const byStudent: Record<string, string[]> = {};
  answersData.forEach((ans) => {
    const q = questions.find((q) => q.id === ans.question_id);
    if (!q) return;
    if (!byStudent[ans.student_id]) byStudent[ans.student_id] = [];
    byStudent[ans.student_id][q.question_no - 1] = ans.student_answer || '';
  });

  const formatted: Record<string, string> = {};
  Object.entries(byStudent).forEach(([sid, ansArr]) => {
    formatted[sid] = ansArr.join(' ');
  });
  return formatted;
}

export async function gradeAndSaveAnswers(test_id: string, gradingData: { student_id: string, answerString: string }[]) {
  await requireTeacherId();
  const supabase = await createClient();

  // 1. Get questions for this test
  const { data: questions, error: qError } = await supabase
    .from('questions')
    .select('id, question_no, correct_answer, points')
    .eq('test_id', test_id)
    .order('question_no');

  if (qError || !questions) {
    return { error: '문항 정보를 불러오는데 실패했습니다.' };
  }

  // 2. Grade and prepare answers
  const answersToInsert = [];
  
  for (const studentData of gradingData) {
    const studentAnswers = studentData.answerString.split(' ').filter(a => a !== '');
    
    for (const question of questions) {
      const studentAnswer = studentAnswers[question.question_no - 1];
      if (studentAnswer === undefined) continue;

      const isCorrect = studentAnswer.trim() === question.correct_answer.trim();
      const earnedPoints = isCorrect ? question.points : 0;

      answersToInsert.push({
        student_id: studentData.student_id,
        question_id: question.id,
        student_answer: studentAnswer,
        is_correct: isCorrect,
        earned_points: earnedPoints
      });
    }
  }

  // 3. Upsert to DB
  const { error } = await supabase
    .from('student_answers')
    .upsert(answersToInsert, { onConflict: 'student_id,question_id' });

  if (error) {
    console.error('Error grading:', error);
    return { error: `채점 결과 저장에 실패했습니다: ${error.message} (코드: ${error.code})` };
  }

  revalidatePath(`/tests/${test_id}`);
  return { success: true };
}
