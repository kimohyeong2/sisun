'use server';

import { createClient } from '@/utils/supabase/server';
import { revalidatePath } from 'next/cache';

export async function addStudent(formData: FormData) {
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
  const supabase = await createClient();

  const { error } = await supabase.from('students').delete().eq('id', id);

  if (error) {
    console.error('Error deleting student:', error);
    return { error: `학생 삭제에 실패했습니다: ${error.message}` };
  }

  revalidatePath('/students');
  return { success: true };
}
