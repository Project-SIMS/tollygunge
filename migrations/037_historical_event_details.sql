CREATE TABLE tpa.historical_event_details (
 source_date DATE PRIMARY KEY,
 title TEXT NOT NULL CHECK(length(btrim(title)) BETWEEN 3 AND 160),
 description TEXT NOT NULL DEFAULT '' CHECK(length(description)<=5000),
 location TEXT NOT NULL DEFAULT '' CHECK(length(location)<=240),
 speakers TEXT NOT NULL DEFAULT '' CHECK(length(speakers)<=500),
 version INTEGER NOT NULL DEFAULT 1 CHECK(version>0),
 updated_by TEXT NOT NULL REFERENCES public."user"(id),
 updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE TABLE tpa.historical_event_revisions (
 source_date DATE NOT NULL REFERENCES tpa.historical_event_details(source_date),
 version INTEGER NOT NULL,
 before_details JSONB,
 after_details JSONB NOT NULL,
 reason TEXT NOT NULL CHECK(length(btrim(reason)) BETWEEN 3 AND 1000),
 actor_id TEXT NOT NULL REFERENCES public."user"(id),
 created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
 PRIMARY KEY(source_date,version)
);
