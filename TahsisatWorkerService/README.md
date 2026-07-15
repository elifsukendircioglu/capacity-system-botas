# TahsisatWorkerService

BOTAŞ kapasite yönetim sisteminin, her gün belirli bir saatte otomatik tahsisat işlemini yapan
ve sonuçları grafik olarak sunan C# arka plan servisi.

## Ne yapar?
1. Her gün saat **10:00**'da (appsettings.json'dan değiştirilebilir), henüz tahsisat edilmemiş
   `approved` durumdaki `capacity` kayıtlarını bulur.
2. Her biri için `allocated_amount = capacity * 2.5` hesaplayıp yeni `allocation` tablosuna
   ayrı bir satır olarak yazar (aynı capacity iki kez işlenmez).
3. `/api/tahsisat/grafik/admin` ve `/api/tahsisat/grafik/user/{userId}` endpoint'leriyle
   React frontend'in grafik çizebileceği veriyi sunar.

## Kurulum

### 1. Veritabanı migration'ını çalıştır
`migration.sql` dosyasını mevcut PostgreSQL veritabanına uygula:
```bash
psql -h localhost -U postgres -d botas_capacity -f migration.sql
```

### 2. Bağlantı bilgisini gir
`appsettings.json` içindeki `ConnectionStrings:BotasDb` alanını kendi DB bilgilerinle güncelle.

### 3. Paketleri yükle ve çalıştır
```bash
cd TahsisatWorkerService
dotnet restore
dotnet run
```

Servis varsayılan olarak `http://localhost:5000` üzerinde ayağa kalkar (launchSettings ile portu değiştirebilirsin).

## Test etme
Worker'ı 10:00'ı beklemeden manuel tetiklemek için:
```bash
curl -X POST http://localhost:5000/api/tahsisat/calistir
```

Grafik verisini çekmek için:
```bash
curl http://localhost:5000/api/tahsisat/grafik/admin
curl http://localhost:5000/api/tahsisat/grafik/user/3
```

## Önemli notlar
- **Auth eklenmedi**: Şu an endpoint'ler herkese açık. Node.js backend'indeki JWT doğrulamasıyla
  aynı secret'ı kullanan bir middleware eklemen production için gerekiyor.
- **Node.js backend'ine dokunulmadı**: Bu servis aynı veritabanına ayrı bir uygulama olarak bağlanır.
- **Saat dilimi**: appsettings.json'daki `TimeZoneId` Europe/Istanbul olarak ayarlı, sunucu farklı
  bir saat diliminde çalışıyorsa bu değeri kontrol et.
