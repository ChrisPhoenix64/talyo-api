const Joi = require('joi');

exports.userSchema = Joi.object({
    firstName: Joi.string().trim().min(2).max(50).required(),
    lastName: Joi.string().trim().min(2).max(50).required(),
    email: Joi.string().email().trim().lowercase().required().messages({
        'string.email': 'Email must be a valid email address',
        'string.empty': 'Email cannot be empty',
    }),
    password: Joi.string().trim().min(6).max(100).required().messages({
        'string.min': 'Password must be at least {#limit} characters long',
        'string.max': 'Password must not exceed {#limit} characters',
        'string.empty': 'Password cannot be empty',
    }),
    role: Joi.string().trim().lowercase().required().min(3).messages({
        'string.min': 'Role must be at least {#limit} characters long',
        'string.empty': 'Role cannot be empty',
    }),
});
