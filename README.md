# Classhopper Forum

Classhopper öğrenci forumu ve kayıt sistemi. Firebase/Firestore tabanlı, Next.js ile geliştirilmiş modern bir web uygulaması.

## 🚀 Özellikler

### 📝 Kamu Formu (Google Form benzeri)
- Tek sayfalık, 3 bölümlü form (Kişisel / Klan / Proje)
- Zorunlu alanlar ve validasyon
- KVKK/açık rıza onayı
- reCAPTCHA v3 entegrasyonu
- Hız limiti koruması

### 🗣️ Forum Sistemi
- Kategori → Konu → Mesaj hiyerarşisi
- Tüm içerik admin onaylı yayına çıkar
- Etiket filtreleri ve arama
- Ziyaretçi konu/yanıt önerileri

### 👨‍💼 Admin Panel
- **Form Kayıtları**: Öğrenci/klan/proje listeleri, CSV export
- **Moderasyon**: Bekleyen konu/mesaj/rapor kuyruğu
- **Forum Yönetimi**: kategori/etiket CRUD, konu pin/lock
- **Analitik**: Form istatistikleri, dönüşümler, zaman serileri

## 🏗️ Teknoloji Stack

- **Frontend**: Next.js 14, React 18, TypeScript
- **Styling**: Tailwind CSS
- **Backend**: Firebase Functions, Firestore
- **Authentication**: Firebase Auth
- **Forms**: React Hook Form, Zod validation
- **UI Components**: Lucide React icons
- **Notifications**: React Hot Toast

## 📊 Veri Modeli

### Ana Koleksiyonlar
- `students`: Öğrenci bilgileri (PII - admin only)
- `clans`: Klan bilgileri
- `clanMembers`: Klan üyelikleri
- `projects`: Proje bilgileri
- `categories`: Forum kategorileri
- `tags`: Etiketler
- `threads`: Forum konuları
- `posts`: Forum mesajları
- `publicSubmissions`: Bekleyen gönderimler
- `adminAudit`: Admin işlem logları

## 🔧 Kurulum

### Gereksinimler
- Node.js 18+
- Firebase CLI
- Firebase projesi

### 1. Projeyi klonlayın
```bash
git clone <repository-url>
cd classhopper-forum
```

### 2. Bağımlılıkları yükleyin
```bash
npm install
```

### 3. Environment değişkenlerini ayarlayın
```bash
cp env.example .env.local
```

`.env.local` dosyasını düzenleyin:
```env
NEXT_PUBLIC_FIREBASE_API_KEY=your_api_key
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your_project_id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your_project.appspot.com
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
NEXT_PUBLIC_FIREBASE_APP_ID=your_app_id
NEXT_PUBLIC_RECAPTCHA_SITE_KEY=your_recaptcha_key
ADMIN_EMAIL=admin@classhopper.com
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your_email@gmail.com
SMTP_PASS=your_app_password
```

### 4. Firebase projesini başlatın
```bash
firebase init
```

### 5. Cloud Functions'ı kurun
```bash
cd functions
npm install
cd ..
```

### 6. Geliştirme sunucusunu başlatın
```bash
npm run dev
```

### 7. Firebase emülatörlerini başlatın (opsiyonel)
```bash
npm run firebase:emulators
```

## 🚀 Deployment

### Firebase Hosting
```bash
npm run build
npm run firebase:hosting:deploy
```

### Cloud Functions
```bash
npm run firebase:functions:deploy
```

## 🔒 Güvenlik

### Firestore Rules
- Public read: sadece published içerik
- Public write: yasak (sadece Cloud Functions)
- PII koleksiyonları: sadece admin
- Rate limiting ve reCAPTCHA koruması

### Admin Authentication
- Firebase Auth ile email/şifre
- Admin token kontrolü
- Tüm admin işlemleri audit log

## 📈 Analitik

### Dashboard Metrikleri
- Günlük/haftalık/aylık form gönderimi
- Onay oranı ve red nedenleri
- Üniversite/bölüm dağılımı
- Teknoloji etiketi sıklığı
- Forum aktivite trendleri

### GA4 Events
- `form_view`, `form_submit`, `form_validate_error`
- `topic_suggest`, `moderation_approve/reject`

## 🧪 Test

### Rules Testleri
```bash
firebase emulators:exec --only firestore "npm test"
```

### E2E Testleri
```bash
npx playwright test
```

## 📁 Proje Yapısı

```
classhopper-forum/
├── app/                    # Next.js App Router
│   ├── admin/             # Admin panel
│   ├── forum/             # Forum sayfaları
│   ├── form/              # Kayıt formu
│   └── api/               # API routes
├── components/            # React bileşenleri
├── lib/                   # Utility fonksiyonları
├── types/                # TypeScript tip tanımları
├── functions/             # Cloud Functions
│   └── src/
│       └── index.ts       # Functions kodu
├── firestore.rules        # Firestore güvenlik kuralları
├── firestore.indexes.json # Firestore indexleri
└── firebase.json          # Firebase konfigürasyonu
```

## 🤝 Katkıda Bulunma

1. Fork yapın
2. Feature branch oluşturun (`git checkout -b feature/amazing-feature`)
3. Commit yapın (`git commit -m 'Add amazing feature'`)
4. Push yapın (`git push origin feature/amazing-feature`)
5. Pull Request oluşturun

## 📄 Lisans

Bu proje MIT lisansı altında lisanslanmıştır.

## 📞 İletişim

Sorularınız için admin paneline giriş yapabilir veya GitHub issues kullanabilirsiniz.

---

**Not**: Bu proje geliştirme aşamasındadır. Production kullanımı için ek güvenlik önlemleri ve testler gereklidir.
