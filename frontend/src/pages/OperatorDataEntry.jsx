import { useMemo, useState } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import PageContainer from '../components/layout/PageContainer'

const DEFAULT_VALUES = {
  'Elektrik Tüketimi': {
    value: '550',
    unit: 'MWh',
    warning:
      'Elektrik tüketimi boş bırakılırsa varsayılan elektrik tüketimi kullanılacaktır. Bu durum karbon emisyonunu yüksek gösterebilir.',
  },
  'Nakliye Mesafesi': {
    value: '500',
    unit: 'km',
    warning:
      'Nakliye mesafesi boş bırakılırsa varsayılan mesafe kullanılacaktır. Bu durum lojistik emisyonunu artırabilir.',
  },
  'Doğal Gaz Tüketimi': {
    value: '15000',
    unit: 'Sm³',
    warning:
      'Doğal gaz tüketimi boş bırakılırsa varsayılan yakıt tüketimi kullanılacaktır. Bu durum toplam emisyonu artırabilir.',
  },
  'Hammadde Miktarı': {
    value: '1000',
    unit: 'ton',
    warning:
      'Hammadde miktarı boş bırakılırsa ürün miktarına yakın varsayılan değer kullanılacaktır.',
  },
  'Tedarikçi EF': {
    value: '2.1',
    unit: 'tCO₂e/ton',
    warning:
      'Tedarikçi emisyon faktörü boş bırakılırsa varsayılan emisyon faktörü kullanılacaktır. Bu durum ürün emisyonunu yüksek gösterebilir.',
  },
  default: {
    value: '100',
    unit: '',
    warning:
      'Bu alan boş bırakılırsa sistem varsayılan değer kullanacaktır. Varsayılan değer veri kalite skorunu düşürebilir.',
  },
}

function getDefaultConfig(category) {
  return DEFAULT_VALUES[category] || DEFAULT_VALUES.default
}

function getQualityScore(value, usedDefault, evidenceFile) {
  if (usedDefault && !evidenceFile) return 55
  if (usedDefault && evidenceFile) return 60
  if (!value) return 45
  if (evidenceFile) return 95
  return 90
}

function formatFileSize(size) {
  if (!size) return '0 MB'
  return `${(size / 1024 / 1024).toFixed(2)} MB`
}

