const Joi = require('@hapi/joi');

const productSchema = Joi.object({
    name: Joi.string().required(),
    price: Joi.number().required().error(() => new Error('Price must be a number')),
    picture: Joi.string()
})

module.exports = { productSchema }
