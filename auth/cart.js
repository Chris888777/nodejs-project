const Joi = require('@hapi/joi');

const cartSchema = Joi.object({
    user_id: Joi.number().required(),
    id: Joi.string().required()
});

module.exports = { cartSchema }
