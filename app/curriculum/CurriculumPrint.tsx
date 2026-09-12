import { MONTHS, EXAM_LABELS, buildSpans, type CurriculumTrack } from './TrackRow';

export default function CurriculumPrint({
  tracks,
  subject,
}: {
  tracks: CurriculumTrack[];
  subject: string;
}) {
  return (
    <div className="print-only text-black text-[11px]">
      <div className="flex items-start justify-between border-b-2 border-black pb-3">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">커리큘럼{subject !== '전체' ? ` - ${subject}` : ''}</h1>
          <p className="text-[11px] text-gray-500 mt-1">
            출력일 {new Date().toLocaleDateString('ko-KR', { year: 'numeric', month: 'long', day: 'numeric' })}
          </p>
        </div>
        <div className="flex items-center gap-2">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/sisun.png" alt="시선 로고" width={40} height={40} className="object-contain" />
          <p className="text-base font-bold leading-tight">시선입시학원</p>
        </div>
      </div>

      {tracks.map((track) => {
        const spans = buildSpans(track.assignments);
        return (
          <div key={track.id} className="mt-5 print-avoid-break">
            <div className="flex items-center gap-2 mb-1.5">
              {track.subject && <span className="text-[10px] font-semibold text-gray-500 uppercase">{track.subject}</span>}
              <span
                className="text-white text-xs font-bold px-2.5 py-0.5 rounded-full"
                style={{ backgroundColor: track.color }}
              >
                {track.name}
              </span>
            </div>
            <table className="w-full border-collapse table-fixed">
              <thead>
                <tr>
                  {MONTHS.map((month) => (
                    <th
                      key={month}
                      className="border border-gray-300 p-1 text-center font-semibold bg-gray-50"
                      style={{ width: `${100 / 12}%` }}
                    >
                      {month}월
                      {EXAM_LABELS[month] && <div className="text-[9px] font-normal text-gray-500">{EXAM_LABELS[month]}</div>}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                <tr>
                  {spans.map((span) => (
                    <td
                      key={span.start}
                      colSpan={span.length}
                      className="border border-gray-300 border-t-[3px] p-1.5 align-top whitespace-pre-wrap h-16"
                      style={{ borderTopColor: track.color }}
                    >
                      {span.text || ''}
                    </td>
                  ))}
                </tr>
              </tbody>
            </table>
          </div>
        );
      })}
    </div>
  );
}
