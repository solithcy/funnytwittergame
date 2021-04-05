const config = require('./config.json');

exports.index = (req, res) => {
  res.render('index');
}

exports.play = (req, res) => {
  res.render('play');
}
