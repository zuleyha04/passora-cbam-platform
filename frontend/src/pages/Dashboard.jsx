import { useState, useEffect } from 'react'
import PageContainer from '../components/layout/PageContainer'
import MetricCard from '../components/cards/MetricCard'
import RiskLevelCard from '../components/cards/RiskLevelCard'
import EpdBenchmarkCard from '../components/cards/EpdBenchmarkCard'
import { OffsetEquivalentCard } from '../components/cards/OffsetEquivalentCard'
import { DefaultValueWarningCard } from '../components/cards/OffsetEquivalentCard'
import { EmissionBreakdownChart, BenchmarkComparisonChart, EmissionSourcesBarChart } from '../components/charts/EmissionBreakdownChart'
import ReductionAdvicePanel from '../components/advice/ReductionAdvicePanel'
import { calculateSteel, getReductionAdvice, getOffsetEquivalents } from '../api/cbamApi'
import { DEMO_CALCULATION_INPUT } from '../utils/mockData'
import { fmtNum } from '../utils/formatters'
import { Zap, Activity, TrendingUp, AlertTriangle } from 'lucide-react'

export default function Dashboard() {
  const [result, setResult] = useState(null)
  const [advice, setAdvice] = useState(null)
  const [offset, setOffset] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    loadDemoData()
  }, [])

  async function loadDemoData() {
    setLoading(true)
    setError('')
    try {
      const calc = await calculateSteel(DEMO_CALCULATION_INPUT)
      setResult(calc)

      const [adv, off] = await Promise.all([
        getReductionAdvice({
          fuel_emission_tco2e: calc.breakdown.fuel_emission_tco2e,
          electricity_emission_tco2e: calc.breakdown.electricity_emission_tco2e,
          precursor_emission_tco2e: calc.breakdown.precursor_emission_tco2e,
          transport_emission_tco2e: calc.breakdown.transport_emission_tco2e,
          total_emission_tco2e: calc.breakdown.total_emission_tco2e,
          used_defaults: calc.used_defaults,
          supplier_comparison_note: 'Supplier B seçilirse 561 tCO₂e azaltım sağlanabilir.',
        }),
        getOffsetEquivalents({
          calculated_specific_tco2e_per_ton: calc.breakdown.specific_emission_tco2e_per_ton,
          epd_benchmark_tco2e_per_ton: 2.29,
          production_amount_ton: DEMO_CALCULATION_INPUT.production_amount_ton,
        }),
      ])
      setAdvice(adv)
      setOffset(off)
    } catch (e) {
      setError('Demo veri yüklenirken hata oluştu. Backend çalışıyor mu?')
      console.error(e)
    } finally {
      setLoading(false)
    }
  }

  if (loading) return <PageContainer title="Dashboard"><div style={{ padding: 40, textAlign: 'center', color: 'var(--color-text-muted)' }}>Demo veriler yükleniyor...</div></PageContainer>

  if (error) return <PageContainer title="Dashboard">
    <div className="alert alert-error">{error}</div>
    <button className="btn btn-primary" style={{ marginTop: 16 }} onClick={loadDemoData}>Tekrar Dene</button>
  </PageContainer>

  const bd = result?.breakdown

  return (
    <PageContainer title="Dashboard" subtitle="Örnek Demir Çelik A.Ş. – Steel Profile – 2025-Q1">
      {/* Warnings */}
      {result?.used_defaults && result.default_warnings?.length > 0 && (
        <div style={{ marginBottom: 20 }}>
          <DefaultValueWarningCard warnings={result.default_warnings} />
        </div>
      )}

      <div className="alert alert-info" style={{ marginBottom: 20, fontSize: 12 }}>
        ℹ️ EPD değeri referans/benchmark olarak kullanılmıştır. Nihai CBAM hesaplaması için tesis bazlı üretim, yakıt, elektrik ve precursor verileri gereklidir.
      </div>

      {/* Metric cards */}
      <div className="grid-4" style={{ marginBottom: 20 }}>
        <MetricCard
          label="Toplam Gömülü Emisyon"
          value={fmtNum(bd?.total_emission_tco2e, 0)}
          unit="tCO₂e"
          icon={Zap} color="#EA580C" bg="#FFEDD5"
        />
        <MetricCard
          label="Ürün Başına Emisyon"
          value={fmtNum(bd?.specific_emission_tco2e_per_ton, 2)}
          unit="tCO₂e/ton"
          icon={Activity} color="#3B82F6" bg="#DBEAFE"
        />
        <MetricCard
          label="EPD Benchmark"
          value="2.29"
          unit="tCO₂e/ton"
          sub="Steel Profile EPD-IES-0023407"
        />
        <MetricCard
          label="Benchmark Farkı"
          value={`${result?.difference_percent > 0 ? '+' : ''}${fmtNum(result?.difference_percent, 1)}%`}
          icon={TrendingUp}
          color={result?.difference_percent > 0 ? '#DC2626' : '#16A34A'}
          bg={result?.difference_percent > 0 ? '#FEE2E2' : '#DCFCE7'}
        />
      </div>

      <div className="grid-3" style={{ marginBottom: 20 }}>
        <MetricCard
          label="Veri Kalite Skoru"
          value={result?.data_quality_score}
          unit="/ 100"
          sub={result?.data_quality_score >= 85 ? 'İyi' : result?.data_quality_score >= 65 ? 'Gözden Geçirilmeli' : 'Zayıf'}
        />
        <MetricCard
          label="Hesaplama Modu"
          value={result?.calculation_mode}
          sub="Veri durumuna göre belirlendi"
        />
        <MetricCard
          label="En Büyük Emisyon Kaynağı"
          value={result?.risk_assessment?.largest_emission_source || '–'}
          icon={AlertTriangle} color="#DC2626" bg="#FEE2E2"
        />
      </div>

      {/* Risk card + EPD comparison */}
      <div className="grid-2" style={{ marginBottom: 20 }}>
        <RiskLevelCard
          riskLevel={result?.risk_level}
          differencePercent={result?.difference_percent}
          largestSource={result?.risk_assessment?.largest_emission_source}
          firstAction={result?.risk_assessment?.recommended_first_action}
          summary={result?.risk_assessment?.summary}
        />
        <EpdBenchmarkCard
          calculated={bd?.specific_emission_tco2e_per_ton}
          benchmark={2.29}
          differencePercent={result?.difference_percent}
        />
      </div>

      {/* Charts */}
      <div className="grid-3" style={{ marginBottom: 20 }}>
        <EmissionBreakdownChart breakdown={bd} />
        <BenchmarkComparisonChart calculated={bd?.specific_emission_tco2e_per_ton} benchmark={2.29} />
        <EmissionSourcesBarChart breakdown={bd} />
      </div>

      {/* Offset */}
      {offset && (
        <div style={{ marginBottom: 20 }}>
          <OffsetEquivalentCard data={offset} />
        </div>
      )}

      {/* Advice */}
      {advice && (
        <div className="card">
          <ReductionAdvicePanel adviceList={advice.advice_list} usedDefaultsNote={advice.used_defaults_note} />
        </div>
      )}
    </PageContainer>
  )
}
