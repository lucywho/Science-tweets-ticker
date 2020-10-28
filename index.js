const express = require("express");
const app = express();
let { getToken, getTweets, filterTweets } = require("./twitter.js");
const util = require("util");
getToken = util.promisify(getToken);
getTweets = util.promisify(getTweets);

app.use(express.static("ticker"));

app.get("/data.json", (req, res) => {
    getToken()
        .then((bearerToken) => {
            Promise.all([
                getTweets(bearerToken, "newscientist"),
                getTweets(bearerToken, "nature"),
                getTweets(bearerToken, "ScienceMagazine"),
            ])
                .then((result) => {
                    const mergedResults = [
                        ...result[0],
                        ...result[1],
                        ...result[2],
                    ];
                    const sortedTweets = mergedResults.sort((a, b) => {
                        return new Date(b.created_at) - new Date(a.created_at);
                    });

                    return sortedTweets;
                })
                .then((sortedTweets) => {
                    filteredTweets = filterTweets(sortedTweets);

                    res.json(filteredTweets);
                })
                .catch((err) => console.log("error: ", err));
        })
        .catch((err) => {
            console.log("error in getToken: ", err);
            res.sendStatus(500);
        });
});

//app.listen(8080, () => console.log("proms twitter ticker server running"));

app.listen(process.env.PORT || 8080);
