// Written by https://github.com/GitThirteen

import { writeFile } from 'fs/promises';
import { setTimeout as sleep } from 'timers/promises';

// ======== CONFIG ======== //

// 0 = Danbooru
// 1 = Gelbooru
const MODE = 0;

// ENTER YOUR USERNAME + API KEY HERE
// ATTENTION: MAKE SURE YOU PASS IN THE CORRECT CREDENTIALS DEPENDING ON THE SITE

// DANBOORU REQUIRES USERNAME + API_KEY (Found on Profile Page)
const DAN_USERNAME = ''; const DAN_API_KEY = '';
// GELBOORU REQUIRES USER_ID + API_KEY (Found in Account Options)
const GEL_USERNAME = ''; const GEL_API_KEY = '';

// Enter the tags you want to filter for here. Separate tags with a comma as seen below.
const TAGS = ['blue_archive', 'official_art'];

// Sleeps for 1 second after downloading a page to lower the chances of getting banned / timeouted / ratelimited.
// Disable only if you're feeling frisky.
const SLEEP_ENABLED = true;

// The page at which the download should start (and optionally, end).
// E.g., if the variable is set to 3, the booruloader will start downloading from page 3 onwards (3, 4, 5, ...).
// Change the END variable from Infinity to the page number you want to end at (inclusive). Leaving it at Infinity will download ALL pages.
// For downloading a single page, set both START and END to the same value (E.g., 1 for page 1).
const START = 1; const END = Infinity;

// ====== CONFIG END ====== //

// ************************ //
// !DO NOT TOUCH FROM HERE! //
// ************************ //

// ====== VALIDATION ====== //

const printErrorAndExit = (msg) => {
    console.error('\x1b[31m' + '[ERROR]' + '\x1b[0m' + ' ' + msg);
    process.exit(1);
}

if (typeof MODE !== 'number' || MODE < 0 || MODE > 2) {
    printErrorAndExit(`Config parameter 'MODE' contains an invalid value. Expected: 0, 1 (number). Actual: ${MODE} (${typeof MODE})`);
}

if (MODE === 0 && (!DAN_USERNAME || !DAN_API_KEY)) {
    printErrorAndExit(`Config parameter 'MODE' is set to 0 (Danbooru), but the Danbooru credentials are empty.`);
}

if (MODE === 1 && (!GEL_USERNAME || !GEL_API_KEY)) {
    printErrorAndExit(`Config parameter 'MODE' is set to 1 (Gelbooru), but the Gelbooru credentials are empty.`);
}

if (typeof START !== 'number' || START < 1) {
    printErrorAndExit(`Config parameter 'START' has to be greater or equal to 1 (number). Actual: ${START} (${typeof START})`);
}

if (typeof END !== 'number') {
    printErrorAndExit(`Config parameter 'END' has an invalid type. Expected: number. Actual: ${typeof END}`);
}

if (START > END) {
    printErrorAndExit(`Config parameter 'START' is greater than 'END'. Expected: START <= END. Actual: ${START} > ${END}`);
}

// ==== VALIDATION END ==== //

// ===== BOORULOADER ====== //

const DANBOORU_URL = Object.freeze('https://danbooru.donmai.us');
const GELBOORU_URL = Object.freeze('https://gelbooru.com/index.php');

(async () => {
    let i = START;

    /**
     * Attempts to fetch and download the image behind the URI.
     * @param {string} uri          the image URI to be fetched
     * @param {string} filename     the file name of the saved file
     */
    const download = async (uri, filename) => {
        return fetch(uri)
            .then(res => res.arrayBuffer())
            .then(data => writeFile(filename, Buffer.from(data)));
    }

    /**
     * Assembles the URL for the API call depending on the mode.
     * @param {number} mode         a number telling the function which service is used. 0 = Danbooru; 1 = Gelbooru; default = ''
     * @returns A formatted string that is compliant with the API syntax of the corresponding image service
     */
    const buildURL = (mode) => {
        switch(mode) { // Not pleasant to look at but it does its job
            case 0:
                return `${DANBOORU_URL}/posts.json?tags=${TAGS.join('+')}&login=${DAN_USERNAME}&api_key=${DAN_API_KEY}&page=${i}`;
            case 1:
                return `${GELBOORU_URL}?page=dapi&s=post&q=index&tags=${TAGS.join('+')}&user_id=${GEL_USERNAME}&api_key=${GEL_API_KEY}&pid=${(i - 1)}&json=1&limit=42`;
            default:
                return ''; // Should never happen
        }
    }

    while(true) {
        const url = buildURL(MODE);

        const response = await fetch(url, {
            method: 'GET',
                mode: 'cors',
                cache: 'no-cache',
                headers: {
                    'Content-Type': 'application/json',
                    'User-Agent': `Booru user ${MODE === 0 ? DAN_USERNAME : GEL_USERNAME}` // in case we overdo it so the mods know who to yell at
                }
        });

        let responseJson = await response.json();

        if (MODE === 1) {
            responseJson = responseJson.post;
        }

        if (i > END || !responseJson || !Object.keys(responseJson).length) {
            break;
        }

        const activeDownloads = [];
        for (const image of Object.values(responseJson)) {
            if (!image.file_url) {
                console.warn('\x1b[33m' + '[WARN]' + '\x1b[0m' + ` Couldn't download post with id ${image.id}.`);
                continue;
            }

            const d = download(
                image.file_url, 
                `${image.id}.${image.file_ext || image.file_url.split('.').pop()}`
            );
            activeDownloads.push(d);
        }

        await Promise.all(activeDownloads)
            .then(() => console.log('\x1b[37m' + '[INFO]' + '\x1b[0m' + ` Downloaded ${activeDownloads.length}/${responseJson.length} posts on page ${i}`));

        if (SLEEP_ENABLED) {
            await sleep(1000); // Sleep for 1 second so the API doesn't kill us
        }

        i++;
    }

    console.log('\x1b[32m' + '[SUCCESS]' + '\x1b[0m' + ' Done!');
})();