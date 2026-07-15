-- Tahsisat sonuçlarını tutan yeni tablo.
-- Her approved capacity kaydı için ayrı bir satır oluşur (birleştirilmez).
CREATE TABLE IF NOT EXISTS allocation (
    id SERIAL PRIMARY KEY,
    capacity_id INTEGER NOT NULL REFERENCES capacity(id),
    point_id INTEGER NOT NULL,
    allocated_amount DOUBLE PRECISION NOT NULL,
    allocated_at TIMESTAMP NOT NULL DEFAULT NOW()
);
CREATE UNIQUE INDEX IF NOT EXISTS idx_allocation_capacity_id ON allocation(capacity_id);

CREATE INDEX IF NOT EXISTS idx_allocation_point_id ON allocation(point_id);
CREATE INDEX IF NOT EXISTS idx_allocation_allocated_at ON allocation(allocated_at);
