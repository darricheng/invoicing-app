// Prevents additional console window on Windows in release, DO NOT REMOVE!!
#![cfg_attr(not(debug_assertions), windows_subsystem = "windows")]

use std::{env, sync::Mutex};

use diesel::{Connection, ConnectionError, RunQueryDsl, SqliteConnection};
use dotenvy::dotenv;
use models::Customer;
use schema::customers::dsl::*;
use tauri::{command, generate_handler, Manager, State};

mod models;
mod schema;

pub struct DbConnection {
    db: Mutex<Option<SqliteConnection>>,
}

pub fn establish_connection() -> Result<SqliteConnection, ConnectionError> {
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
        .invoke_handler(generate_handler![list_customers])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}

#[command]
fn list_customers(state: State<DbConnection>) -> Vec<Customer> {
    let mut binding = state.db.lock().unwrap();
    let db_conn = binding.as_mut().unwrap();
    let results = customers.load::<Customer>(db_conn).unwrap();
    results
}
