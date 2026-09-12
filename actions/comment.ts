'use server';

import { createClient } from '@/utils/supabase/server';
import { revalidatePath } from 'next/cache';
import { requireTeacherId } from '@/utils/auth-guard';

export async function saveTeacherComment(studentId: string, comment: string) {
  await requireTeacherId();
  const supabase = await createClient();

  const { error } = await supabase
    .from('students')
    .update({ comments: comment })
    .eq('id', studentId);

  if (error) {
    console.error('Error saving comment:', error);
    return { error: `코멘트 저장에 실패했습니다: ${error.message} (코드: ${error.code})` };
  }

  revalidatePath(`/students/${studentId}/grades`);
  return { success: true };
}
