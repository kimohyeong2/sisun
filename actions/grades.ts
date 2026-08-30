'use server';

import { createClient } from '@/utils/supabase/server';

export async function getStudentGrades(studentId: string) {
  const supabase = await createClient();

  // 1. Fetch student info
  const { data: student } = await supabase.from('students').select('name, comments').eq('id', studentId).single();

  // 2. Fetch test results with joins
  const { data: results } = await supabase
    .from('student_answers')
    .select(`
      earned_points,
      question:questions(
        id,
        test_id,
        points,
        category,
        test:tests(id, title, subject, test_year, test_month)
      )
    `)
    .eq('student_id', studentId);

  // 3. Process results for dashboard
  const tests = new Map();
  
  results?.forEach(row => {
    const test = row.question?.test;
    if (!test) return;
    
    const key = `${test.test_year}-${test.test_month}-${test.title}`;
    if (!tests.has(key)) {
      tests.set(key, {
        id: test.id,
        title: test.title,
        subject: test.subject,
        date: `${test.test_year}.${test.test_month}`,
        score: 0,
        total: 0,
        categories: {}
      });
    }
    
    const t = tests.get(key);
    t.score += row.earned_points || 0;
    t.total += row.question?.points || 0;
    
    const cat = row.question?.category || '기타';
    if (!t.categories[cat]) t.categories[cat] = { name: cat, points: 0, totalPoints: 0 };
    t.categories[cat].points += row.earned_points || 0;
    t.categories[cat].totalPoints += row.question?.points || 0;
  });

  const formattedTests = Array.from(tests.values()).map(t => ({
    ...t,
    categories: Object.values(t.categories)
  }));

  return {
    studentName: student?.name,
    studentComments: student?.comments,
    tests: formattedTests.sort((a, b) => a.date.localeCompare(b.date))
  };
}
