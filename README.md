# Booruloader

A (not so) small JS script for batch-downloading posts (images, gifs, videos) from Booru services.

[![forthebadge](https://forthebadge.com/images/badges/uses-js.svg)](https://forthebadge.com) [![forthebadge](https://forthebadge.com/images/badges/gluten-free.svg)](https://forthebadge.com)

## Requirements
- NodeJS 15+

## Available Services
- Danbooru
- Gelbooru

## How To Use
1. Download nodeJS (15+) if you haven't already: https://nodejs.org/en/
2. Download and move the `booruloader.mjs` into a folder of your choice
3. Open the script and set up the config with the required data
4. Run the file from the console via `node <filename>.mjs` (e.g., `node booruloader.mjs`)
5. Weeeeee

## Known Bugs
- Gelbooru may throw an ECONNRESET or Connection timeout error at your face after the download of a page has finished. This may have to do with an overloaded server on their side, a bad internet connection, an old NodeJS version or the account associated with the Gelbooru credentials being too new. Alter the `START` variable in the config accordingly if you run into such error to avoid having to redownload everything from the beginning for now.

## License
Booruloader is available under the [MIT license](https://opensource.org/license/mit/). See [LICENSE](https://github.com/GitThirteen/Booruloader/blob/main/LICENSE) for the full license text.
