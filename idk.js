const config = require('./config.json');
const { v4: uuidv4 } = require('uuid');
var Twitter = require('twitter');
var client = new Twitter({
  consumer_key: config.twitterauth.apikey,
  consumer_secret: config.twitterauth.apisecretkey,
  access_token_key: config.twitterauth.accesstoken,
  access_token_secret: config.twitterauth.accesstokensecret
});
var games = {};
var tweets = [];

function getRandom(arr, n) {
  var result = new Array(n),
    len = arr.length,
    taken = new Array(len);
  if (n > len)
    throw new RangeError("getRandom: more elements taken than available");
  while (n--) {
    var x = Math.floor(Math.random() * len);
    result[n] = arr[x in taken ? taken[x] : x];
    taken[x] = --len in taken ? taken[len] : len;
  }
  return result;
}

exports.index = (req, res) => {
  res.render('index');
}

exports.play = (req, res) => {
  res.render('play');
}

exports.playclassic = (req, res) => {
  res.render('playclassic');
}

exports.startgame = (req, res) => {
  var theid = uuidv4();
  games[theid] = {};
  return res.send({gameid: theid});
}

exports.gettweets = (req, res) => {
  var theid = req.headers.authentification;
  if(!theid){
    return res.send({error:401, msg:"game_not_given"});
  }
  if(!(theid in games)){
    return res.send({error:401, msg:"game_doesnt_exist"});
  }
  var thetweets = getRandom(tweets, 30);
  delete games[theid];
  return res.send({tweets:thetweets});
}

var stream = client.stream('statuses/filter', {track: 'twitter', language: 'en', filter: 'safe'});

stream.on('data', function(event) {
if(event.created_at){
  if(event.error){
    return console.error(event);
  }
  if(!event.retweeted_status && !event.quoted_status && !event.in_reply_to_user_id && !event.possibly_sensitive){
    tweets.unshift(event);
    if(tweets.length>250){
      tweets.pop();
    }
  }
}else{
  // return console.log(event);
}
});

stream.on('error', function(error) {
  console.error(error);
});
