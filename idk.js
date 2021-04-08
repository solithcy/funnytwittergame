const config = require('./config.json');
const { v4: uuidv4 } = require('uuid');
const pjson = require('./package.json');
const twitterlogin = require('login-with-twitter');
const tw = new twitterlogin({
  consumerKey: config.loginauth.apikey,
  consumerSecret: config.loginauth.apisecretkey,
  callbackUrl: 'https://whotweeted.me/login'
});
var Twitter = require('twitter');
var client = new Twitter({
  consumer_key: config.twitterauth.apikey,
  consumer_secret: config.twitterauth.apisecretkey,
  access_token_key: config.twitterauth.accesstoken,
  access_token_secret: config.twitterauth.accesstokensecret
});
var bidenclient = new Twitter({
  consumer_key: config.bidenauth.apikey,
  consumer_secret: config.bidenauth.apisecretkey,
  access_token_key: config.bidenauth.accesstoken,
  access_token_secret: config.bidenauth.accesstokensecret
});
var catclient = new Twitter({
  consumer_key: config.catauth.apikey,
  consumer_secret: config.catauth.apisecretkey,
  access_token_key: config.catauth.accesstoken,
  access_token_secret: config.catauth.accesstokensecret
});
var games = {};
var tweets = [];
var bidentweets = [];
var cattweets = [];

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
  res.render('index', {version: pjson.version});
}

exports.play = (req, res) => {
  res.render('play', {version: pjson.version});
}

exports.playclassic = (req, res) => {
  res.render('playclassic', {version: pjson.version});
}

exports.playbiden = (req, res) => {
  res.render('playbiden', {version: pjson.version});
}

exports.playcat = (req, res) => {
  res.render('playcat', {version: pjson.version});
}

exports.how = (req, res) => {
  return res.render("how", {version: pjson.version, onhow:true})
}

exports.login = (req, res) => {
  if(req.query.oauth_token&&req.query.oauth_verifier){
    tw.callback({
      oauth_token: req.query.oauth_token,
      oauth_verifier: req.query.oauth_verifier
    }, req.session.tokenSecret, (err, user) => {
      if (err) {
        return res.redirect('/login');
      }
      delete req.session.tokenSecret;
      var toredirect = req.session.redirect || '/';
      delete  req.session.redirect;
      req.session.user = user;
      console.log(user);
      res.redirect(toredirect);
    });
  }else{
    tw.login((err, tokenSecret, url) => {
      if (err) {
        return res.redirect('/');
      }
      req.session.tokenSecret = tokenSecret;
      req.session.redirect = req.query.redirect || undefined;
      res.redirect(url);
    });
  }
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
  try{
    var thetweets = getRandom(tweets, 30);
  }catch{
    res.status(500);
    return res.send({error:500, msg:"not_enough_tweets", amount:tweets.length, needed:30})
  }
  delete games[theid];
  return res.send({tweets:thetweets});
}

exports.gettweetsbiden = (req, res) => {
  var theid = req.headers.authentification;
  if(!theid){
    return res.send({error:401, msg:"game_not_given"});
  }
  if(!(theid in games)){
    return res.send({error:401, msg:"game_doesnt_exist"});
  }
  try{
    var thetweets = getRandom(bidentweets, 15);
  }catch{
    res.status(500);
    return res.send({error:500, msg:"not_enough_tweets", amount:bidentweets.length, needed:15})
  }
  delete games[theid];
  return res.send({tweets:thetweets});
}

exports.gettweetscats = (req, res) => {
  var theid = req.headers.authentification;
  if(!theid){
    return res.send({error:401, msg:"game_not_given"});
  }
  if(!(theid in games)){
    return res.send({error:401, msg:"game_doesnt_exist"});
  }
  try{
    var thetweets = getRandom(cattweets, 15);
  }catch{
    res.status(500);
    return res.send({error:500, msg:"not_enough_tweets", amount:cattweets.length, needed:15})
  }
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
  console.error("classic error");
});

var bidenstream = bidenclient.stream('statuses/filter', {track: 'biden', language: 'en', filter: 'safe'});
bidenstream.on('data', function(event) {
if(event.created_at){
  if(event.error){
    return console.error(event);
  }
  if(!event.retweeted_status && !event.quoted_status && !event.in_reply_to_user_id && !event.possibly_sensitive){
    bidentweets.unshift(event);
    if(bidentweets.length>250){
      bidentweets.pop();
    }
  }
}else{
  // return console.log(event);
}
});
bidenstream.on('error', function(error) {
  console.error(error);
  console.error("biden error");
});

var catstream = catclient.stream('statuses/filter', {track: 'cat', language: 'en', filter: 'safe'});
  catstream.on('data', function(event) {
  if(event.created_at){
    if(event.error){
      return console.error(event);
    }
    if(!event.retweeted_status && !event.quoted_status && !event.in_reply_to_user_id && !event.possibly_sensitive){
      cattweets.unshift(event);
      if(cattweets.length>250){
        cattweets.pop();
      }
    }
  }else{
    // return console.log(event);
  }
});
catstream.on('error', function(error) {
  console.error(error);
  console.error("cat error");
});
