const config = require('./config.json');
const { v4: uuidv4 } = require('uuid');
const pjson = require('./package.json');
const twitterlogin = require('login-with-twitter');
var sqlite3 = require('sqlite3').verbose();
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
var db = new sqlite3.Database('data.db');

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

exports.thankyou = (req, res) => {
  return res.render("thankyou", {version: pjson.version})
}

exports.playendless = (req, res) => {
  if(!req.session.user){
    return res.render("playendless", {version:pjson.version});
  }
  return res.render("needslogin", {version:pjson.version});
}

exports.getleaderboard = (req, res) => {
  db.serialize(function() {
    db.all("SELECT * FROM leaderboard ORDER BY score desc, time asc LIMIT 15", function(err, data){
      return res.send({leaderboard:data});
    });
  });
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
      delete req.session.redirect;
      req.session.user = user;
      res.redirect(toredirect);
    });
  }else{
    tw.login((err, tokenSecret, url) => {
      if (err) {
        return res.redirect('/');
      }
      req.session.tokenSecret = tokenSecret;
      if(req.query.redirect){
        req.session.redirect = decodeURIComponent(req.query.redirect);
      }
      res.redirect(url);
    });
  }
}

exports.startgame = (req, res) => {
  var theid = uuidv4();
  if(req.query.endless){
    req.session.endless = {score:0, time:new Date().getTime(), lives:1};
  }
  else{
    games[theid] = {};
  }
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

exports.gettweetsendless = (req, res) => {
  var theid = req.headers.authentification;
  if(!(req.session.endless)){
    return res.send({error:401, msg:"game_doesnt_exist"});
  }
  if(req.session.endless.currenttweets){
    res.send({tweets:req.session.endless.currenttweets, lives:req.session.endless.lives});
    return;
  }
  try{
    var thetweets = getRandom(tweets, 3);
  }catch{
    res.status(500);
    return res.send({error:500, msg:"not_enough_tweets", amount:tweets.length, needed:30})
  }
  req.session.endless.currenttweets = thetweets;
  res.send({tweets:thetweets, lives:req.session.endless.lives});
  function decodeHTMLEntities(text) {
      var entities = [
          ['amp', '&'],
          ['apos', '\''],
          ['#x27', '\''],
          ['#x2F', '/'],
          ['#39', '\''],
          ['#47', '/'],
          ['lt', ''],
          ['gt', ''],
          ['nbsp', ' '],
          ['quot', '"']
      ];
      for (var i = 0, max = entities.length; i < max; ++i)
          text = text.replace(new RegExp('&'+entities[i][0]+';', 'g'), entities[i][1]);
      return text;
  }
  var totype = thetweets[0].text;
  if(thetweets[0].extended_tweet){
    totype=thetweets[0].extended_tweet.full_text;
  }
  totype = totype.replace(/(?:https?|ftp):\/\/[\n\S]+/g, '');
  setTimeout(function(){
    if(req.session.endless){
      return;
    }
    if(!req.session.endless.currenttweets){
      return;
    }
    if(req.session.endless.currenttweets[0].id_str==thetweets[0].id_str){
      req.session.endless.disqualified=true;
    }
  }, ((35*decodeHTMLEntities(totype).length)+250)+17500);
}

exports.endlessguess = (req, res) => {
  var theid = req.headers.authentification;
  if(!(req.session.endless)){
    return res.send({error:401, msg:"game_doesnt_exist"});
  }
  if(!req.headers.tweetid){
    return res.send({error:401, msg:"tweet_not_given"});
  }
  if(req.headers.tweetid == req.session.endless.currenttweets[0].id_str){
    req.session.endless.score++;
    delete req.session.endless.currenttweets;
    return res.send({correct:true, score:req.session.endless.score});
  }else{
    res.send({correct:false, score:req.session.endless.score});
    if(req.session.endless.disqualified){
      return;
    }
    db.serialize(function() {
      db.run("INSERT INTO leaderboard(userid, username, score, time) VALUES (?, ?, ?, ?)", [req.session.user.userId, req.session.user.userName, req.session.endless.score, new Date().getTime()-req.session.endless.time], function(data){
        req.session.endless.ended = true;
      });
    });
  }
}

exports.endlessdisqualify = (req, res) => {
  var theid = req.headers.authentification;
  if(!(req.session.endless)){
    return res.send({error:401, msg:"game_doesnt_exist"});
  }
  req.session.endless.disqualified=true;
  return res.send({error:undefined});
}

exports.endlesstime = (req, res) => {
  var theid = req.headers.authentification;
  if(!(req.session.endless)){
    return res.send({error:401, msg:"game_doesnt_exist"});
  }
  res.send({correct:false, score:req.session.endlessscore});
  if(req.session.endless.disqualified){
    return;
  }
  var db = new sqlite3.Database('data.db');
  db.serialize(function() {
    db.run("INSERT INTO leaderboard(userid, username, score, time) VALUES (?, ?, ?, ?)", [req.session.user.userId, req.session.user.userName, req.session.endless.score, new Date().getTime()-req.session.endless.time], function(data){
      req.session.endless.ended=true;
    });
  });
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
