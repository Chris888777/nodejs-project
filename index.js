const express = require('express');
const app = express();
const path = require('path');
const expressJwt = require('express-jwt');
const jwt = require('jsonwebtoken');
const bodyParser = require('body-parser');
const session = require('express-session');
const cookieParser = require('cookie-parser');

const Joi = require('joi');
const cors = require('cors');
require('dotenv').config();

const userRouter = require('./routers/users');
const productRouter = require('./routers/products');
const cartRouter = require('./routers/cart');

const port = process.env.PORT;
const SECRET = process.env.JWT_SECRET;
let mongo;

try {
    mongo = require('./models/mongo');
} catch (e) {
    console.log('error mongo', e);
}

app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));
app.use(express.static(path.join(__dirname, 'public')));
app.use(session({secret: SECRET, saveUninitialized: true, resave: true}));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(cors());
app.use(cookieParser());
app.use(express.json());
app.use(expressJwt({secret: SECRET})
    .unless({ path: [
        '/',
        '/favicon.ico',
        '/login',
        '/register',
        '/logout',
        '/welcome',
        '/password',
        '/cart',
        '/admin',
        '/api/users/login',
        '/api/users/register'
    ]}));

app.get('/', (req, res) => {
    res.redirect('/login');
});

app.get('/login', (req, res, next) => {
    try {
        if (req.cookies.user) {
            res.redirect('/welcome');
        } else {
            res.render('pages/login');
        }
    } catch (e) {
        next(e);
    }
});

app.get('/register', (req, res, next) => {
    try {
        if (req.cookies.user) {
            res.redirect('/welcome');
        } else {
            res.render('pages/register');
        }
    } catch (e) {
        next(e);
    }
});

app.get('/password', (req, res, next) => {
    try {
        if (req.cookies.user) {
            res.render('pages/password');
        } else {
            res.redirect('/welcome');
        }
    } catch (e) {
        next(e);
    }
});

app.get('/welcome', async (req, res, next) => {
    try {
        if (req.cookies.user) {
            const data = JSON.parse(req.cookies.user);
            if (new Date().getTime() > data.expiration) {
                res.clearCookie('user');
            }
            const {products} = await mongo.list();
            res.render('pages/welcome', { data, products });
        } else {
            res.redirect('/login');
        }
    } catch (e) {
        next(e);
    }
});

app.get('/admin', async (req, res, next) => {
    try {
        const data = JSON.parse(req.cookies.user);
        if (data.user.isAdmin) {
            const {products} = await mongo.list();
            res.render('pages/admin', { data, products });
        } else {
            res.redirect('/welcome');
        }
    } catch (e) {
        next(e);
    }
});

app.get('/cart', async (req, res, next) => {
    try {
        const data = JSON.parse(req.cookies.user);
        const { cart = [] } = await mongo.getCartList(data.user.id);
        let total = 0;
        cart.forEach((item) => {
            total += item.price;
        });
        res.render('pages/cart', { data, cart, total });
    } catch (e) {
        next(e);
    }
});

app.use('/api/users', userRouter);
app.use('/api/products', expressJwt({ secret: SECRET }), productRouter);
app.use('/api/cart', expressJwt({ secret: SECRET }), cartRouter);
app.use((err, req, res, next) => {
    if(err.name === 'UnauthorizedError') {
        res.status(err.status).send('Page not found in my store, sorry. :)');
        return;
    }
    next();
});

app.listen(port, () => {
    console.log(`server is up: ${port}`);
});
