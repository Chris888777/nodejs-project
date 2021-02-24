const router = require('express').Router();
const { productSchema } = require('../auth/product');
const { validate } = require('../middleware/joiMiddleware');
const  { list, get, add, update, remove } = require('../models/mongo');

router.get('/', async (req, res, next) => {
    try {
        const products = await list();
        res.send(products);
    } catch (e) {
        next(e);
    }

});

router.post('/search', async (req, res, next) => {
    try {
        const products = await get();
        res.send(products);
    } catch (e) {
        next(e);
    }
});

router.post('/add', validate(productSchema), async (req, res, next) => {
    try {
        const product = await add(req.body);
        res.send(product);
    } catch (e) {
        next(e);
    }
});

router.post('/update', async (req, res, next) => {
    try {
        const product = await update(req.body.product);
        res.send(product);
    } catch (e) {
        next(e);
    }
});

router.delete('/delete', async (req, res, next) => {
    try {
        await remove(req.body.id);
        const products = await get();
        res.send(products);
    } catch (e) {
        next(e);
    }
});

module.exports = router;
