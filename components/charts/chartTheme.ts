// 학원 포인트 컬러(#9c2425)를 1번 슬롯으로 둔 검증된 차트 팔레트.
// dataviz 스킬의 validate_palette.js 로 인접/전체쌍 CVD 분리 및 대비를 검증함.
export const CHART_COLORS = ['#9c2425', '#1baf7a', '#eda100', '#2a78d6'];

export const CHART_GRID = '#ececea';
export const CHART_AXIS = '#a39e98';

export const chartTooltipStyle = {
  contentStyle: {
    background: '#ffffff',
    border: '1px solid #e6e6e6',
    borderRadius: 8,
    boxShadow: '0 4px 18px rgba(0,0,0,0.08)',
    fontSize: 12,
    padding: '8px 12px',
  },
  labelStyle: { color: '#31302e', fontWeight: 600, marginBottom: 2 },
  itemStyle: { color: '#615d59' },
  cursor: { fill: 'rgba(156,36,37,0.05)' },
} as const;

export const axisTickStyle = { fontSize: 12, fill: CHART_AXIS };
