-- Your SQL goes here
CREATE TABLE line_items (
    id INTEGER PRIMARY KEY NOT NULL,
    name TEXT NOT NULL,
    rate INTEGER NOT NULL,
    customer_id INTEGER NOT NULL,
    FOREIGN KEY (customer_id)
        REFERENCES customers(id)
            ON UPDATE CASCADE
            ON DELETE CASCADE
);
