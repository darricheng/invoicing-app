use printpdf::*;
use serde::Deserialize;
use std::fs::File;
use std::io::BufWriter;
use tauri::command;

use crate::models::Customer;

#[derive(Deserialize)]
pub struct InvoiceData {
    customer: Customer,
    line_items: Vec<InvoiceLineItem>,
}

#[derive(Deserialize)]
struct InvoiceLineItem {
    id: i32,
    name: String,
    rate: i32,
    customer_id: i32,
    quantity: i32,
    amount: i32,
    details: String,
}

// Returns the number of generated pdfs if successful
#[command]
pub fn generate_pdf_invoices(data: Vec<InvoiceData>) -> Result<i32, String> {
    Err("placeholder".to_string())
}
