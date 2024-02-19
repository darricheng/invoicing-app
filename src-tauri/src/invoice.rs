use chrono::{Days, Local};
use printpdf::*;
use serde::Deserialize;
use std::env;
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
    id: i32, // unused
    name: String,
    rate: i32,
    customer_id: i32, // unused
    quantity: i32,
    amount: i32,
    details: String,
}

// Returns the number of generated pdfs if successful
#[command]
pub fn generate_pdf_invoices(data: Vec<InvoiceData>) -> Result<usize, String> {
    let mut count = 0;
    for customer in data.into_iter() {
        generate_pdf(customer)?;
        count += 1;
    }
    Ok(count)
}

fn generate_pdf(data: InvoiceData) -> Result<(), String> {
    let customer_name = data.customer.name;

    let company_name = env::var("COMPANY_NAME").map_err(|e| e.to_string())?;

    let doc_width = Mm(210.0);
    // ALGORITHM:
    // If details != '', add a base height that covers the padding between item and detail
    // Multiply the number of details lines by the line height
    // Allocate a fixed height in A4 for the line items
    // If the calculated number is greater than the allocated, add the difference to 297
    let mut total_line_items_height = Mm(0.0);
    for item in data.line_items.iter() {
        let details: Vec<&str> = item.details.trim().split('\n').collect();
        let details_len = details.len();
        // same as below when rendering each line item's details
        let details_height = Mm(details_len as f32 * 4.3 + 5.0 * 2.0);
        total_line_items_height += if details_height > Mm(16.0) {
            details_height
        } else {
            Mm(16.0)
        };
    }
    let doc_height = if total_line_items_height > Mm(170.0) {
        Mm(127.0) + total_line_items_height
    } else {
        Mm(297.0)
    };

    let (doc, page1, layer1) =
        PdfDocument::new("printpdf graphics test", doc_width, doc_height, "Layer 1");
    let layer = doc.get_page(page1).get_layer(layer1);
    let font = doc
        .add_builtin_font(BuiltinFont::Helvetica)
        .map_err(|e| e.to_string())?;

    let doc_margin = Mm(15.0);

    // Dates for invoice
    let today = Local::now().date_naive();
    let today_str = format!("{}", today.format("%d %b %Y"));
    let due_date_str = format!(
        "{}",
        today
            .checked_add_days(Days::new(7))
            .ok_or("day addition for due date failed")
            .map_err(|e| e.to_string())?
            .format("%d %b %Y")
    );
    let invoice_date_y = doc_height - Mm(32.0);
    let due_date_y = doc_height - Mm(39.0);
    layer.use_text("Invoice", 24.0, doc_margin, doc_height - Mm(20.0), &font);
    layer.use_text("Invoice Date", 12.0, doc_margin, invoice_date_y, &font);
    layer.use_text("Due Date", 12.0, doc_margin, due_date_y, &font);
    let dates_x = doc_margin + Mm(30.0);
    layer.use_text(&today_str, 12.0, dates_x, invoice_date_y, &font);
    layer.use_text(&due_date_str, 12.0, dates_x, due_date_y, &font);

    // Billing details
    let billed_y = doc_height - Mm(59.0);
    let billed_name_y = billed_y - Mm(7.0);
    layer.use_text("Billed By", 16.0, doc_margin, billed_y, &font);
    layer.use_text(company_name, 12.0, doc_margin, billed_name_y, &font);
    layer.use_text("Billed To", 16.0, doc_width / 2.0, billed_y, &font);
    layer.use_text(&customer_name, 12.0, doc_width / 2.0, billed_name_y, &font);

    let line_items_header_y = doc_height - Mm(85.0);
    let item_x = doc_margin + Mm(15.0);
    layer.use_text("Item", 12.0, item_x, line_items_header_y, &font);
    let quantity_x = doc_width / 2.0 + Mm(20.0);
    layer.use_text("Quantity", 12.0, quantity_x, line_items_header_y, &font);
    let rate_x = quantity_x + Mm(30.0);
    layer.use_text("Rate", 12.0, rate_x, line_items_header_y, &font);
    let amount_x = rate_x + Mm(24.0);
    layer.use_text("Amount", 12.0, amount_x, line_items_header_y, &font);

    let mut total_amount = 0;
    let mut next_line_item_y = doc_height - Mm(97.0);
    for (i, item) in data.line_items.into_iter().enumerate() {
        // We don't use both ids, so this stops the lsp complaining
        let (_, _) = (item.id, item.customer_id);

        // Index
        layer.use_text(
            format!("{}.", i + 1),
            12.0,
            doc_margin,
            next_line_item_y,
            &font,
        );
        // Name
        layer.use_text(item.name, 12.0, item_x, next_line_item_y, &font);
        // Quantity
        layer.use_text(
            item.quantity.to_string(),
            12.0,
            quantity_x,
            next_line_item_y,
            &font,
        );
        // Rate
        layer.use_text(
            format!("${}", item.rate.to_string()),
            12.0,
            rate_x,
            next_line_item_y,
            &font,
        );
        // Amount
        layer.use_text(
            format!("${}", item.amount.to_string()),
            12.0,
            amount_x,
            next_line_item_y,
            &font,
        );

        // NOTE: To generate each line item detail, we need to manually add line breaks
        let details: Vec<&str> = item.details.trim().split('\n').collect();
        let details_len = details.len();
        layer.begin_text_section();
        layer.set_font(&font, 10.0);
        layer.set_text_cursor(item_x, next_line_item_y - Mm(5.0));
        layer.set_line_height(12.0);
        details.into_iter().for_each(|line| {
            layer.write_text(line, &font);
            layer.add_line_break();
        });
        layer.end_text_section();

        // fixed value for the item + base value for space between item and details + number of
        // lines of details
        // 3.5 is the rough height of font size 10, 5.0 is the padding between sections
        let details_height = Mm(details_len as f32 * 4.3 + 5.0 * 2.0);
        next_line_item_y -= if details_height > Mm(16.0) {
            details_height
        } else {
            Mm(16.0)
        };
        total_amount += item.amount;
    }

    layer.use_text("Total (SGD)", 16.0, quantity_x, doc_margin + Mm(8.0), &font);
    layer.use_text(
        format!("${}", total_amount.to_string()),
        16.0,
        amount_x,
        doc_margin + Mm(8.0),
        &font,
    );

    doc.save(&mut BufWriter::new(
        File::create(format!(
            "../invoices/{}_invoice-{}.pdf",
            today.format("%Y-%m-%d").to_string(),
            &customer_name,
        ))
        .map_err(|e| e.to_string())?,
    ))
    .map_err(|e| e.to_string())?;

    Ok(())
}
