const Joi = require('joi');

exports.commentSchema = Joi.object({
    content: Joi.string()
        .trim()
        .min(1)
        .max(1000)
        .required()
        .messages({
            'string.base': 'Content must be a string',
            'string.empty': 'Content cannot be empty',
            'string.min': 'Content must be at least {#limit} character long',
            'string.max': 'Content must be at most {#limit} characters long',
            'any.required': 'Content is required',
        }),
});