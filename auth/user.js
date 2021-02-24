const Joi = require('@hapi/joi');

const userSchema = Joi.object({
    firstName: Joi.string().required(),
    lastName: Joi.string().required(),
    email: Joi.string().email().required().error(() => new Error('Email must be an email')),
    password: Joi.string().required(),
    view: Joi.string(),
    nextPasswordChange: Joi.number()
});

module.exports = { userSchema };
