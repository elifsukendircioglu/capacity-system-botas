import axios from 'axios';

// Yeni C# Tahsisat Worker Servisi'nin adresi.
// Servis kendi bilgisayarında (localhost:5000) çalışıyor, prod'da bu adresi
// gerçek sunucu adresiyle değiştirmen gerekecek.
const tahsisatApi = axios.create({
  baseURL: 'http://localhost:5000/api/tahsisat',
});

export default tahsisatApi;