# TechPick Laptop Comparison UI

A static frontend demo for comparing two laptops side by side.

## Features

- Select two products to compare
- Side-by-side table of price, rating, brand, specs, and value
- Highlights the stronger product for each feature

## Usage

1. Open `index.html` in a browser.
2. Choose two products from the dropdown selectors.
3. The table updates automatically and highlights better values.

> Note: the page attempts to load product data from `laptop.csv`. If opening from `file://` does not work, use a local server such as `python -m http.server` or `npx serve`.

## Files

- `index.html` — page structure
- `styles.css` — styling and responsive layout
- `script.js` — product logic and comparison scoring
