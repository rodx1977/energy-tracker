# energy-tracker
The Monthly Energy Tracker v1 is a single-page web application (SPA) built with HTML5, CSS3, and JavaScript using IndexedDB for local persistence.
This webapp helps the user to keep track of the monthly energy usage by typing in the number shown in the energy utility meter.
All records are shown in grid view with useful insights as %rate change, KW/H difference from last month, and the aprox. cost of present energy bill.

9/10/2025
## Iteration 1.5.1 - Settings
Energy Tracker now asks for: 
your name if there is none configured in the beginning. 
Asks for your goals in costs or kw consumed
asks for the hottests and coolest months in the year in your region
check if you want to get notifications when you need to feed a new energy measure
asks for the day your utility company usually bills
asks for the day you need to feed the energy measure and if notifications are enabled it will notify


20/9/2025

## Iteration 1.4.1 - Mobile friendly features
Energy Tracker is now mobile friendly! By using Media Queries the experience in cellphones and tablets are fluid.

30/8/25

## Iteration 1.4 - Datacharts

This update presentes a chart option in the menu. The user can compare kw consumption across the month in a 12 month span. There is cost in US dollars as well in a 12 month span as an option in the chart

## Iteration 1.3 - Las month energy entry feature

This update allows the user to be presented with the last month energy measure.This keeps the user from typing again this value and giving way to errors
Also it corrects a bug found when in editin mode and updates some texts and confirmation messages in the app flow.


23/8/25
## Iteration 1.2 – Pagination Feature

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


## Iteration 1.1 – New Features

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

## Next Steps (Planned Iterations) 
- Settings Module
- User online manual
- PWA application

