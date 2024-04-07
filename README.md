# Invoicing App

A feature bloat-free app to help you manage your repeating customer invoice data, and automatically create and send invoices via WhatsApp at the click of a button. Everything is done locally, an internet connection is required only to send the invoice via WhatsApp!

## Problem Statement

As a solo entrepreneur, my time and monetary resources are limited. Creating invoices manually one-by-one is tedious and takes up too much time, and most of the invoicing solutions available out there are too expensive for too many features that I do not need. I just want to send invoices easily via WhatsApp with the click of a button.

## Features

- Store templates of each customer that will be reused when creating an invoice for that customer
- One-click sending of invoices after adjusting the line item data

### Video Demo

https://github.com/darricheng/invoicing-app/assets/77005864/39878ea8-75ef-4cf6-bcbd-c513010184b1 <!-- github will automatically make the video playable in the readme -->

## Tech Stack

- Electron
- SvelteKit
- SQLite
- Puppeteer

### Rationale

Cost was a primary factor in choosing the technologies to solve this problem. To send a PDF via WhatsApp in a cost-free manner, we would ideally do everything locally without the need to utilise any services provided by other companies. Thus I chose to use Electron for the UI and and SQLite to manage the data.

The idea behind this app is to generate the PDF locally using [puppeteer](https://pptr.dev/), so that we have flexibility to change the invoice template easily with HTML and CSS, then send it again using puppeteer, this time with a library called [whatsapp-web.js](https://github.com/pedroslopez/whatsapp-web.js).
