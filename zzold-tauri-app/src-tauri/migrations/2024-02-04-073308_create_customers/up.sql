-- Your SQL goes here
CREATE TABLE customers (
    id INTEGER PRIMARY KEY NOT NULL,
    name TEXT NOT NULL,
    phone TEXT NOT NULL UNIQUE
);
