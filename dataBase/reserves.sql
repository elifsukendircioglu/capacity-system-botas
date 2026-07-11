CREATE TABLE public.reserves (
  id SERIAL PRIMARY KEY,
  point_id INTEGER NOT NULL REFERENCES points(id),
  reserve_amount DOUBLE PRECISION NOT NULL,
  reserve_date DATE NOT NULL,
  created_at TIMESTAMP NOT NULL DEFAULT NOW()
);
