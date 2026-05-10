import PageContainer from '../components/layout/PageContainer'
import { COMPANY_DATA_TASKS } from '../data/companyMockData'

export default function CompanyDataTasks() {
  return (
    <PageContainer title="Veri Giriş Durumu" subtitle="Firma içi veri giriş görevlerinin takibi">
      <div className="card">
        <table>
          <thead>
            <tr>
              <th>Ürün</th>
              <th>Veri Kategorisi</th>
              <th>Sorumlu Kullanıcı</th>
              <th>Durum</th>
              <th>Son Tarih</th>
              <th>Veri Kalitesi</th>
            </tr>
          </thead>
          <tbody>
            {COMPANY_DATA_TASKS.map((task) => (
              <tr key={task.id}>
                <td>{task.product}</td>
                <td>{task.category}</td>
                <td>{task.responsible}</td>
                <td>{task.status}</td>
                <td>{task.dueDate}</td>
                <td>{task.quality}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </PageContainer>
  )
}