// Written by https://github.com/GitThirteen

const fs = require('fs/promises');

const DANBOORU_URL = Object.freeze('https://danbooru.donmai.us');
const GELBOORU_URL = Object.freeze('https://gelbooru.com/index.php');

// ======================== //
// ======== CONFIG ======== //

// 0 = Danbooru
// 1 = Gelbooru
const MODE = 1;

// ENTER YOUR USERNAME + API KEY HERE
// ATTENTION: MAKE SURE YOU PASS IN THE CORRECT CREDENTIALS DEPENDING ON THE SITE
// DANBOORU REQUIRES USERNAME + API_KEY (Found on Profile Page)
// GELBOORU REQUIRES USER_ID + API_KEY (Found in Account Options)
const USERNAME = '';
const API_KEY = '';

// Enter the tags you want to filter for here. Separate tags with a comma as seen below.
const TAGS = ['blue_archive', 'official_art'];

// Sleeps for 2 seconds after downloading a page to lower the chances of getting banned / timeouted / ratelimited.
// Disable only if you're feeling frisky.
const SLEEP_ENABLED = true;

// The page at which the download should start.
// E.g., if the variable is set to 3, the booruloader will start downloading from page 3 onwards (3, 4, 5, ...).
const START = 1;

// ====== CONFIG END ====== //

(async () => {
    let i = START;

    /**
     * Attempts to fetch and download the image behind the URI.
     * @param {string} uri          the image URI to be fetched
     * @param {string} filename     the file name of the saved file
     * @param {Function} callback   a callback function called after the image has been written into the folder
     */
    const download = async (uri, filename, callback) => {
        fetch(uri)
            .then(res => res.arrayBuffer())
            .then(data => fs.writeFile(filename, Buffer.from(data)))
            .then(callback());
    }

    /**
     * Assembles the URL for the API call depending on the mode.
     * @param {number} mode         a number telling the function which service is used. 0 = Danbooru; 1 = Gelbooru; default = ''
     * @returns A formatted string that is compliant with the API syntax of the corresponding image service
     */
    const buildURL = (mode) => {
        switch(mode) { // Not pleasant to look at but it does its job
            case 0:
                return `${DANBOORU_URL}/posts.json?tags=${TAGS.join('+')}&login=${USERNAME}&api_key=${API_KEY}&page=${i}`;
            case 1:
                return `${GELBOORU_URL}?page=dapi&s=post&q=index&tags=${TAGS.join('+')}&user_id=${USERNAME}&api_key=${API_KEY}&pid=${(i - 1)}&json=1&limit=42`;
            default:
                return '';
        }
    }

    const sleep = (millis) => {
        return new Promise(resolve => setTimeout(resolve, millis));
    }

    while(true) {
        const url = buildURL(MODE);

        const response = await fetch(url, {
            method: 'GET',
                mode: 'cors',
                cache: 'no-cache',
                headers: {
                    'Content-Type': 'application/json',
                    'User-Agent': `Booru user ${USERNAME}` // in case we overdo it so the mods know who to yell at
                }
        });

        let responseJson = await response.json();

        if (MODE === 1) {
            responseJson = responseJson.post;
        }

        if (!responseJson || !Object.keys(responseJson).length) {
            break;
        }

        for (let [j, image] of Object.entries(responseJson)) {
            if (!image.file_url) {
                console.error(`[ERROR] Couldn't download post with id ${image.id}.`);
                continue;
            }

            await download(
                image.file_url, 
                `${image.id}.${image.file_ext || image.file_url.split('.').pop()}`,
                () => console.log(`[INFO] Downloaded image ${Number(j) + 1}/${responseJson.length} on page ${i}`)
            );
        }

        if (SLEEP_ENABLED) {
            await sleep(2000); // Sleep for 2 seconds so the API doesn't kill us
        }
        i++;
    }

    console.log('[SUCCESS] Done!');
})();