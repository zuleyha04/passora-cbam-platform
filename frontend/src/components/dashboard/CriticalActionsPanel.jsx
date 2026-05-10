import { useNavigate } from 'react-router-dom'

function getValue(obj, keys, fallback = '') {
  for (const key of keys) {
    if (obj?.[key] !== undefined && obj?.[key] !== null && obj?.[key] !== '') {
      return obj[key]
    }
  }

  return fallback
}

function getActionStyle(type) {
  const value = String(type || '').toLocaleLowerCase('tr-TR')

  if (value.includes('kritik') || value.includes('critical')) {
    return {
      border: '#FCA5A5',
      background: '#FEF2F2',
      dot: '#DC2626',
      badge: '#FEE2E2',
      text: '#B91C1C',
    }
  }

  if (value.includes('eksik')) {
    return {
      border: '#FED7AA',
      background: '#FFF7ED',
      dot: '#EA580C',
      badge: '#FFEDD5',
      text: '#C2410C',
    }
  }

  if (value.includes('karma') || value.includes('hybrid')) {
    return {
      border: '#FDE68A',
      background: '#FFFBEB',
      dot: '#D97706',
      badge: '#FEF3C7',
      text: '#A16207',
    }
  }

  if (value.includes('düşük') || value.includes('veri kalitesi')) {
    return {
      border: '#FED7AA',
      background: '#FFF7ED',
      dot: '#EA580C',
      badge: '#FFEDD5',
      text: '#C2410C',
    }
  }

  return {
    border: '#E2E8F0',
    background: '#F8FAFC',
    dot: '#64748B',
    badge: '#E2E8F0',
    text: '#475569',
  }
}

function getActionTarget(type) {
  const value = String(type || '').toLocaleLowerCase('tr-TR')

  if (value.includes('eksik')) {
    return {
      focus: 'missing-data',
      buttonText: 'Veriyi Tamamlat →',
    }
  }

  if (value.includes('karma') || value.includes('hybrid')) {
    return {
      focus: 'calculation-mode',
      buttonText: 'Veri Talep Et →',
    }
  }

  if (value.includes('düşük') || value.includes('veri kalitesi')) {
    return {
      focus: 'data-quality',
      buttonText: 'Raporu İncele →',
    }
  }

  return {
    focus: 'critical-risk',
    buttonText: 'Raporu İncele →',
  }
}

export default function CriticalActionsPanel({ actions = [] }) {
  const navigate = useNavigate()

  function handleActionClick(action) {
    const company = getValue(action, [
      'company',
      'firma',
      'title',
      'companyName',
      'firmaAdi',
    ])

    const product = getValue(action, ['product', 'urun', 'productName', 'urunAdi'])
    const reportId = getValue(action, ['reportId', 'report_id', 'id'])

    const type = getValue(action, ['type', 'problem', 'badge', 'risk'], 'Uyarı')
    const target = getActionTarget(type)

    const params = new URLSearchParams()

    params.set('focus', target.focus)
    if (company) params.set('company', company)
    if (product) params.set('product', product)
    if (reportId) params.set('reportId', reportId)

    navigate(`/reports?${params.toString()}`)
  }

  return (
    <div className="card">
      <div className="actions-header">
        <h3 className="dashboard-card-title">
          ⚡ Aksiyon Gerektiren Durumlar
        </h3>
        <p className="dashboard-card-subtitle">Hemen ilgilenilmesi gerekenler</p>
      </div>

      <div className="actions-list">
        {actions.map((action, index) => {
          const company = getValue(action, [
            'company',
            'firma',
            'title',
            'companyName',
            'firmaAdi',
          ], '-')

          const type = getValue(action, ['type', 'problem', 'badge', 'risk'], 'Uyarı')

          const description = getValue(action, [
            'description',
            'message',
            'detail',
            'desc',
          ], '')

          const style = getActionStyle(type)
          const target = getActionTarget(type)

          return (
            <div
              key={action.id || `${company}-${type}-${index}`}
              className="action-card"
              style={{
                borderColor: style.border,
                background: style.background,
              }}
            >
              <span
                className="action-dot"
                style={{ background: style.dot }}
              />

              <div className="action-content">
                <div className="action-top">
                  <strong>{company}</strong>

                  <span
                    className="action-badge"
                    style={{
                      background: style.badge,
                      color: style.text,
                    }}
                  >
                    {type}
                  </span>
                </div>

                {description && (
                  <p className="action-description">
                    {description}
                  </p>
                )}

                <button
                  type="button"
                  className="btn btn-sm"
                  style={{
                    background: '#fff',
                    border: `1px solid ${style.dot}`,
                    color: style.text,
                    fontWeight: 700,
                  }}
                  onClick={() => handleActionClick(action)}
                >
                  {target.buttonText}
                </button>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}