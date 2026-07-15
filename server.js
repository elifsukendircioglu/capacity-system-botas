const app = require('./src/app');
require('dotenv').config();
const cron = require('node-cron');
const { performAllocation } = require('./src/controllers/allocationController');

const PORT = 3000;
app.listen(PORT, () => console.log(`Server ${PORT} portunda çalışıyor`));

// Her gün saat 10:00'da tahsisat hesaplamasını otomatik çalıştır
cron.schedule('25 15 * * *', async () => {
    console.log('[CRON] Tahsisat hesaplama işlemi başlatıldı:', new Date().toISOString());
    try {
        const result = await performAllocation();
        if (result.success) {
            console.log(`[CRON] Başarılı: ${result.data.length} kayıt için tahsisat oluşturuldu.`);
        } else {
            console.log(`[CRON] ${result.message}`);
        }
    } catch (error) {
        console.error('[CRON] Tahsisat işlemi sırasında hata:', error);
    }
});