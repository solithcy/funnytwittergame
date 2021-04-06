const config = require('./config.json');
const idk = require('./idk')

function staticpage(page) {
    return function(req, res) {
        res.render(page);
    }
}

module.exports = function(app) {
    app.set('trust proxy', true);
    app.get('/', idk.index);
    app.get('/play', idk.play);
    app.get('/play/classic', idk.playclassic);

    app.get('/api/startgame', idk.startgame);
    app.get('/api/tweets', idk.gettweets);

    app.get('*', (req, res) => {
      res.status(404);
      res.render('404');
    });
};
