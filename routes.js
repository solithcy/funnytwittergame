const config = require('./config.json');
const idk = require('./idk');
const pjson = require('./package.json');

function staticpage(page) {
    return function(req, res) {
        res.render(page, {version:pjson.version});
    }
}

module.exports = function(app) {
    app.set('trust proxy', true);
    app.get('/', idk.index);
    app.get('/play', idk.play);
    app.get('/play/classic', idk.playclassic);
    app.get('/play/biden', idk.playbiden);
    app.get('/play/cat', idk.playcat);
    app.get('/play/endless', idk.playendless);
    app.get('/how', idk.how);
    app.get('/login', idk.login);
    app.get('/thankyou', idk.thankyou);

    app.get('/api/startgame', idk.startgame);
    app.get('/api/tweets', idk.gettweets);
    app.get('/api/tweets/biden', idk.gettweetsbiden);
    app.get('/api/tweets/cat', idk.gettweetscats);
    app.get('/api/tweets/endless', idk.gettweetsendless);
    app.get('/api/endless/guess', idk.endlessguess);
    app.get('/api/endless/leaderboard', idk.getleaderboard);
    app.get('/api/endless/disqualify', idk.endlessdisqualify);
    app.get('/api/endless/notime', idk.endlesstime);
    app.get('/api/endless/extra', idk.extralife);
    app.get('/api/endless/extra/get', idk.lifecheckout);
    app.get('/api/endless/extra/cancelled', idk.cancellife);
    app.get('/api/checkout', staticpage('checkout'));

    app.get('*', (req, res) => {
      res.status(404);
      res.render('404', {version: pjson.version});
    });
};
