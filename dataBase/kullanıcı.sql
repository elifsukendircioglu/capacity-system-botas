ALTER TABLE "Capacity"
ADD CONSTRAINT fk_capacity_point
FOREIGN KEY (point_id) REFERENCES points(id);
