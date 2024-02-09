use crate::schema::{customers, line_items};
use diesel::{associations::Associations, prelude::Insertable, Queryable, Selectable};
use serde::{Deserialize, Serialize};

#[derive(Queryable, Selectable, Serialize, Deserialize)]
#[diesel(table_name = customers)]
#[diesel(check_for_backend(diesel::sqlite::Sqlite))]
pub struct Customer {
    pub customer_id: i32,
    #[diesel(column_name = name)]
    pub customer_name: String,
    pub phone: String,
}

#[derive(Queryable, Selectable, Serialize, Deserialize, Associations)]
#[diesel(belongs_to(Customer))]
#[diesel(table_name = line_items)]
#[diesel(check_for_backend(diesel::sqlite::Sqlite))]
pub struct LineItem {
    pub line_item_id: i32,
    #[diesel(column_name = name)]
    pub line_item_name: String,
    pub rate: i32,
    pub customer_id: i32,
}
