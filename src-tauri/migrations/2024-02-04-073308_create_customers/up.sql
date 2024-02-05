-- Your SQL goes here
CREATE TABLE customers (
    customer_id INTEGER PRIMARY KEY NOT NULL,
    name TEXT NOT NULL,
    phone TEXT NOT NULL UNIQUE
);
