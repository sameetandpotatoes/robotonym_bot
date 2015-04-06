var express = require("express");
var app = express();
var port = Number(process.env.PORT || 5000);
app.listen(port, function() {
  console.log("Listening on " + port);
});

var http = require('https');
var request = require("request");
var settings = require('./config1');
var TwitterBot = require("node-twitterbot").TwitterBot;
var bot = new TwitterBot(settings.twitterAccess);

var headers = {
  "User-Agent": settings.screenName,
  "ETag": "a18c3bded88eb5dbb5c849a489412bf3"
};

var ninegag_options = {
  'url': 'http://infinigag.eu01.aws.af.cm/trending/0/',
  "headers": headers
};

function tweet(text){
  bot.tweet(text);
  console.log("Tweeted: " + text);
}

function tweet_reddit(){
  var reddit = require('redwrap');
  tweets = [];
  //Randomly pick a 'hot' topic on reddit
  reddit.list().hot().exe(function(err, data, res){
    var raw_data = JSON.parse(res["body"]);
    for (var i = 0; i < raw_data["data"]["children"].length; i++){
      var trend = raw_data["data"]["children"][i]["data"];
      if (trend["url"].indexOf("imgur") >= 0)
        tweets.push(trend["title"] + " ~ " + trend["url"]);
    }
    tweet(tweets[Math.floor(Math.random() * tweets.length)]);
  });
}
function ninegag_tweet(err, res, body){
  try {
    if (res.statusCode !== 304) {
      var raw_data = JSON.parse(body);
      var tweets = [];
      var url = raw_data["data"][0]["images"]["large"];
      url.replace('\/', "/");
      var caption = raw_data["data"][0]["caption"];
      tweet(caption + " ~ " + url);
    }
  } catch (e) {
    console.log("ERROR: " + e.message);
  }
}
function randomly_tweet(rand){
  if (rand <= 0.50){
    console.log("9GAG");
    request(ninegag_options, ninegag_tweet);
  }
  else{
    console.log("Reddit");
    tweet_reddit();
  }
}
// Main program starts here
setInterval(function(){
  randomly_tweet(Math.random());
}, 900000);
