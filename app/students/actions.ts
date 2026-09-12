'use server';

import { createClient } from '@/utils/supabase/server';
import { revalidatePath } from 'next/cache';
import { requireTeacherId } from '@/utils/auth-guard';

const PAGE_SIZE = 10;

export async function getStudentsForCharts() {
  await requireTeacherId();
  const supabase = await createClient();
  const { data } = await supabase.from('students').select('*');
  return data || [];
}

export async function getStudentsPage(page: number, search: string) {
  await requireTeacherId();
  const supabase = await createClient();

  let query = supabase
    .from('students')
    .select('*', { count: 'exact' })
    .order('created_at', { ascending: false })
    .range((page - 1) * PAGE_SIZE, page * PAGE_SIZE - 1);

  if (search) {
    query = query.ilike('name', `%${search}%`);
  }

  const { data, count } = await query;
  return { data: data || [], count: count || 0 };
}

export async function getStudentsBasic() {
  await requireTeacherId();
  const supabase = await createClient();
  const { data } = await supabase.from('students').select('id, name, grade');
  return data || [];
}

export async function addStudent(formData: FormData) {
  await requireTeacherId();
  const supabase = await createClient();

  const name = formData.get('name') as string;
  const school = formData.get('school') as string || '';
  const grade = formData.get('grade') as string;
  const age = parseInt(formData.get('age') as string);
  const enrollment_status = formData.get('enrollment_status') as string || 'active';

  // Generate student_no server-side: YYYY + 4 random digits
  const currentYear = new Date().getFullYear();
  const randomSuffix = Math.floor(1000 + Math.random() * 9000);
  const student_no = `${currentYear}${randomSuffix}`;

  const { error } = await supabase.from('students').insert({ 
    name, 
    school,
    grade, 
    age, 
    enrollment_status,
    student_no
  });

  if (error) {
    console.error('Error adding student:', error);
    return { error: `학생 추가에 실패했습니다: ${error.message}` };
  }

  revalidatePath('/students');
  return { success: true };
}

export async function updateStudent(id: string, formData: FormData) {
  await requireTeacherId();
  const supabase = await createClient();

  const name = formData.get('name') as string;
  const school = formData.get('school') as string || '';
  const grade = formData.get('grade') as string;
  const age = parseInt(formData.get('age') as string);
  const enrollment_status = formData.get('enrollment_status') as string || 'active';

  const { error } = await supabase.from('students').update({ 
    name, 
    school,
    grade, 
    age, 
    enrollment_status
  }).eq('id', id);

  if (error) {
    console.error('Error updating student:', error);
    return { error: `학생 정보 수정에 실패했습니다: ${error.message}` };
  }

  revalidatePath('/students');
  return { success: true };
}

export async function deleteStudent(id: string) {
  await requireTeacherId();
  const supabase = await createClient();

  const { error } = await supabase.from('students').delete().eq('id', id);

  if (error) {
    console.error('Error deleting student:', error);
    return { error: `학생 삭제에 실패했습니다: ${error.message}` };
  }

  revalidatePath('/students');
  return { success: true };
}
