const Joi = require('joi');

exports.checklistItemValidator = Joi.object({
    label: Joi.string().trim().min(1).max(200).required().messages({
        'string.base': 'Label must be a string',
        'string.empty': 'Label cannot be empty',
        'string.min': 'Label must be at least {#limit} character long',
        'string.max': 'Label must be at most {#limit} characters long',
        'any.required': 'Label is required',
    }),
    description: Joi.string().trim().max(500).optional().messages({
        'string.base': 'Description must be a string',
        'string.max': 'Description must be at most {#limit} characters long',
    }),
    done: Joi.boolean().optional().default(false).messages({
        'boolean.base': 'Done status must be a boolean',
        'any.default': 'Done status defaults to false if not provided',
    }),
}).or('label', 'done').messages({
    'object.missing': 'At least one of label or done must be provided',
});

exports.newChecklistItemValidator = Joi.object({
    label: Joi.string().trim().min(1).max(200).required().messages({
        'string.base': 'Label must be a string',
        'string.empty': 'Label cannot be empty',
        'string.min': 'Label must be at least {#limit} character long',
        'string.max': 'Label must be at most {#limit} characters long',
        'any.required': 'Label is required',
    }),
    description: Joi.string().trim().max(500).optional().messages({
        'string.base': 'Description must be a string',
        'string.max': 'Description must be at most {#limit} characters long',
    }),
    done: Joi.boolean().optional().default(false).messages({
        'boolean.base': 'Done status must be a boolean',
        'any.default': 'Done status defaults to false if not provided',
    }),
});
