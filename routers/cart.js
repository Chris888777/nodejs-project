const router = require('express').Router();
const { cartSchema } = require('../auth/cart');
const { validate } = require('../middleware/joiMiddleware');
const  { addToCart, getCartList, removeFromCart } = require('../models/mongo');

router.get('/', async (req, res) => {
    const { userId } = req.user;
    const products = await getCartList(userId);
    res.send(products);
});

router.post('/', validate(cartSchema), async (req, res, next) => {
    try {
        const cart = await addToCart(req.body.user_id, req.body.id);
        res.send(cart);
    } catch (e) {
        next(e);
    }
});

router.delete('/', async (req, res, next) => {
    try {
        const result = await removeFromCart(req.body.id);
        if (result.success) {
            res.send(result);
        }
    } catch (e) {
        next(e);
    }
});

module.exports = router;
