CREATE TABLE IF NOT EXISTS people (
    user_id BIGINT PRIMARY KEY,
    user_name VARCHAR(12) DEFAULT 'Игрок',
    user_level INTEGER DEFAULT 1,
    user_position INTEGER DEFAULT 1,
    user_passport VARCHAR(6) NOT NULL,
    user_status VARCHAR(12) DEFAULT 'существует',
    date_spawn DATE NOT NULL,
    ban_reason TEXT
);




CREATE TABLE IF NOT EXISTS bank
(
    bank_id VARCHAR(16) UNIQUE CHECK (bank_id ~ '^[0-9]{1,16}$'),
    bank_amount DECIMAL(16, 2) DEFAULT 5000000.00,
    user_id BIGINT UNIQUE REFERENCES people(user_id)
);


CREATE TABLE IF NOT EXISTS casino
(
    casino_id SERIAL PRIMARY KEY,
    casino_balance DECIMAL(16, 2) DEFAULT 0.00,
    casino_bookmaker VARCHAR(16) NOT NULL,
    casino_coefficient REAL NOT NULL,
    casino_chance REAL NOT NULL,
    casino_commission REAL NOT NULL,
    last_change TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    user_id BIGINT UNIQUE REFERENCES people(user_id)
);



