# energy-tracker
The Monthly Energy Tracker v1 is a single-page web application (SPA) built with HTML5, CSS3, and JavaScript using IndexedDB for local persistence.
1. Overview

The Monthly Energy Tracker v1 is a single-page web application (SPA) built with HTML5, CSS3, and JavaScript using IndexedDB for local persistence.
It allows users to:

    Input current and last month’s energy usage

    Automatically store entries in the browser

    Display stored entries in a sortable table (most recent first if implemented)

    Edit and delete records

This MVP is the foundation for future versions, including PWA support, charts, and export/import features.
2. File Structure
/energy-tracker-v1
│
├── index.html     # Main HTML structure
├── style.css      # Styling rules
├── config.js      # App configuration (rate, currency, DB name)
└── app.js         # Application logic (IndexedDB, CRUD operations)


3. Technology Stack
Technology	Usage
HTML5	Structure & form inputs
CSS3	Styling, layout, table formatting
JavaScript	Event handling, IndexedDB operations, DOM updates
IndexedDB	Persistent storage in browser
Config.js	Centralized configuration for constants
4. Features in v1
✅ Core Functionality

    Add new energy usage entry with:

        Present Month’s Energy (kWh)

        Last Month’s Energy (kWh)

        Auto-generated month, date, and time

    Store data locally using IndexedDB

    Display stored entries in a table

    Calculate:

        Delta = Present – Last Month

        Rate = Percentage change from last month

        Cost = Present × Energy Rate (from config.js)

    Edit and delete individual entries

✅ User Interface

    Minimal clean design

    Mobile-friendly table

    Action buttons for Edit and Delete
5. Configuration
   const CONFIG = {
  energyRatePerKWh: 0.12,   // cost per kWh
  currency: "$",            // currency symbol
  dbName: "energyTrackerDB",// IndexedDB database name
  dbVersion: 1,              // DB version
  storeName: "entries"       // Object store name

6. IndexedDB Structure

Database: energyTrackerDB
Version: 1
Object Store: entries
Key Path: id (auto-increment)
Stored Fields:

    id (Primary Key)

    energy (Number)

    last_energy (Number)

    month (String)

    date (String)

    time (String)
7.HTML Structure (index.html)
Key Sections:

    Form (#energy-form): Inputs for current and last month usage.

    Hidden Inputs: Month, Date, Time auto-generated.

    Table (#entry-list): Displays all stored entries with actions.
8.CSS Styling (style.css)
Typography: Monospace font for a data-oriented look.

Layout: Centered, max-width 830px card-style container.

Tables: Zebra-striping for readability.

Buttons: Styled add, edit, and delete buttons with hover states.

9.Data Flow
User Submits Form

    JavaScript captures values

    Hidden date/time/month fields auto-filled

    Entry is stored in IndexedDB

Display Function

    Reads all records from IndexedDB

    Sorts (optional: newest first)

    Updates table with calculated values

Edit/Delete

    Edit loads record into form

    Delete removes record by id
10. Known Limitations
    No input history visualization (charts)

No import/export functionality

No sorting by date implemented in DB index

Basic styling (no themes)

No offline PWA capabilities yet
