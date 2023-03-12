# Booruloader

A (not so) small JS script for batch-downloading images from Booru services.

[![forthebadge](https://forthebadge.com/images/badges/uses-js.svg)](https://forthebadge.com) [![forthebadge](https://forthebadge.com/images/badges/gluten-free.svg)](https://forthebadge.com)

## How to use:
1. Download nodeJS (15+) if you haven't already: https://nodejs.org/en/
2. Download and move the booruloader.js into a folder of choice
3. Open the script and set up the config with the required data
4. Run the file from the console via `node <filename>.mjs` (e.g., `node booruloader.mjs`)
5. Weeeeee

## Known Bugs:
- Gelbooru may throw an ECONNRESET or Connection timeout error at your face after the download of a page has finished. Alter the `START` variable in the config accordingly if you run into such error to avoid having to redownload everything from the beginning for now.
