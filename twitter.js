const https = require("https");
const { API_key, API_secret_key } = require("./secrets.json");

module.exports.getToken = (callback) => {
    let creds;

    if (process.env.NODE_ENV == "production") {
        creds = `${process.env.API_key}:${process.env.API_secret_key}`;
    } else {
        creds = `${API_key}:${API_secret_key}`;
    }

    let encodedCreds = Buffer.from(creds).toString("base64");

    const options = {
        host: "api.twitter.com",
        path: "/oauth2/token",
        method: "POST",
        headers: {
            Authorization: `Basic ${encodedCreds}`,
            "Content-Type": "application/x-www-form-urlencoded;charset=UTF-8",
        },
    };

    const cb = function(response) {
        if (response.statusCode != 200) {
            console.log(
                "twitter.js, cb response status: ",
                response.statusCode
            );
        }
        let body = "";
        response.on("data", (chunk) => {
            body += chunk;
        });

        response.on("end", () => {
            let parsedBody = JSON.parse(body);

            callback(null, parsedBody.access_token); //null means "no error"
        });
    };
    const req = https.request(options, cb);

    req.end("grant_type=client_credentials");
};

module.exports.getTweets = (bearerToken, twitterName, callback) => {
    const tweetOptions = {
        host: "api.twitter.com",
        path: `/1.1/statuses/user_timeline.json?screen_name=${twitterName}&tweet_mode=extended&include_rts=false&exclude_replies=true`,
        method: "GET",
        headers: {
            Authorization: "Bearer " + bearerToken,
        },
    };

    const cb2 = function(response) {
        if (response.statusCode != 200) {
            console.log("twitter.js, cb2 resp status: ", response.statusCode);
            callback(response.statusCode);
        }

        let tweets = "";

        response.on("data", (chunk) => {
            tweets += chunk;
        });

        response.on("end", () => {
            let parsedTweets = JSON.parse(tweets);
            callback(null, parsedTweets);
        });
    };

    const req = https.request(tweetOptions, cb2);
    req.end();
};

module.exports.filterTweets = (tweets) => {
    let tweetArray = [];
    for (let i = 0; i < tweets.length; i++) {
        let url = "";

        if (tweets[i].entities.urls.length > 0) {
            url = tweets[i].entities.urls[0].url;
        }

        let fulltext = tweets[i].full_text;
        let splittext = fulltext.split("http", 2);
        let text = splittext[0];

        tweetArray.push({ text, url });
    }

    return tweetArray;
};
