const config = require('./config.json');

exports.index = (req, res) => {
  res.render('index');
}

exports.play = (req, res) => {
  res.render('play');
}

exports.playclassic = (req, res) => {
  res.render('playclassic');
}
