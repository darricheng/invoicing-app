// Prevents additional console window on Windows in release, DO NOT REMOVE!!
#![cfg_attr(not(debug_assertions), windows_subsystem = "windows")]

use std::{collections::HashSet, env, sync::Mutex};

use diesel::{
    insert_into, prelude::Insertable, query_builder::AsChangeset, BelongingToDsl, Connection,
    ConnectionError, ExpressionMethods, QueryDsl, RunQueryDsl, SelectableHelper, SqliteConnection,
};
use dotenvy::dotenv;
use models::{Customer, LineItem};
use schema::{customers, line_items};
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
            get_customer,
            add_customer,
            edit_customer,
            delete_customer
        ])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}

// TODO: return a result
#[command]
fn list_customers(state: State<DbConnection>) -> Vec<Customer> {
    let mut binding = state.db.lock().unwrap();
    let db_conn = binding.as_mut().unwrap();
    let results = customers::dsl::customers.load::<Customer>(db_conn).unwrap();
    results
}

#[derive(Debug, Deserialize, Insertable, AsChangeset)]
#[diesel(table_name = line_items)]
struct LineItemForm {
    id: Option<i32>,
    name: String,
    rate: i32,
    customer_id: Option<i32>,
}

#[derive(Debug, Deserialize, Insertable, AsChangeset)]
#[diesel(table_name = customers)]
struct BaseCustomerForm {
    id: Option<i32>,
    name: String,
    phone: String,
}

#[derive(Deserialize, Debug)]
struct FullCustomerForm {
    customer: BaseCustomerForm,
    line_items: Vec<LineItemForm>,
}

#[command]
fn add_customer(
    state: State<DbConnection>,
    data: FullCustomerForm,
) -> Result<(i32, usize), String> {
    let mut binding = state.db.lock().unwrap();
    let db_conn = binding.as_mut().unwrap();
    let customer = data.customer;
    let new_customer_id = insert_into(customers::dsl::customers)
        .values(customer)
        .returning(customers::dsl::id)
        .get_result(db_conn)
        .map_err(|e| e.to_string())?;

    let new_line_items = data.line_items;
    let num_line_items = add_line_items(db_conn, new_line_items, new_customer_id)?;

    Ok((new_customer_id, num_line_items))
}

fn add_line_items(
    db_conn: &mut SqliteConnection,
    mut new_line_items: Vec<LineItemForm>,
    customer_id: i32,
) -> Result<usize, String> {
    new_line_items
        .iter_mut()
        .for_each(|el| el.customer_id = Some(customer_id));
    let num_line_items = insert_into(line_items::dsl::line_items)
        .values(new_line_items)
        .execute(db_conn)
        .map_err(|e| e.to_string())?;

    Ok(num_line_items)
}

#[command]
fn get_customer(state: State<DbConnection>, id: i32) -> Result<(Customer, Vec<LineItem>), String> {
    let mut binding = state.db.lock().unwrap();
    let db_conn = binding.as_mut().unwrap();
    let customer = customers::dsl::customers
        .find(id)
        .select(Customer::as_select())
        .first(db_conn)
        .map_err(|e| e.to_string())?;

    let items = LineItem::belonging_to(&customer)
        .select(LineItem::as_select())
        .load(db_conn)
        .map_err(|e| e.to_string())?;

    Ok((customer, items))
}

#[command]
fn edit_customer(
    state: State<DbConnection>,
    data: FullCustomerForm,
) -> Result<(usize, usize), String> {
    println!("edit_customer called");
    let mut binding = state.db.lock().unwrap();
    let db_conn = binding.as_mut().unwrap();

    let customer_to_edit = data.customer;
    let line_items_to_edit = data.line_items;

    let customer_rows_updated = diesel::update(customers::table)
        .filter(customers::id.eq(customer_to_edit.id.unwrap()))
        .set(&customer_to_edit)
        .execute(db_conn)
        .map_err(|e| e.to_string())?;

    // TODO: get items from db, filter for new, changed, and deleted items, then execute queries accordingly
    // see: https://users.rust-lang.org/t/idiomatic-way-to-get-difference-between-two-vecs/48396/11
    let (new_line_items, updated_line_items): (Vec<LineItemForm>, Vec<LineItemForm>) =
        line_items_to_edit
            .into_iter()
            .partition(|item| item.id.is_none());
    let existing_line_item_ids: Vec<i32> = line_items::table
        .filter(line_items::customer_id.eq(&customer_to_edit.id.unwrap()))
        .select(line_items::id)
        .load(db_conn)
        .map_err(|e| e.to_string())?;
    let updated_line_item_ids: HashSet<i32> = updated_line_items
        .iter()
        .map(|item| item.id.unwrap())
        .collect();
    let deleted_line_item_ids: Vec<i32> = existing_line_item_ids
        .into_iter()
        .filter(|id| !updated_line_item_ids.contains(id))
        .collect();

    let mut line_item_rows_updated = 0;

    // Updates
    // will also run for items that were not changed
    for item in updated_line_items {
        let num = diesel::update(line_items::table)
            .filter(line_items::id.eq(item.id.unwrap()))
            .set(item)
            .execute(db_conn)
            .map_err(|e| e.to_string())?;
        line_item_rows_updated += num;
    }
    // Adds
    let line_items_added = add_line_items(db_conn, new_line_items, customer_to_edit.id.unwrap())?;
    line_item_rows_updated += line_items_added;
    // Deletes
    let items_deleted =
        diesel::delete(line_items::table.filter(line_items::id.eq_any(deleted_line_item_ids)))
            .execute(db_conn)
            .map_err(|e| e.to_string())?;
    line_item_rows_updated += items_deleted;

    Ok((customer_rows_updated, line_item_rows_updated))
}

#[command]
fn delete_customer(state: State<DbConnection>, id: i32) -> Result<bool, String> {
    let mut binding = state.db.lock().unwrap();
    let db_conn = binding.as_mut().unwrap();

    diesel::delete(line_items::table.filter(line_items::customer_id.eq(id)))
        .execute(db_conn)
        .map_err(|e| e.to_string())?;
    diesel::delete(customers::table.filter(customers::id.eq(id)))
        .execute(db_conn)
        .map_err(|e| e.to_string())?;

    Ok(true)
}
