# Unimak Campus Trade (Ucampt) — Mini Project

Simple client-side marketplace admin demo used for a Web Programming mini project.

## Summary

This project is a static HTML/CSS/JS demo of a small marketplace with an Administrator dashboard for managing listings.

## Key Features

- Admin Dashboard with listing table (edit / delete)
- Create Listing form — publishes a temporary listing (stored in sessionStorage)
- Edit listings inline (Edit → Save / Cancel)
- Delete listings from the dashboard
- Notifications (created/updated/deleted) shown via a bell icon (sessionStorage)
- Simple admin login that redirects to `adminDashboard.html` (demo password: `stack001`)

## Files/Structure

- `adminDashboard.html` — admin interface, shows managed listings
- `createListing.html` — form to create a new listing (image is saved as DataURL in sessionStorage)
- `adminLogin.html`, `forgotPassword.html` — auth UI (client-side only)
- `js/main.js` — application logic (search, view-details, admin handlers, edit/delete, notifications)
- `css/style.css` — project styles
- `images/` — image assets

## How to run

1. Open `adminLogin.html` (or `index.htm`) in your browser. No server is required — files are static.
2. Login with any email and password `stack001` to access the dashboard (demo only).
3. Use `Create Listing` to add a temporary listing. After publishing you'll be redirected to the dashboard where the listing appears.

Notes:
- Listings created via `createListing.html` are stored in `sessionStorage` and will be cleared when the browser tab is closed.
- Notifications are stored in `sessionStorage` and shown when clicking the notification icon.

## Editing / Deleting

- Click `Edit` in a listing row to make Title / Price / Category editable. Click `Save` to apply changes or `Cancel` to revert.
- Click `Delete` to remove a listing from the table. Deletions generate a notification.

## Development notes & next steps

- To persist data across sessions, switch from `sessionStorage` to `localStorage` or implement a simple backend API.
- To send actual password-reset emails, integrate a server-side endpoint/service.
- Consider adding validation, accessibility improvements, and form previews for uploaded images.

## Contact / Author
## Contributors

- Mohamed Sillah
- Abdul Deen Kamara
- Edward Chester Kargbo
- Mohamed Kamara
- Mustapha Sankoh
- Sylvia Ramatu Koroma
- Fatmata Bah

# Github Link

https://github.com/Mohamed-Sillah/ucampt.git