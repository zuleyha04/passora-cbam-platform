import { useMemo } from 'react'
import TurkeyMap from 'react-turkey-map'

const RISK_COLORS = {
  kritik: '#DC2626',
  critical: '#DC2626',

  yüksek: '#EA580C',
  yuksek: '#EA580C',
  high: '#EA580C',

  orta: '#D97706',
  medium: '#D97706',

  düşük: '#16A34A',
  dusuk: '#16A34A',
  low: '#16A34A',
}

const CITY_TO_PLATE = {
  zonguldak: '67',
  trabzon: '61',
  hatay: '31',
  istanbul: '34',
  ankara: '06',
  izmir: '35',
  kocaeli: '41',
  karabuk: '78',
}

function normalizeText(value) {
  return String(value || '')
    .toLocaleLowerCase('tr-TR')
    .replace(/ı/g, 'i')
    .replace(/ğ/g, 'g')
    .replace(/ü/g, 'u')
    .replace(/ş/g, 's')
    .replace(/ö/g, 'o')
    .replace(/ç/g, 'c')
    .trim()
}

function formatEmission(value) {
  if (value == null) return '-'
  return Number(value).toLocaleString('tr-TR')
}

function getRiskColor(risk) {
  return RISK_COLORS[normalizeText(risk)] || '#D97706'
}

function getProvinceName(city) {
  const normalized = normalizeText(city)

  if (normalized === 'eregli') return 'Zonguldak'
  if (normalized === 'iskenderun') return 'Hatay'

  return city
}

export default function TurkeyEmissionMap({ mapData = [] }) {
  const preparedData = useMemo(() => {
    return mapData.map((item) => {
      const rawCity = item.city || item.name || item.label
      const province = getProvinceName(rawCity)
      const provinceKey = normalizeText(province)
      const plate = CITY_TO_PLATE[provinceKey]

      return {
        ...item,
        rawCity,
        province,
        plate,
        label: item.label || rawCity,
        emission: item.emission ?? item.value ?? 0,
        risk: item.risk || 'orta',
      }
    })
  }, [mapData])

  const colorData = useMemo(() => {
    const colors = {}

    preparedData.forEach((item) => {
      if (!item.plate) return
      colors[item.plate] = getRiskColor(item.risk)
    })

    return colors
  }, [preparedData])

  const tooltipData = useMemo(() => {
    const tooltips = {}

    preparedData.forEach((item) => {
      if (!item.plate) return

      tooltips[item.plate] = `${item.label} | ${formatEmission(
        item.emission
      )} tCO₂e | ${item.risk}`
    })

    return tooltips
  }, [preparedData])

  return (
    <div className="turkey-emission-card">
      <div className="turkey-emission-header">
        <div>
          <p className="turkey-emission-title">Türkiye Emisyon Haritası</p>
          <p className="turkey-emission-subtitle">
            Karbon emisyon verisi olan iller risk seviyesine göre renklendirilir
          </p>
        </div>

        <div className="turkey-emission-legend">
          <div>
            <span className="legend-dot critical" /> Kritik
          </div>
          <div>
            <span className="legend-dot high" /> Yüksek
          </div>
          <div>
            <span className="legend-dot medium" /> Orta
          </div>
          <div>
            <span className="legend-dot low" /> Düşük
          </div>
        </div>
      </div>

      <div className="turkey-emission-map-area">
        <div className="turkey-emission-map">
          <TurkeyMap
            showTooltip
            colorData={colorData}
            tooltipData={tooltipData}
          />
        </div>
      </div>

      <div className="turkey-emission-summary">
        {preparedData.map((item, index) => (
          <div key={`${item.label}-${index}`} className="turkey-emission-chip">
            <span
              className="chip-dot"
              style={{ background: getRiskColor(item.risk) }}
            />

            <div>
              <strong>{item.label}</strong>
              <span>{formatEmission(item.emission)} tCO₂e</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}