const axios = require("axios");
const dotenv = require("dotenv");
const express = require('express');
const app = express();
dotenv.config();

app.use(function(req, res, next) {
    res.header("Access-Control-Allow-Origin", "*");
    next();
});

app.get('/', (req, res) => {
    res.send('Hello World!')
  })

const port = 9999;
app.listen(port, () => {
    console.log("Server listening on port %s", port);
});

app.get("/search", async function(req, res) {
    // res.set({ 'Access-Control-Allow-Origin': '*' });
    const response = await searchYoutubeVideos(req.query);
    res.send(response);
});

async function searchYoutubeVideos(requestQuery) {
    const params = {
        key: process.env.YOUTUBE_API_KEY,
        maxResults: 50,
        order: requestQuery.order,
        part: "snippet",
        q: requestQuery.word,
        type: "video",
    };

    try {
        const response = await axios({
            method: "GET",
            url: process.env.YOUTUBE_API_URL,
            params: params,
        });

        return response.data.items.map(function(item) {
            return {
                id: item.id.videoId,
                title: item.snippet.title,
                imageUrl: item.snippet.thumbnails.default.url,
            };
        });
    } catch (error) {
        console.log("server error" + error);
    }
}