// IMPORT SHIT

const express = require('express');
const session = require('express-session');
const config = require('./config.json');
const cookieParser = require('cookie-parser');
const bodyParser = require('body-parser');
const path = require('path');
const http = require('http');
const routes = require('./routes');

// DEFINE SHIT

const app = express();
app.set("views", path.join(__dirname, './views'));
app.engine("html", require("dot-emc").init(
    {
        app: app,
        fileExtension: "html",
        options: {
            templateSettings: {
                cache: false
            }
        }
    }
).__express);
app.set("view engine", "html");
app.set('trust proxy', 1)
app.use(session({
  secret: config.cookiesecret,
  resave: false,
  saveUninitialized: true,
  cookie: { secure: true }
}))
app.use('/static', express.static('static'));
routes(app);

// MIDDLEWARE

app.use(cookieParser());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: true}));

// OTHER STUFF

app.get('/', );

// LET'S GO

var server = http.createServer(app);
server.listen(config.port, () => {
  console.log(`Let's get this party started`);
});
