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
    app.get('*', (req, res) => {
      res.render('404');
    });
};
