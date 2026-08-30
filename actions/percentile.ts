'use server';

import { createClient } from '@/utils/supabase/server';

export async function getStudentPercentile(testId: string, targetStudentId: string) {
  const supabase = await createClient();

  // 1. 해당 시험(testId)에 대한 모든 학생의 획득 점수 조회
  const { data, error } = await supabase
    .from('student_answers')
    .select(`
      student_id,
      earned_points,
      questions!inner(test_id)
    `)
    .eq('questions.test_id', testId);

  if (error || !data) {
    console.error('점수 조회 실패:', error);
    return null;
  }

  // 2. 학생별 총점 합산 (reduce 활용)
  const scoresByUser: Record<string, number> = data.reduce((acc: Record<string, number>, curr: any) => {
    acc[curr.student_id] = (acc[curr.student_id] || 0) + curr.earned_points;
    return acc;
  }, {});

  // 3. 총점 기준 내림차순 정렬
  const sortedScores = Object.entries(scoresByUser)
    .map(([studentId, totalScore]) => ({ studentId, totalScore }))
    .sort((a, b) => b.totalScore - a.totalScore);

  // 4. 상위 0% 기준 백분위 계산
  const totalStudents = sortedScores.length;
  const rankedData = sortedScores.map((student, index) => {
    // 백분위 공식: 현재 인덱스 / (전체 인원 - 1) * 100
    // 1등(index 0)은 0%, 꼴등은 100%
    const percentile = totalStudents > 1 
      ? (index / (totalStudents - 1)) * 100 
      : 0; // 응시자가 1명일 경우 예외 처리

    return {
      ...student,
      rank: index + 1,
      percentile: Math.round(percentile * 10) / 10, // 소수점 첫째 자리 반올림
    };
  });

  // 5. 특정 학생(d)의 결과만 필터링하여 반환
  return rankedData.find(s => s.studentId === targetStudentId);
}
