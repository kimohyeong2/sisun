'use server';

import { createClient } from '@/utils/supabase/server';
import { revalidatePath } from 'next/cache';

export async function gradeAndSaveAnswers(test_id: string, gradingData: { student_id: string, answerString: string }[]) {
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
