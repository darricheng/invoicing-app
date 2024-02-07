use diesel::{Queryable, Selectable};
use serde::Serialize;

#[derive(Queryable, Selectable, Serialize)]
#[diesel(table_name = crate::schema::customers)]
#[diesel(check_for_backend(diesel::sqlite::Sqlite))]
pub struct Customer {
    pub customer_id: i32,
    pub name: String,
    pub phone: String,
}

#[derive(Queryable, Selectable, Serialize)]
#[diesel(table_name = crate::schema::line_items)]
#[diesel(check_for_backend(diesel::sqlite::Sqlite))]
pub struct LineItem {
    pub line_item_id: i32,
    pub name: String,
    pub rate: i32,
    pub customer_id: i32,
}
