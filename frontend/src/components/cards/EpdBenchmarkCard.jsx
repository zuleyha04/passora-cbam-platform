import { Info } from 'lucide-react'
import { fmtNum } from '../../utils/formatters'

export default function EpdBenchmarkCard({ calculated, benchmark = 2.29, differencePercent }) {
  const isAbove = differencePercent > 0
  return (
    <div className="card">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
        <h3 style={{ fontSize: 13, fontWeight: 700, color: 'var(--color-text-muted)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
          EPD Benchmark Karşılaştırması
        </h3>
        <Info size={15} color="var(--color-text-muted)" />
      </div>
      <div style={{ display: 'flex', gap: 24, marginBottom: 12 }}>
        <div>
          <p style={{ fontSize: 11, color: 'var(--color-text-muted)', marginBottom: 2 }}>Hesaplanan</p>
          <p style={{ fontSize: 20, fontWeight: 700, color: isAbove ? 'var(--color-critical)' : 'var(--color-success)' }}>
            {fmtNum(calculated, 2)} <span style={{ fontSize: 12, fontWeight: 400 }}>tCO₂e/ton</span>
          </p>
        </div>
        <div>
          <p style={{ fontSize: 11, color: 'var(--color-text-muted)', marginBottom: 2 }}>EPD Benchmark</p>
          <p style={{ fontSize: 20, fontWeight: 700, color: 'var(--color-text)' }}>
            {fmtNum(benchmark, 2)} <span style={{ fontSize: 12, fontWeight: 400 }}>tCO₂e/ton</span>
          </p>
        </div>
        <div>
          <p style={{ fontSize: 11, color: 'var(--color-text-muted)', marginBottom: 2 }}>Fark</p>
          <p style={{ fontSize: 20, fontWeight: 700, color: isAbove ? 'var(--color-critical)' : 'var(--color-success)' }}>
            {isAbove ? '+' : ''}{fmtNum(differencePercent, 1)}%
          </p>
        </div>
      </div>
      <div className="alert alert-info" style={{ fontSize: 11 }}>
        EPD benchmark resmi CBAM hesabının yerine geçmez. Bu karşılaştırma karar destek ve ön analiz amaçlıdır.
      </div>
    </div>
  )
}
