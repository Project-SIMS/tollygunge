-- Sources and scope: data/postal/city-aliases.md (2026-11-02).
WITH reviewed(state,district,alias,city) AS (VALUES
  ('West Bengal','Paschim Bardhaman','durgapur','Durgapur'),
  ('West Bengal','Paschim Bardhaman','asansol','Asansol'),
  ('Odisha','Khordha','bhubaneswar','Bhubaneswar'),
  ('Kerala','Thiruvananthapuram','thiruvananthapuram','Thiruvananthapuram'),
  ('Kerala','Thiruvananthapuram','thiruvannathapuram','Thiruvananthapuram'),
  ('West Bengal','24 Paraganas North','kolkata','Kolkata'),
  ('Odisha','Jajapur','jajpur road','Jajpur Road')
)
INSERT INTO tpa.postal_city_aliases(version_id,state,district,alias,city)
SELECT DISTINCT l.version_id,r.state,r.district,r.alias,r.city
FROM reviewed r JOIN tpa.postal_locations l
  ON l.state=r.state AND l.district=r.district
ON CONFLICT DO NOTHING;
