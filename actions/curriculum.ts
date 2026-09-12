'use server';

import { createClient } from '@/utils/supabase/server';
import { revalidatePath } from 'next/cache';
import { requireTeacherId } from '@/utils/auth-guard';

export async function getCurriculumTracks() {
  await requireTeacherId();
  const supabase = await createClient();

  const { data: tracks, error: tracksError } = await supabase
    .from('curriculum_tracks')
    .select('*')
    .order('sort_order');

  if (tracksError) {
    console.error('Error fetching curriculum tracks:', tracksError);
    return [];
  }

  const { data: items, error: itemsError } = await supabase
    .from('curriculum_items')
    .select('*');

  if (itemsError) {
    console.error('Error fetching curriculum items:', itemsError);
  }

  return (tracks || []).map((track) => {
    const byMonth = new Map((items || []).filter((i) => i.track_id === track.id).map((i) => [i.month, i.assignment as string]));
    return {
      ...track,
      assignments: Array.from({ length: 12 }, (_, i) => byMonth.get(i + 1) || ''),
    };
  });
}

export async function addTrack(formData: FormData) {
  await requireTeacherId();
  const supabase = await createClient();

  const name = formData.get('name') as string;
  const subject = formData.get('subject') as string;
  const color = formData.get('color') as string;

  const { count } = await supabase
    .from('curriculum_tracks')
    .select('id', { count: 'exact', head: true });

  const { error } = await supabase.from('curriculum_tracks').insert({
    name,
    subject,
    color,
    sort_order: count || 0,
  });

  if (error) {
    console.error('Error adding curriculum track:', error);
    return { error: '트랙 생성에 실패했습니다.' };
  }

  revalidatePath('/curriculum');
  return { success: true };
}

export async function updateTrack(trackId: string, formData: FormData) {
  await requireTeacherId();
  const supabase = await createClient();

  const name = formData.get('name') as string;
  const subject = formData.get('subject') as string;
  const color = formData.get('color') as string;

  const { error } = await supabase
    .from('curriculum_tracks')
    .update({ name, subject, color })
    .eq('id', trackId);

  if (error) {
    console.error('Error updating curriculum track:', error);
    return { error: '트랙 수정에 실패했습니다.' };
  }

  revalidatePath('/curriculum');
  return { success: true };
}

export async function deleteTrack(trackId: string) {
  await requireTeacherId();
  const supabase = await createClient();

  const { error } = await supabase.from('curriculum_tracks').delete().eq('id', trackId);

  if (error) {
    console.error('Error deleting curriculum track:', error);
    return { error: '트랙 삭제에 실패했습니다.' };
  }

  revalidatePath('/curriculum');
  return { success: true };
}

export async function saveMonthlyAssignments(trackId: string, assignments: string[]) {
  await requireTeacherId();
  const supabase = await createClient();

  const rows = assignments.map((assignment, index) => ({
    track_id: trackId,
    month: index + 1,
    assignment: assignment || '',
  }));

  const { error } = await supabase
    .from('curriculum_items')
    .upsert(rows, { onConflict: 'track_id,month' });

  if (error) {
    console.error('Error saving curriculum items:', error);
    return { error: '저장에 실패했습니다.' };
  }

  revalidatePath('/curriculum');
  return { success: true };
}
