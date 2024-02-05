// @generated automatically by Diesel CLI.

diesel::table! {
    customers (customer_id) {
        customer_id -> Integer,
        name -> Text,
        phone -> Text,
    }
}

diesel::table! {
    line_items (line_item_id) {
        line_item_id -> Integer,
        name -> Text,
        rate -> Integer,
        customer_id -> Integer,
    }
}

diesel::joinable!(line_items -> customers (customer_id));

diesel::allow_tables_to_appear_in_same_query!(
    customers,
    line_items,
);
