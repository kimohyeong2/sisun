'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Dialog } from '@/components/ui/Dialog';
import { Edit2 } from 'lucide-react';
import { addStudent, updateStudent } from './actions';

const GRADE_AGE_MAP: Record<string, number> = {
  '중1': 14, '중2': 15, '중3': 16,
  '고1': 17, '고2': 18, '고3': 19
};
const GRADES = Object.keys(GRADE_AGE_MAP);

export default function StudentForm({ 
  onAdd, 
  initialData 
}: { 
  onAdd: () => void, 
  initialData?: any 
}) {
  const [isOpen, setIsOpen] = useState(false);
  const [grade, setGrade] = useState<string>(initialData?.grade || GRADES[0]);

  const age = GRADE_AGE_MAP[grade];

  async function handleSubmit(formData: FormData) {
    formData.append('age', age.toString());
    
    let result;
    if (initialData) {
      result = await updateStudent(initialData.id, formData);
    } else {
      result = await addStudent(formData);
    }

    if (result.success) {
      setIsOpen(false);
      onAdd();
    } else {
      alert(result.error);
    }
  }

  return (
    <>
      {initialData ? (
        <Button variant="outline" className="h-9 px-3 rounded-[8px] hover:bg-notion-canvas-soft border-notion-hairline text-xs font-medium text-notion-ink" onClick={() => setIsOpen(true)}>
          수정
        </Button>
      ) : (
        <Button type="button" onClick={() => setIsOpen(true)} className="rounded-[8px] h-9 px-4">학생 추가</Button>
      )}
      <Dialog isOpen={isOpen} onClose={() => setIsOpen(false)} title={initialData ? "학생 정보 수정" : "새 학생 등록"}>
        <form action={handleSubmit} className="space-y-4">
          <Input name="name" defaultValue={initialData?.name} placeholder="이름" required />
          <Input name="school" defaultValue={initialData?.school} placeholder="학교" />

          <div className="space-y-1">
            <label className="text-sm font-medium text-slate-700">학년</label>
            <select name="grade" value={grade} onChange={(e) => setGrade(e.target.value)} className="w-full rounded-lg border border-slate-300 p-2 text-sm">
              {GRADES.map(g => <option key={g} value={g}>{g}</option>)}
            </select>
          </div>

          <div className="space-y-1">
            <label className="text-sm font-medium text-slate-700">나이</label>
            <Input name="age" type="number" value={age} readOnly className="bg-slate-100" />
          </div>

          <div className="space-y-1">
            <label className="text-sm font-medium text-slate-700">재원 상태</label>
            <div className="flex gap-4">
              <label className="flex items-center gap-2 text-sm">
                <input type="radio" name="enrollment_status" value="active" defaultChecked={initialData?.enrollment_status !== 'inactive'} /> 재원 중
              </label>
              <label className="flex items-center gap-2 text-sm">
                <input type="radio" name="enrollment_status" value="inactive" defaultChecked={initialData?.enrollment_status === 'inactive'} /> 미등원/휴원
              </label>
            </div>
          </div>

          <div className="flex justify-end gap-2">
            <Button variant="outline" type="button" onClick={() => setIsOpen(false)}>취소</Button>
            <Button type="submit">{initialData ? "수정" : "등록"}</Button>
          </div>
        </form>
      </Dialog>
    </>
  );
}
