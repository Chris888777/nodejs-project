const Joi = require('@hapi/joi');

const passwordSchema = Joi.object({
    email: Joi.string().email().required().error(() => new Error('Email must be an email')),
    oldPassword: Joi.string().required(),
    newPassword: Joi.string().required()
});

module.exports = { passwordSchema };
