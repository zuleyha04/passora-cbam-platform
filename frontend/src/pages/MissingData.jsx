import { useState, useEffect } from 'react'
import PageContainer from '../components/layout/PageContainer'
import MissingDataTable from '../components/tables/MissingDataTable'
import { checkMissingData } from '../api/cbamApi'
import { DEMO_CALCULATION_INPUT } from '../utils/mockData'

function ScoreGauge({ score, interpretation }) {
  const color = score >= 85 ? '#16A34A' : score >= 65 ? '#D97706' : score >= 40 ? '#EA580C' : '#DC2626'
  const interp = { good: 'İyi', needs_review: 'Gözden Geçirilmeli', weak: 'Zayıf', insufficient: 'Yetersiz' }

  return (
    <div className="card" style={{ textAlign: 'center' }}>
      <p style={{ fontSize: 12, fontWeight: 600, color: 'var(--color-text-muted)', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: 12 }}>
        Veri Kalite Skoru
      </p>
      <div style={{ position: 'relative', width: 120, height: 120, margin: '0 auto 12px' }}>
        <svg viewBox="0 0 120 120" width="120" height="120">
          <circle cx="60" cy="60" r="50" fill="none" stroke="#E2E8F0" strokeWidth="12" />
          <circle
            cx="60" cy="60" r="50" fill="none" stroke={color} strokeWidth="12"
            strokeDasharray={`${(score / 100) * 314} 314`}
            strokeLinecap="round"
            transform="rotate(-90 60 60)"
          />
        </svg>
        <div style={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
          <span style={{ fontSize: 26, fontWeight: 800, color }}>{score}</span>
          <span style={{ fontSize: 11, color: 'var(--color-text-muted)' }}>/100</span>
        </div>
      </div>
      <p style={{ fontWeight: 700, fontSize: 14, color }}>{interp[interpretation] || interpretation}</p>
    </div>
  )
}

export default function MissingData() {
  const [result, setResult] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    checkMissingData({
      company_name: DEMO_CALCULATION_INPUT.company_name,
      product_name: DEMO_CALCULATION_INPUT.product_name,
      cn_code: DEMO_CALCULATION_INPUT.cn_code,
      production_amount_ton: DEMO_CALCULATION_INPUT.production_amount_ton,
      reporting_period: DEMO_CALCULATION_INPUT.reporting_period,
      fuels: DEMO_CALCULATION_INPUT.fuels,
      electricity: DEMO_CALCULATION_INPUT.electricity,
      precursors: DEMO_CALCULATION_INPUT.precursors,
      transport: DEMO_CALCULATION_INPUT.transport,
    })
      .then(setResult)
      .catch(console.error)
      .finally(() => setLoading(false))
  }, [])

  return (
    <PageContainer title="Eksik Veri Analizi" subtitle="Veri kalite skoru ve eksik/yetersiz alanların özeti">
      <p style={{ fontSize: 13, color: 'var(--color-text-muted)', marginBottom: 20 }}>
        Sistem, mevcut girilen verileri analiz ederek eksik veya yetersiz alanları listeler ve veri kalite skoru hesaplar.
        Yüksek skor daha güvenilir CBAM hesaplamalarına işaret eder.
      </p>

      {loading && <p style={{ color: 'var(--color-text-muted)', fontSize: 13 }}>Analiz yapılıyor...</p>}

      {result && (
        <div>
          <div className="grid-3" style={{ marginBottom: 24 }}>
            <ScoreGauge score={result.data_quality_score} interpretation={result.score_interpretation} />
            <div className="card">
              <p style={{ fontSize: 12, fontWeight: 600, color: 'var(--color-text-muted)', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: 12 }}>Eksik Alan Özeti</p>
              {['critical', 'high', 'medium', 'recommendation'].map(sev => {
                const items = result.items.filter(i => i.severity === sev)
                if (items.length === 0) return null
                const colors = { critical: '#DC2626', high: '#EA580C', medium: '#D97706', recommendation: '#3B82F6' }
                const labels = { critical: 'Kritik', high: 'Yüksek', medium: 'Orta', recommendation: 'Öneri' }
                return (
                  <div key={sev} style={{ display: 'flex', justifyContent: 'space-between', padding: '6px 0', borderBottom: '1px solid var(--color-border)' }}>
                    <span style={{ fontSize: 13, color: colors[sev], fontWeight: 600 }}>{labels[sev]}</span>
                    <span style={{ fontSize: 13, fontWeight: 700 }}>{items.length} alan</span>
                  </div>
                )
              })}
            </div>
            <div className="card">
              <p style={{ fontSize: 12, fontWeight: 600, color: 'var(--color-text-muted)', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: 12 }}>Puan Etkisi</p>
              {[
                ['Kritik eksik (-25 puan)', '#DC2626'],
                ['Yüksek eksik (-15 puan)', '#EA580C'],
                ['Orta eksik (-8 puan)', '#D97706'],
                ['Öneri (-3 puan)', '#3B82F6'],
              ].map(([label, color]) => (
                <p key={label} style={{ fontSize: 12, color, marginBottom: 4 }}>• {label}</p>
              ))}
            </div>
          </div>

          <div className="card">
            <h3 style={{ fontSize: 14, fontWeight: 700, marginBottom: 16 }}>Eksik / Yetersiz Alanlar</h3>
            <MissingDataTable items={result.items} />
          </div>
        </div>
      )}
    </PageContainer>
  )
}
