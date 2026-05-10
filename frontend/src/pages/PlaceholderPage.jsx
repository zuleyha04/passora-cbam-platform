import PageContainer from '../components/layout/PageContainer'

export default function PlaceholderPage({ title, subtitle }) {
  return (
    <PageContainer title={title} subtitle={subtitle || 'Bu bölüm demo kapsamında hazırlanacaktır.'}>
      <div className="card">
        <p style={{ color: '#64748B' }}>
          Bu sayfa için temel rol yapısı oluşturuldu. İçerik bir sonraki adımda detaylandırılabilir.
        </p>
      </div>
    </PageContainer>
  )
}