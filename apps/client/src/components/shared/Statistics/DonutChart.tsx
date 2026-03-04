// ─── Donut chart ─────────────────────────────────────────────────────────────

interface DonutChartProps {
  percent: number
  size?: number
  stroke?: number
}

const DonutChart = ({ percent, size = 76, stroke = 9 }: DonutChartProps) => {
  const r = (size - stroke) / 2
  const circ = 2 * Math.PI * r
  const dash = (Math.min(100, Math.max(0, percent)) / 100) * circ

  return (
    <svg
      width={size}
      height={size}
      viewBox={`0 0 ${size} ${size}`}
      style={{ transform: 'rotate(-90deg)' }}
    >
      <circle
        cx={size / 2}
        cy={size / 2}
        r={r}
        fill='none'
        stroke='currentColor'
        className='text-white'
        strokeWidth={stroke}
      />
      <circle
        cx={size / 2}
        cy={size / 2}
        r={r}
        fill='none'
        stroke='currentColor'
        className='text-accent-teal-dark'
        strokeWidth={stroke}
        strokeDasharray={`${dash} ${circ - dash}`}
        strokeLinecap='round'
      />
    </svg>
  )
}

export default DonutChart
