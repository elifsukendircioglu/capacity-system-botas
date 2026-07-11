const { getReservesForAllocation, updateAllocatedAmount } = require('../models/reserveModel');

const ALLOCATION_MULTIPLIER = 2.5;

function isWithinAllocationWindow() {
    const now = new Date();
    const totalMinutes = now.getHours() * 60 + now.getMinutes();
    return totalMinutes >= 10 * 60 && totalMinutes <= 12 * 60 + 30;
}

async function runAllocation(req, res) {
    try {
        if (!isWithinAllocationWindow()) {
            return res.status(403).json({ message: 'Tahsisat işlemi yalnızca 10:00 - 12:30 arasında çalıştırılabilir.' });
        }

        const reserves = await getReservesForAllocation();
        if (reserves.length === 0) {
            return res.status(404).json({ message: 'Tahsis edilecek kapasite kaydı bulunamadı.' });
        }

        const results = [];
        for (const reserve of reserves) {
            const allocatedAmount = reserve.reserve_amount * ALLOCATION_MULTIPLIER;
            const updated = await updateAllocatedAmount(reserve.id, allocatedAmount);
            results.push(updated);
        }

        res.status(200).json({ message: `${results.length} kayıt için tahsisat oluşturuldu.`, data: results });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Tahsisat işlemi sırasında hata oluştu.' });
    }
}

module.exports = { runAllocation };