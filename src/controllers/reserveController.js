const { createReserve } = require('../models/reserveModel');
const { getPointById } = require('../models/pointModel');

function isWithinCapacityWindow() {
    const now = new Date();
    const totalMinutes = now.getHours() * 60 + now.getMinutes();
    return totalMinutes >= 8 * 60 && totalMinutes <= 17 * 60 + 30;
}

async function addReserve(req, res) {
    try {
        if (!isWithinCapacityWindow()) {
            return res.status(403).json({ message: 'Rezerv girişi yalnızca 08:00 - 17:30 arasında yapılabilir.' });
        }

        const { point_id, reserve_amount } = req.body;
        if (!point_id || !reserve_amount) {
            return res.status(400).json({ message: 'point_id ve reserve_amount zorunlu' });
        }

        const point = await getPointById(point_id);
        if (!point) {
            return res.status(404).json({ message: 'Nokta bulunamadı' });
        }
        if (point.status !== 'approved') {
            return res.status(403).json({ message: 'Bu nokta henüz onaylanmamış' });
        }
        if (reserve_amount > point.mak) {
            return res.status(400).json({ message: `Rezerv miktarı (${reserve_amount}), noktanın maksimum değerini (${point.mak}) aşamaz` });
        }

        const reserve = await createReserve({ point_id, reserve_amount });

        res.status(201).json({ message: 'Rezerv kaydı oluşturuldu', data: reserve });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Sunucu hatası' });
    }
}

module.exports = { addReserve };