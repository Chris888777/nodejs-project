const router = require('express').Router();
const { userSchema } = require('../auth/user');
const { loginSchema } = require('../auth/login');
const { passwordSchema } = require('../auth/password');
const jwt = require('jsonwebtoken');
const { validate } = require('../middleware/joiMiddleware');
const { getUser, addUser, checkIfUserExists, login, updatePassword } = require('../models/queries');
const crypto = require('crypto');

router.post('/login', validate(loginSchema), async (req, res, next) => {
    try {
        const { email, password, rememberme } = req.body;
        const [result] = await login(email, encryptPass(password));
        const [user] = result;
        if (!user) {
            res.status(401).send({error: 'Wrong email/password'});
            return;
        }
        const token = jwt.sign({ userId: user.id }, process.env.JWT_SECRET);
        let expiration = new Date().getTime() + (86400000 * 30);
        if (rememberme) {
            expiration = 'Fri, 31 Dec 9999 23:59:59 GMT';
        }
        if (new Date().getTime() >= user.nextPasswordChange) {
            res.send({changePassword: true});
        } else {
            res.cookie('user', JSON.stringify({token, user, expiration}), { expires: new Date(expiration) });
            res.send({token, user});
        }
    } catch (e) {
        next(e);
    }
});

router.get('/logout', async (req, res, next) => {
    try {
        if (req.cookies.user) {
            res.clearCookie('user');
            res.send('logged out');
        }
    } catch (e) {
        next(e);
    }
});

router.post('/register', validate(userSchema), async (req, res, next) => {
    try {
        const { firstName, lastName, email, password, view } = req.body;
        const [result] = await checkIfUserExists(email);
        const passwordError = password.match(/^[A-Za-z]\w{4,10}$/);
        const [userExist] = result;
        if (userExist) {
            res.status(403).send({error: 'User exist'});
            return;
        } else if (!passwordError) {
            res.status(403).send({error: 'Bad password'});
            return;
        } else {
            const [response] = await addUser(firstName, lastName, email, encryptPass(password), false, view, new Date().getTime() + new Date(86400000 * 30).getTime());
            const userId = response.insertId;
            const user = await getUser(userId);
            const token = jwt.sign({ userId }, process.env.JWT_SECRET);

            if (user && token) {
                req.session.regenerate(() => {
                    req.session.data = {token, user};
                    const expiration = new Date().getTime() + (86400000 * 30);
                    res.cookie('user', JSON.stringify({token, user, expiration}), { maxAge: 86400000 * 180 });
                    res.send({token, user});
                });
            }
        }
    } catch (e) {
        console.log(e);
        next(e);
    }
});

router.post('/password', validate(passwordSchema), async (req, res, next) => {
    try {
        const { email, oldPassword, newPassword } = req.body;
        const [response] = await updatePassword(email, encryptPass(oldPassword), encryptPass(newPassword));
        if (response.affectedRows === 1) {
            res.clearCookie('user');
            res.send('logged out');
        }
    } catch (e) {
        next(e);
    }
});

const encryptPass = (password) => {
    return crypto.createHash('sha256', process.env.SECRET).update(password).digest('hex');
};

module.exports = router;
