# DATABASE KURULUM REHBERİ

## Bu Projede Ne var?

### 1. SQLite Database (Prisma ORM ile)
- **Database**: `prisma/dev.db` (yerel geliştirme için)
- **Şema**: User, Repo, Changelog, Feedback, Settings tabloları

### 2. Çalışan Sayfalar
- **Impact Score**: GitHub'dan commit çekip analiz eder
- **Contributors**: Repository katkımcılarını gösterir
- **Feedback**: Admin panelde kaydedilir

---

## SENİN YAPMAN GEREKENLER (Adım Adım)

### ADIM 1: Vercel'de PostgreSQL Kur
1. **Vercel.com** -> Login ol
2. Projeni aç (`releaseflow-fawn`)
3. **Storage** tab -> **Create Database** -> **PostgreSQL**
4. Ayar: **Free Tier** (ücretsiz)
5. Database oluştuktan sonra **Connection String**'i kopyala

### ADIM 2: Environment Variables Güncelle
Vercel'de oluşturduğun database'in Connection String'i:
```
postgresql://username:password@host:5432/database_name
```

bunu şu şekilde güncelle:

```
DATABASE_URL="postgresql://username:password@host:5432/database_name"
```

**NOT**: `.env` dosyasında SQLite var ama Vercel'de PostgreSQL kullanmalısın çünkü SQLite Vercel'de çalışmıyor!

### ADIM 3: Database Migration Çalıştır (Vercel'de otomatik)
Vercel deployment'da şu komut çalışır:
```
npx prisma migrate deploy
```

Ama manual olarak Vercel CLI ile:
```bash
npm i -g vercel
vercel env add DATABASE_URL
# Database connection string'i gir
vercel --prod
```

---

## ÖNEMLİ NOTLAR

### ❌ SQLite Vercel'de Çalışmaz!
- SQLite dosya tabanlı, Vercel serverless'ta uygun değil
- Yerel geliştirme için SQLite, Production için PostgreSQL

### ✓ Ne Yaptık?
1. Prisma schema oluşturduk (User, Repo, Changelog, Feedback)
2. API route'ları database'e bağladık
3. Impact/Contributors sayfalarını GitHub API ile çalışır hale getirdik

### Sırada Ne Var?
Database'i Vercel'de kurmana lazım. Yukarıdaki adımları takip et.

---

## Test Etmek İçin

### Yerel Test:
```bash
cd C:\Users\Cihatt\Desktop\changelog-tool
npm run dev
```

1. GitHub ile giriş yap
2. Repository bağla
3. /impact sayfasına git -> repo gir -> Analyze
4. /contributors sayfasına git -> repo gir -> Fetch
5. /feedback sayfasına git -> mesaj gönder
6. /admin/login -> token: `rf_admin_2026_secr3t` -> Feedback sekmesinde gör

### Vercel Deploy:
1. Storage -> PostgreSQL oluştur
2. DATABASE_URL environment variable olarak ekle
3. Redeploy et