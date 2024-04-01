import {
    getSearch,
    getAnime,
    getRecentAnime,
    getPopularAnime,
    getEpisode,
    GogoDLScrapper,
    getGogoAuthKey,
} from "./gogo";

import {
    getAnilistTrending,
    getAnilistSearch,
    getAnilistAnime,
    getAnilistUpcoming,
} from "./anilist";
import { SaveError } from "./errorHandler";
import { increaseViews } from "./statsHandler";

let CACHE = {};
let HOME_CACHE = {};
let ANIME_CACHE = {};
let SEARCH_CACHE = {};
let REC_CACHE = {};
let RECENT_CACHE = {};
let GP_CACHE = {};
let AT_CACHE = {};

// For Fixing CORS issue
// CORS Fix Start

const corsHeaders = {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Methods": "GET, HEAD, POST, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type",
};

function handleOptions(request) {
    if (
        request.headers.get("Origin") !== null &&
        request.headers.get("Access-Control-Request-Method") !== null &&
        request.headers.get("Access-Control-Request-Headers") !== null
    ) {
        return new Response(null, {
            headers: corsHeaders,
        });
    } else {
        return new Response(null, {
            headers: {
                Allow: "GET, HEAD, POST, OPTIONS",
            },
        });
    }
}

// CORS Fix End

export default {
    async fetch(request, env, ctx) {
        if (request.method === "OPTIONS") {
            // Handle CORS preflight requests
            return handleOptions(request);
        } else if (
            request.method === "GET" ||
            request.method === "HEAD" ||
            request.method === "POST"
        ) {
            const url = request.url;

             if (url.includes("/download/")) {
                const headers = request.headers;
                await increaseViews(headers);

                const query = url.split("/download/")[1];
                const timeValue = CACHE["timeValue"];
                const cookieValue = CACHE["cookieValue"];

                let cookie = "";

                if (timeValue != null && cookieValue != null) {
                    const currentTimeInSeconds = Math.floor(Date.now() / 1000);
                    const timeDiff = currentTimeInSeconds - timeValue;

                    if (timeDiff > 10 * 60) {
                        cookie = await getGogoAuthKey();
                        CACHE.cookieValue = cookie;
                    } else {
                        cookie = cookieValue;
                    }
                } else {
                    const currentTimeInSeconds = Math.floor(Date.now() / 1000);
                    CACHE.timeValue = currentTimeInSeconds;
                    cookie = await getGogoAuthKey();
                    CACHE.cookieValue = cookie;
                }

                const data = await GogoDLScrapper(query, cookie);

                const json = JSON.stringify({ results: data });
                return new Response(json, {
                    headers: { "Access-Control-Allow-Origin": "*", Vary: "Origin" },
                });
            }   // MISSING CLOSING BRACE AND PARENTHESIS HERE
            const text = 'hoip this is some random qi whcih does random things
            return new Response(text, {
                headers: {
                    "content-type": "text/html",
                    "Access-Control-Allow-Origin": "*",
                    Vary: "Origin",
                },
            });
        } else {
            return new Response(null, {
                status: 405,
                statusText: "Method Not Allowed",
            });
        }
    },
};
