const dotenv = require('dotenv');
dotenv.config();
var createError = require('http-errors');
var express = require('express');
const expressLayouts = require('express-ejs-layouts')
var path = require('path');
var flash = require('express-flash');
var session = require('express-session');
var redis = require('redis'); 
const connectRedis = require('connect-redis');
// var bodyParser = require('body-parser');
// var connection  = require('./config/db.config'); 
var requireAuth = require('./src/middlewares/auth.middleware');
var authRouters = require('./src/routes/auth.routes');
var cronRouters = require('./src/routes/cron.routes'); 
var dashboardRouters = require('./src/routes/dashboard.routes'); 
var shopifyRouters = require('./src/routes/shopify.routes'); 
var crawlerRouters = require('./src/routes/crawler.routes'); 
var brokenRouters = require('./src/routes/broken.routes'); 
var auditRouters = require('./src/routes/audit.routes');
var keywordRouters = require('./src/routes/keyword.routes'); 
var app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(express.static(path.join(__dirname, 'public')));
// app.use('/static', express.static(path.join(__dirname, 'public')))
app.set('views', path.join(__dirname, 'src/views'));
// view engine setup 
app.set('layout', './layouts/main-layout');
app.set('view engine', 'ejs');
app.set('trust proxy', 1); 
 
const RedisStore = connectRedis(session);

//Configure redis client
const redisClient = redis.createClient({
    host: process.env.REDIS_HOST,
    port: process.env.REDIS_PORT,
    password: process.env.REDIS_PASSWORD,
    legacyMode:true
});

redisClient.connect(); 

//Configure session middleware with redisClient
app.use(session({
    store: new RedisStore({ client: redisClient }),
    secret: 'secret$%^134',
    resave: false,
    saveUninitialized: false,
    cookie: {
        secure: false,
        httpOnly: false,
        maxAge: 10000 * 60 * 10
    }
}));

// Configure With server session only  
// app.use(session({ 
//     cookie: { maxAge: 60000 },
//     store: new session.MemoryStore,
//     // store: new RedisStore,
//     saveUninitialized: true,
//     resave: 'true',
//     secret: 'secret'
// }));
 
app.use((req, res, next) => {
    res.locals.session = req.session;
    next();
});

app.use(flash()); 
app.use('/cron', cronRouters);
app.use(requireAuth); 
app.use('/auth', authRouters);
app.use(expressLayouts); 
app.use('/dashboard', dashboardRouters);
app.use('/shopify', shopifyRouters);
app.use('/crawler', crawlerRouters);
app.use('/broken', brokenRouters);
app.use('/audit', auditRouters);
app.use('/keyword', keywordRouters);



// catch 404 and forward to error handler
app.use(function(req, res, next) {
    res.status(404).send("Page Not Found");
});

app.listen(6018);