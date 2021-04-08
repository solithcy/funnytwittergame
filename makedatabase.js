var sqlite3 = require('sqlite3').verbose();
var db = new sqlite3.Database('data.db');

db.serialize(function() {
  db.run("CREATE TABLE leaderboard (id INTEGER PRIMARY KEY AUTOINCREMENT, userid TEXT, username TEXT, score INTEGER, time INTEGER)", function(data){
    console.log("created table leaderboard");
  });
});
