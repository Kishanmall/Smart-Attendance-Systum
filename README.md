# Smart Attendance System — B.Tech CSC (AI-ML)

An offline, roll-number-wise attendance mini project for Maharana Institute of Professional Studies, Kanpur. Open `index.html` in Chrome or Edge; no server or installation is required.

## Features

- Faculty/Admin login page with campus image
- A default batch of 65 students: `2503491530060` through `2503491530124`, with the provided names entered from roll number `0060` onward
- Add students with roll number, full name, and section
- Import multiple students from CSV
- Mark Present or Absent by date
- Mark every student Present with one click
- Download daily attendance and date-range reports as CSV
- Auto-save data in browser local storage

## CSV format

```csv
Roll No,Name,Section
23CS001,Aarav Sharma,AI-ML A
23CS002,Ananya Singh,AI-ML A
```

> Clearing browser data can remove saved attendance. Download the CSV report before a submission or demo.

## Use on a mobile phone

The app already adapts to mobile screens. Copy the complete project folder to a phone and open `index.html` in a browser for basic offline use.

For the best experience, upload the folder to any static HTTPS host (for example, GitHub Pages or Netlify). Open the generated website URL in Chrome on Android, then use the browser menu and select **Install app** or **Add to Home screen**. The installed app works offline after its first successful load.
