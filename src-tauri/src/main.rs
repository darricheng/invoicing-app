// Prevents additional console window on Windows in release, DO NOT REMOVE!!
#![cfg_attr(not(debug_assertions), windows_subsystem = "windows")]

use std::{env, sync::Mutex};

use diesel::{
    insert_into, prelude::Insertable, Connection, ConnectionError, RunQueryDsl, SqliteConnection,
};
use dotenvy::dotenv;
use models::{Customer, LineItem};
use schema::{
    customers::{self, customer_id, dsl::*},
    line_items::{self, dsl::*},
};
use serde::Deserialize;
use tauri::{command, generate_handler, Manager, State};

mod models;
mod schema;

struct DbConnection {
    db: Mutex<Option<SqliteConnection>>,
}

fn establish_connection() -> Result<SqliteConnection, ConnectionError> {
    let database_url = env::var("DATABASE_URL").expect("DATABASE_URL must be set");
    let conn = SqliteConnection::establish(&database_url)?;
    Ok(conn)
}

fn main() {
    dotenv().ok();

    tauri::Builder::default()
        .manage(DbConnection {
            db: Default::default(),
        })
        .setup(|app| {
            let app_handle = app.handle();
            let app_state: State<DbConnection> = app_handle.state();
            let db_conn = match establish_connection() {
                Ok(conn) => conn,
                Err(e) => panic!("Error connecting to database: {}", e),
            };
            *app_state.db.lock().unwrap() = Some(db_conn);
            Ok(())
        })
        .invoke_handler(generate_handler![
            list_customers,
            add_customer,
            edit_customer
        ])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}

// TODO: return a result
#[command]
fn list_customers(state: State<DbConnection>) -> Vec<Customer> {
    let mut binding = state.db.lock().unwrap();
    let db_conn = binding.as_mut().unwrap();
    let results = customers.load::<Customer>(db_conn).unwrap();
    results
}

#[derive(Debug, Deserialize, Insertable)]
#[diesel(table_name = line_items)]
struct LineItemForm {
    name: String,
    rate: i32,
    customer_id: Option<i32>,
}

#[derive(Debug, Deserialize, Insertable)]
#[diesel(table_name = customers)]
struct CustomerForm {
    name: String,
    phone: String,
}

#[derive(Deserialize)]
struct NewCustomer {
    customer: CustomerForm,
    line_items: Vec<LineItemForm>,
}

#[command]
fn add_customer(state: State<DbConnection>, data: NewCustomer) -> Result<i32, String> {
    let mut binding = state.db.lock().unwrap();
    let db_conn = binding.as_mut().unwrap();
    let customer = data.customer;
    let new_customer_id = insert_into(customers)
        .values(customer)
        .returning(customer_id)
        .get_result(db_conn)
        .map_err(|e| e.to_string())?;

    let mut new_line_items = data.line_items;
    new_line_items
        .iter_mut()
        .for_each(|el| el.customer_id = Some(new_customer_id));
    let num_line_items = insert_into(line_items)
        .values(new_line_items)
        .execute(db_conn)
        .map_err(|e| e.to_string())?;
    println!("inserted {} new line items", num_line_items);
    Ok(new_customer_id)
}

#[command]
fn edit_customer(
    state: State<DbConnection>,
    id: i32,
    data: CustomerForm,
) -> Result<Customer, String> {
    let mut binding = state.db.lock().unwrap();
    let db_conn = binding.as_mut().unwrap();
    todo!()
}
