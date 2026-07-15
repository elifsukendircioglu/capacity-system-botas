const { getReservesForAllocation, updateAllocatedAmount, getAllAllocations, getAllocationsByOwner } = require('../models/reserveModel');

const ALLOCATION_MULTIPLIER = 2.5;

function isWithinAllocationWindow() {
    //const now = new Date();
    //const totalMinutes ow.getHours() * 60 + now.getMinutes();
    //return totalMinutes >= 10 * 60 && totalMinutes <= 12 * 60 + 30;
    return true;
}

// YENİ: asıl iş mantığı burada. req/res'e bağımlı değil,
// hem route'tan hem de cron job'dan çağrılabilir.
async function performAllocation() {
    const reserves = await getReservesForAllocation();

    if (reserves.length === 0) {
        return { success: false, message: 'Tahsis edilecek kapasite kaydı bulunamadı.' };
    }

    const results = [];
    for (const reserve of reserves) {
        const allocatedAmount = reserve.reserve_amount * ALLOCATION_MULTIPLIER;
        const updated = await updateAllocatedAmount(reserve.id, allocatedAmount);
        results.push(updated);
    }

    return { success: true, data: results };
}

// ESKİ fonksiyon: davranışı birebir aynı kaldı, sadece içi performAllocation'ı çağırıyor
async function runAllocation(req, res) {
    try {
        if (!isWithinAllocationWindow()) {
            return res.status(403).json({ message: 'Tahsisat işlemi yalnızca 10:00 - 12:30 arasında çalıştırılabilir.' });
        }

        const result = await performAllocation();

        if (!result.success) {
            return res.status(404).json({ message: result.message });
        }

        res.status(200).json({ message: `${result.data.length} kayıt için tahsisat oluşturuldu.`, data: result.data });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Tahsisat işlemi sırasında hata oluştu.' });
    }
}
async function getAllocationHistory(req, res) {
    try {
        const { date } = req.query;
        const { id, role } = req.user;

        let data;
        if (role === 'admin') {
            data = await getAllAllocations(date);
        } else {
            data = await getAllocationsByOwner(id, date);
        }

        res.status(200).json(data);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Tahsisat geçmişi alınırken hata oluştu.' });
    }
}

module.exports = { runAllocation, performAllocation, getAllocationHistory };