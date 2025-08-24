# energy-tracker
The Monthly Energy Tracker v1 is a single-page web application (SPA) built with HTML5, CSS3, and JavaScript using IndexedDB for local persistence.

23/8/25
## Iteration 2.1 – Pagination Feature

This update introduces pagination for the entries table so that
large datasets are easier to browse. Instead of showing all saved
entries at once, the app now splits them into smaller pages.

### Key Details
- Pagination controls are displayed below the entries table.
- Users can navigate between pages (3,6,12,24).
- The number of entries per page is fixed via a select html control (configurable in code).
- Ensures that even with hundreds of records, performance and
  readability remain consistent.

### How Pagination Works
1. When entries are retrieved from IndexedDB, they are split into
   pages according to the defined "page size".
2. Only the current page of entries is rendered in the table.
3. Pagination buttons update the displayed subset of entries.

### Benefits
- Better performance with larger datasets.
- Cleaner and more organized table display.
- Easier navigation through historical data.

---

## Updated File Structure (including pagination)

monthly-energy-tracker/
│
├── index.html     # Includes navigation menu, pagination controls,
│                  # and import/export sections
├── style.css      # Styling for layout, dropdown, table, pagination
├── config.js      # Config constants (rate, currency, DB settings,
│                  # page size)
├── app.js         # IndexedDB CRUD + Import/Export + Pagination
└── README.md      # Project documentation


## Iteration 2 – New Features

This version extends the MVP (v1) by introducing data management
capabilities via a navigation menu.

### Key Additions
- Navigation Menu
  - Added a top navigation bar with a dropdown menu labeled
    "Manage Entries".
  - Provides easy access to Import and Export features.

- Export Data
  - Users can download all saved entries as a `.json` file.
  - Exported file contains all IndexedDB records in structured JSON.
  - File can later be re-imported into the app (see below).

- Import Data
  - Users can import previously exported `.json` files.
  - Entries are added into IndexedDB, avoiding duplicate IDs.
  - Validates file format and shows success/error messages.

- UI Enhancements
  - Dedicated `<section>` elements for Import and Export with
    explanatory text.
  - Dropdown styling for nested menu items.
  - Footer added with copyright.

### Updated File Structure

monthly-energy-tracker/
│
├── index.html     # Includes navigation menu + import/export sections
├── style.css      # Styling for menu, dropdown, and custom file input
├── config.js      # Config constants (rate, currency, DB settings)
├── app.js         # IndexedDB CRUD + Import/Export logic
└── README.md      # Project documentation

### How to Use Import/Export

1. Export
   - Navigate to "Manage Entries → Export".
   - Click "Export" → A `energy_data.json` file will download.

2. Import
   - Navigate to "Manage Entries → Import".
   - Select a valid `.json` file exported from this app.
   - On success, entries appear in the table.

---

## Next Steps (Planned Iteration 3)

- Pagination features
- Server side persistence
- Authentication and Autorization
- energy usage charts
- Multiuser feature

