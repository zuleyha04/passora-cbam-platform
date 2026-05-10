export const CURRENT_COMPANY = {
  id: 'c1',
  name: 'Örnek Demir Çelik A.Ş.',
  sector: 'Demir-Çelik',
  subSector: 'Entegre Demir-Çelik',
  city: 'Zonguldak',
  country: 'Türkiye',
  adminName: 'Ayşe Yılmaz',
  adminEmail: 'ayse@ornekdemir.com',
  cbamStatus: 'Veri Toplanıyor',
  readinessScore: 72,
}

export const COMPANY_PRODUCTS = [
  {
    id: 'p1',
    name: 'Çelik Profil',
    cnCode: '7216',
    productionAmount: 1000,
    totalEmission: 3725,
    specificEmission: 3.72,
    dataQuality: 82,
    risk: 'Kritik',
    status: 'Onay Bekliyor',
  },
  {
    id: 'p2',
    name: 'İnşaat Demiri',
    cnCode: '7214',
    productionAmount: 800,
    totalEmission: 1984,
    specificEmission: 2.48,
    dataQuality: 71,
    risk: 'Orta',
    status: 'Veri Eksik',
  },
  {
    id: 'p3',
    name: 'Tel Çubuk',
    cnCode: '7213',
    productionAmount: 600,
    totalEmission: 1374,
    specificEmission: 2.29,
    dataQuality: 55,
    risk: 'Düşük',
    status: 'Revizyon Gerekli',
  },
]

export const COMPANY_DATA_TASKS = [
  {
    id: 't1',
    product: 'Çelik Profil',
    category: 'Enerji Verisi',
    responsible: 'Enerji Sorumlusu',
    status: 'Girildi',
    dueDate: '2026-05-15',
    quality: 88,
  },
  {
    id: 't2',
    product: 'İnşaat Demiri',
    category: 'Lojistik Verisi',
    responsible: 'Satın Alma',
    status: 'Eksik',
    dueDate: '2026-05-14',
    quality: 45,
  },
  {
    id: 't3',
    product: 'Tel Çubuk',
    category: 'Yakıt Verisi',
    responsible: 'Üretim Sorumlusu',
    status: 'Bekliyor',
    dueDate: '2026-05-18',
    quality: 0,
  },
]

export const COMPANY_APPROVALS = [
  {
    id: 'a1',
    product: 'Çelik Profil',
    period: '2026 Q2',
    totalEmission: 3725,
    specificEmission: 3.72,
    dataQuality: 82,
    calculationMode: 'Actual Data',
    risk: 'Kritik',
  },
  {
    id: 'a2',
    product: 'İnşaat Demiri',
    period: '2026 Q2',
    totalEmission: 1984,
    specificEmission: 2.48,
    dataQuality: 71,
    calculationMode: 'Hybrid',
    risk: 'Orta',
  },
]

export const AI_RECOMMENDATIONS = [
  {
    id: 'r1',
    title: 'Yenilenebilir elektrik kullanımı',
    text: 'Elektrik tüketiminiz yüksek görünüyor. YEK-G belgesi veya yenilenebilir elektrik tedariki değerlendirilebilir.',
    impact: 'Yüksek',
  },
  {
    id: 'r2',
    title: 'Tedarikçi EPD verisi',
    text: 'Bazı hammadde tedarikçilerinde EPD verisi eksik. EPD sağlayan tedarikçi seçimi veri kalite skorunu artırır.',
    impact: 'Orta',
  },
  {
    id: 'r3',
    title: 'Nakliye optimizasyonu',
    text: 'Nakliye mesafesi yüksek olan girdilerde daha yakın tedarikçi veya demiryolu senaryosu karbonu azaltabilir.',
    impact: 'Orta',
  },
]

export const COMPANY_SUPPLIER_SCENARIOS = [
  {
    id: 's0',
    supplier: 'Mevcut Tedarikçi',
    material: 'Billet',
    amount: 1020,
    ef: 2.1,
    price: 500,
    epd: false,
    distance: 420,
  },
  {
    id: 's1',
    supplier: 'Supplier A',
    material: 'Billet',
    amount: 1020,
    ef: 1.85,
    price: 520,
    epd: true,
    distance: 360,
  },
  {
    id: 's2',
    supplier: 'Supplier B',
    material: 'Billet',
    amount: 1020,
    ef: 1.55,
    price: 560,
    epd: true,
    distance: 610,
  },
  {
    id: 's3',
    supplier: 'Supplier C',
    material: 'Billet',
    amount: 1020,
    ef: 2.4,
    price: 480,
    epd: false,
    distance: 220,
  },
]

export const COMPANY_ADMINS = [
  {
    id: 'ca1',
    company: 'Örnek Demir Çelik A.Ş.',
    name: 'Ayşe Yılmaz',
    email: 'ayse@ornekdemir.com',
    phone: '+90 555 111 22 33',
    role: 'KOBİ Firma Admini',
    status: 'Aktif',
  },
]

export const OPERATOR_TASKS = [
  {
    id: 'op1',
    product: 'Çelik Profil',
    category: 'Elektrik Tüketimi',
    unit: 'MWh',
    status: 'Bekliyor',
    dueDate: '2026-05-15',
  },
  {
    id: 'op2',
    product: 'İnşaat Demiri',
    category: 'Nakliye Mesafesi',
    unit: 'km',
    status: 'Eksik',
    dueDate: '2026-05-14',
  },
]

export const COMPANY_USERS = [
  {
    id: 'u1',
    name: 'Mehmet Kaya',
    email: 'mehmet.kaya@ornekdemir.com',
    department: 'Üretim',
    role: 'Üretim Sorumlusu',
    dataScope: 'Üretim Verisi',
    assignedProduct: 'Çelik Profil',
    status: 'Aktif',
  },
  {
    id: 'u2',
    name: 'Elif Demir',
    email: 'elif.demir@ornekdemir.com',
    department: 'Enerji',
    role: 'Enerji Sorumlusu',
    dataScope: 'Elektrik ve Yakıt Verisi',
    assignedProduct: 'İnşaat Demiri',
    status: 'Aktif',
  },
  {
    id: 'u3',
    name: 'Burak Şahin',
    email: 'burak.sahin@ornekdemir.com',
    department: 'Satın Alma',
    role: 'Tedarikçi / Hammadde Sorumlusu',
    dataScope: 'Hammadde ve EPD Verisi',
    assignedProduct: 'Tel Çubuk',
    status: 'Aktif',
  },
  {
    id: 'u4',
    name: 'Zeynep Arslan',
    email: 'zeynep.arslan@ornekdemir.com',
    department: 'Lojistik',
    role: 'Lojistik Sorumlusu',
    dataScope: 'Nakliye Verisi',
    assignedProduct: 'Çelik Profil',
    status: 'Pasif',
  },
]