# Toast Receipt Splitter

A simple SvelteKit app to split a Toast receipt just from the link, item-by-item, allowing you to easily share the cost of a meal with friends.

## Features

- Automatically imports receipt items from a Toast receipt link, including the number of guests (if available), tax, tip, and fees/surcharges.
- Quickly provide names for each guest and assign items to one or more guests.
- Automatically calculates the total for each guest, including their portion of tax and tip.
- Generates a shareable QR code and link for the split receipt.

## Developing

Once you've cloned the repo and installed dependencies with `npm install`, start a development server:

```bash
npm run dev

# or start the server and open the app in a new browser tab
npm run dev -- --open
```

## Building

To create a production version of the app:

```bash
npm run build
```

You can preview the production build with `npm run preview`.

To deploy to cPanel, run:

```bash
npm run build:cpanel
```

This will create a `to_upload.tar` that you can upload to your cPanel account and then extract it to your Node.js application directory. Set the startup file to `index.cjs` in your cPanel Node.js application settings.
