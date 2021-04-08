const config = require('./config.json');
const idk = require('./idk');
const pjson = require('./package.json');

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
    app.get('/play/biden', idk.playbiden);
    app.get('/play/cat', idk.playcat);
    app.get('/how', idk.how);
    app.get('/login', idk.login);

    app.get('/api/startgame', idk.startgame);
    app.get('/api/tweets', idk.gettweets);
    app.get('/api/tweets/biden', idk.gettweetsbiden);
    app.get('/api/tweets/cat', idk.gettweetscats);

    app.get('*', (req, res) => {
      res.status(404);
      res.render('404', {version: pjson.version});
    });
};
