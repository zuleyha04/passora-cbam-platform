import { useNavigate } from 'react-router-dom'
import PageContainer from '../components/layout/PageContainer'
import { OPERATOR_TASKS } from '../data/companyMockData'

function getStatusClass(status) {
  const value = String(status || '').toLowerCase()

  if (value.includes('bekliyor')) return 'company-status-warning'
  if (value.includes('eksik')) return 'company-status-danger'
  if (value.includes('girildi')) return 'company-status-success'
  if (value.includes('tamam')) return 'company-status-success'

  return 'company-status-neutral'
}

export default function OperatorDashboard() {
  const navigate = useNavigate()

  function handleOpenTask(task) {
    const params = new URLSearchParams()

    params.set('taskId', task.id)
    params.set('product', task.product)
    params.set('category', task.category)
    params.set('unit', task.unit)

    navigate(`/operator/data-entry?${params.toString()}`)
  }

  return (
    <PageContainer title="Görevlerim" subtitle="Size atanmış veri giriş görevleri">
      <div className="operator-hero">
        <div>
          <span>Operasyon Kullanıcısı</span>
          <h2>Atanmış Veri Giriş Görevleri</h2>
          <p>
            Size atanmış üretim, enerji, lojistik veya hammadde verilerini girin.
            Boş bırakılan kritik alanlarda sistem default değer kullanabilir.
          </p>
        </div>
      </div>

      <div className="card operator-task-card">
        <div className="panel-header compact">
          <div>
            <h3 className="section-title">Görev Listesi</h3>
            <p>CBAM hesabı için tamamlanması gereken veri girişleri</p>
          </div>
        </div>

        <div style={{ overflowX: 'auto' }}>
          <table>
            <thead>
              <tr>
                <th>Ürün</th>
                <th>Veri Tipi</th>
                <th>Birim</th>
                <th>Durum</th>
                <th>Son Tarih</th>
                <th>Aksiyon</th>
              </tr>
            </thead>

            <tbody>
              {OPERATOR_TASKS.map((task) => (
                <tr key={task.id}>
                  <td>
                    <strong>{task.product}</strong>
                  </td>

                  <td>{task.category}</td>

                  <td>{task.unit}</td>

                  <td>
                    <span className={`company-status-pill-2 ${getStatusClass(task.status)}`}>
                      {task.status}
                    </span>
                  </td>

                  <td>{task.dueDate}</td>

                  <td>
                    <button
                      type="button"
                      className="btn btn-primary btn-sm"
                      onClick={() => handleOpenTask(task)}
                    >
                      Veri Gir
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </PageContainer>
  )
}