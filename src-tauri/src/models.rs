use crate::schema::{customers, line_items};
use diesel::{
    associations::{Associations, Identifiable},
    Queryable, Selectable,
};
use serde::{Deserialize, Serialize};

#[derive(Queryable, Selectable, Serialize, Deserialize, Identifiable)]
#[diesel(table_name = customers)]
#[diesel(check_for_backend(diesel::sqlite::Sqlite))]
pub struct Customer {
    pub id: i32,
    pub name: String,
    pub phone: String,
}

#[derive(Queryable, Selectable, Serialize, Deserialize, Associations, PartialEq, Identifiable)]
#[diesel(belongs_to(Customer, foreign_key = customer_id))]
#[diesel(table_name = line_items)]
#[diesel(check_for_backend(diesel::sqlite::Sqlite))]
pub struct LineItem {
    pub id: i32,
    pub name: String,
    pub rate: f32,
    pub customer_id: i32,
}
