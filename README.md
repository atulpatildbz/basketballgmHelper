# Basketball GM Helper

A React-based web application that helps you analyze and compare player statistics across different seasons in Basketball GM. Built with React, TypeScript, and Vite.

## Features

- Upload player statistics from Basketball GM exports (CSV/XLSX/XLS)
- Compare player statistics between two selected seasons
- Track changes in player Overall ratings and Potential
- Color-coded player ratings for easy visualization
- Search and filter players by name
- Sort by any statistical category
- View individual player history across seasons

## Getting Started

1. Clone the repository
2. Install dependencies:
   ```bash
   npm install
   ```
3. Run the development server:
   ```bash
   npm run dev
   ```

## Usage

1. Click the file input button to upload your Basketball GM export file
2. Enter the two seasons you want to compare
3. Use the table to view player progression between the selected seasons
4. Filter players using the search box
5. Click on player names to view their complete history
6. Sort any column by clicking the column header

## Tech Stack

- React 18
- TypeScript
- Vite
- XLSX for file parsing
- React Select for search functionality
- Tailwind CSS for styling
