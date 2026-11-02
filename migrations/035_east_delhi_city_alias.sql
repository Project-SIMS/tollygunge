-- Reviewed source and scope: data/postal/city-aliases.md (2026-11-02).
-- Add only to postal versions whose installed hierarchy contains Delhi / East.
INSERT INTO tpa.postal_city_aliases(version_id,state,district,alias,city)
SELECT DISTINCT version_id,state,district,'delhi','Delhi'
FROM tpa.postal_locations
WHERE state='Delhi' AND district='East'
ON CONFLICT DO NOTHING;
