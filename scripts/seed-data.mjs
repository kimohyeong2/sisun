import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  "https://iagtkorzyzezpmdjfpye.supabase.co",
  "sb_publishable_QBLmK1tBglqH210T9tDmWA_GgGrJ4LB"
);

async function seed() {
  console.log('Generating extensive mock data...');

  // 1. 대량 학생 데이터
  const studentsData = Array.from({ length: 30 }).map((_, i) => ({
    name: `학생${i + 1}`,
    student_no: `2026${1000 + i}`,
    school: i % 3 === 0 ? 'A중학교' : i % 3 === 1 ? 'B고등학교' : 'C중학교',
    grade: ['중1', '중2', '중3', '고1', '고2', '고3'][i % 6],
    age: 14 + (i % 6),
    enrollment_status: i % 5 === 0 ? 'inactive' : 'active',
  }));

  const { data: students, error: sErr } = await supabase.from('students').insert(studentsData).select();
  if (sErr) console.error('Students error:', sErr);

  // 2. 대량 시험 데이터
  const testsData = [
    { title: '영어 기초 평가', subject: '영어', test_year: 2026, test_month: 3 },
    { title: '수학 심화 평가', subject: '수학', test_year: 2026, test_month: 5 },
    { title: '과학 탐구 평가', subject: '과학', test_year: 2026, test_month: 6 },
    { title: '영어 실전 모의고사', subject: '영어', test_year: 2026, test_month: 8 },
  ];

  const { data: tests, error: tErr } = await supabase.from('tests').insert(testsData).select();
  if (tErr) console.error('Tests error:', tErr);

  // 3. 시험 문항 및 학생 답안 데이터
  if (tests && students) {
    for (const test of tests) {
      // 문항 생성
      const questions = Array.from({ length: 5 }).map((_, i) => ({
        test_id: test.id,
        question_no: i + 1,
        correct_answer: ['A', 'B', 'C', 'D', 'E'][Math.floor(Math.random() * 5)],
        points: (i + 1) * 5,
        category: ['독해', '문법', '어휘', '계산', '암기'][i % 5],
        difficulty: ['상', '중', '하'][i % 3],
      }));

      const { data: insertedQuestions } = await supabase.from('questions').insert(questions).select();

      // 학생 답안 생성 (일부 학생만)
      if (insertedQuestions) {
        const answers = [];
        for (const student of students.slice(0, 10)) { // 10명의 학생만 답안 제출
          for (const q of insertedQuestions) {
            answers.push({
              student_id: student.id,
              question_id: q.id,
              student_answer: ['A', 'B', 'C', 'D', 'E'][Math.floor(Math.random() * 5)],
              is_correct: Math.random() > 0.5,
              earned_points: Math.random() > 0.5 ? q.points : 0,
            });
          }
        }
        await supabase.from('student_answers').insert(answers);
      }
    }
  }

  console.log('Extensive seeding completed.');
}

seed();