export default function OperatorDataEntry() {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()

  const taskId = searchParams.get('taskId') || `task-${Date.now()}`
  const product = searchParams.get('product') || 'Çelik Profil'
  const category = searchParams.get('category') || 'Elektrik Tüketimi'
  const unitFromQuery = searchParams.get('unit')

  const defaultConfig = useMemo(() => getDefaultConfig(category), [category])
  const unit = unitFromQuery || defaultConfig.unit

  const [value, setValue] = useState('')
  const [note, setNote] = useState('')
  const [evidenceFile, setEvidenceFile] = useState(null)
  const [fileError, setFileError] = useState('')

  const isEmpty = value === '' || value === null || value === undefined
  const previewValue = isEmpty ? defaultConfig.value : value
  const usedDefault = isEmpty
  const qualityScore = getQualityScore(value, usedDefault, evidenceFile)

  function handleFileChange(e) {
    const file = e.target.files?.[0]

    if (!file) {
      setEvidenceFile(null)
      setFileError('')
      return
    }

    if (file.type !== 'application/pdf') {
      setEvidenceFile(null)
      setFileError('Sadece PDF dosyası yükleyebilirsiniz.')
      e.target.value = ''
      return
    }

    const maxSizeMb = 10
    const maxSizeByte = maxSizeMb * 1024 * 1024

    if (file.size > maxSizeByte) {
      setEvidenceFile(null)
      setFileError(`PDF dosyası en fazla ${maxSizeMb} MB olabilir.`)
      e.target.value = ''
      return
    }

    setEvidenceFile(file)
    setFileError('')
  }

  function handleSubmit(e) {
    e.preventDefault()

    const finalValue = isEmpty ? defaultConfig.value : value

    const submittedTask = {
      id: `submitted-${Date.now()}`,
      taskId,
      product,
      category,
      value: finalValue,
      unit,
      usedDefault,
      qualityScore,
      note,
      evidenceName: evidenceFile?.name || '',
      evidenceType: evidenceFile?.type || '',
      evidenceSize: evidenceFile?.size || 0,
      submittedAt: new Date().toISOString(),
      status: 'Girildi',
    }

    const previous = JSON.parse(
      localStorage.getItem('passora_operator_submissions') || '[]'
    )

    localStorage.setItem(
      'passora_operator_submissions',
      JSON.stringify([submittedTask, ...previous])
    )

    navigate('/operator?submitted=1')
  }

  return (
    <PageContainer
      title="Veri Girişi"
      subtitle="Size atanmış veri alanını doldurun ve firma admininin onayına gönderin"
    >
      <div className="operator-entry-hero">
        <div>
          <span>Veri Giriş Görevi</span>
          <h2>{category}</h2>
          <p>
            Ürün: <strong>{product}</strong> · Birim:{' '}
            <strong>{unit}</strong>
          </p>
        </div>

        <div
          className={`operator-entry-mode ${
            usedDefault ? 'warning' : 'success'
          }`}
        >
          <small>Veri Durumu</small>
          <strong>{usedDefault ? 'Default Kullanılacak' : 'Gerçek Veri'}</strong>
          <p>
            {usedDefault
              ? 'Veri kalite skoru düşebilir'
              : 'Veri manuel girildi'}
          </p>
        </div>
      </div>

      {usedDefault && (
        <div className="operator-default-warning">
          <strong>⚠ Eksik veri uyarısı</strong>
          <p>
            {defaultConfig.warning} Gönderim yapılırsa bu görev{' '}
            <strong>
              {defaultConfig.value} {unit}
            </strong>{' '}
            default değeriyle kaydedilecektir.
          </p>
        </div>
      )}

      <div className="operator-entry-layout">
        <div className="card operator-entry-form-card">
          <div className="panel-header compact">
            <div>
              <h3 className="section-title">Veri Alanı</h3>
              <p>
                Gerçek değeri girin. Boş bırakırsanız default değer uygulanır.
              </p>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="operator-entry-form">
            <div className="form-group">
              <label>
                {category} ({unit})
              </label>
              <input
                type="number"
                value={value}
                onChange={(e) => setValue(e.target.value)}
                placeholder={`Boşsa default kullanılır: ${defaultConfig.value} ${unit}`}
              />
            </div>

            <div className="form-group">
              <label>Açıklama / Not</label>
              <textarea
                value={note}
                onChange={(e) => setNote(e.target.value)}
                placeholder="Örn. Sayaç okuması üretim vardiyası sonunda alınmıştır."
                rows={4}
              />
            </div>

            <div className="form-group">
              <label>Belge / Kanıt PDF</label>

              <input
                type="file"
                accept="application/pdf,.pdf"
                onChange={handleFileChange}
              />

              <small className="file-help-text">
                Sayaç okuması, fatura, sevk irsaliyesi veya tedarikçi EPD
                belgesi gibi PDF kanıt dosyası yükleyebilirsiniz.
              </small>

              {fileError && <div className="file-error-text">{fileError}</div>}

              {evidenceFile && (
                <div className="selected-file-box">
                  <strong>{evidenceFile.name}</strong>
                  <span>{formatFileSize(evidenceFile.size)}</span>
                </div>
              )}
            </div>

            <div className="operator-entry-actions">
              <button type="submit" className="btn btn-primary">
                Veriyi Gönder
              </button>

              <button
                type="button"
                className="btn btn-outline"
                onClick={() => navigate('/operator')}
              >
                Vazgeç
              </button>
            </div>
          </form>
        </div>

        <aside className="operator-entry-summary">
          <span>Gönderim Önizlemesi</span>

          <div className="operator-preview-value">
            {previewValue} {unit}
          </div>

          <div className="operator-summary-row">
            <p>Ürün</p>
            <strong>{product}</strong>
          </div>

          <div className="operator-summary-row">
            <p>Veri Tipi</p>
            <strong>{category}</strong>
          </div>

          <div className="operator-summary-row">
            <p>Veri Kaynağı</p>
            <strong>{usedDefault ? 'Default' : 'Manuel Giriş'}</strong>
          </div>

          <div className="operator-summary-row">
            <p>Veri Kalitesi</p>
            <strong>{qualityScore} / 100</strong>
          </div>

          <div className="operator-summary-row">
            <p>Kanıt Belgesi</p>
            <strong>{evidenceFile ? evidenceFile.name : 'Yüklenmedi'}</strong>
          </div>

          <div
            className={
              usedDefault ? 'operator-impact warning' : 'operator-impact success'
            }
          >
            {usedDefault
              ? 'Default değer kullanımı toplam emisyonu artırabilir.'
              : 'Gerçek veri kullanımı hesaplama güvenilirliğini artırır.'}
          </div>
        </aside>
      </div>
    </PageContainer>
  )
}