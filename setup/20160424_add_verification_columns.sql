ALTER TABLE calevent
ADD verificationcode VARCHAR(255),
ADD emailverified int(1) DEFAULT 0;

-- New events are unverified by default, but old events are grandfathered in
UPDATE calevent SET emailverified=1;
