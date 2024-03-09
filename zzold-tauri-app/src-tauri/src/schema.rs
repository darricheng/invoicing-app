// @generated automatically by Diesel CLI.

diesel::table! {
    customers (id) {
        id -> Integer,
        name -> Text,
        phone -> Text,
    }
}

diesel::table! {
    line_items (id) {
        id -> Integer,
        name -> Text,
        rate -> Float,
        customer_id -> Integer,
    }
}

diesel::joinable!(line_items -> customers (customer_id));

diesel::allow_tables_to_appear_in_same_query!(
    customers,
    line_items,
);
