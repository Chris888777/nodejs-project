const Joi = require('@hapi/joi');

const loginSchema = Joi.object({
    email: Joi.string().email().required().error(() => new Error('Email must be an email')),
    password: Joi.string().required().error(() => new Error('Password must be a string')),
    rememberme: Joi.boolean(),
});

module.exports = { loginSchema }
