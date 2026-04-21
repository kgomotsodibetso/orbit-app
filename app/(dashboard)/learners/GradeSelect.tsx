'use client';

const GRADES = ['R', '1', '2', '3', '4', '5', '6', '7', '8', '9', '10', '11', '12'];

export default function GradeSelect({ defaultValue }: { defaultValue?: string }) {
  return (
    <select
      name="grade"
      defaultValue={defaultValue ?? ''}
      onChange={(e) => e.currentTarget.form?.requestSubmit()}
      className="px-3 py-2.5 rounded-xl border border-slate/20 bg-white text-sm text-slate focus:outline-none focus:ring-2 focus:ring-steel"
    >
      <option value="">All grades</option>
      {GRADES.map((g) => (
        <option key={g} value={g}>Grade {g}</option>
      ))}
    </select>
  );
}
