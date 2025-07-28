const Joi = require('joi');
const mongoose = require('mongoose');

const statusEnum = [
    'not_started',
    'in_progress',
    'on_hold',
    'completed',
    'cancelled',
    'archived',
];

// Custom Joi extension to validate MongoDB ObjectId - Extension personnalisée Joi pour valider les ObjectId MongoDB
const objectIdValidator = Joi.string().custom((value, helpers) => {
    if (!mongoose.Types.ObjectId.isValid(value)) {
        return helpers.error('any.invalid', { message: 'Invalid ObjectId' });
    }
    return value;
}, 'ObjectId validation');

exports.projectSchema = Joi.object({
    name: Joi.string().trim().min(3).required().messages({
        'string.base': 'Project name must be a string.',
        'string.empty': 'Project name cannot be empty.',
        'string.min': 'Project name must be at least {#limit} characters long.',
    }),
    description: Joi.string().trim().allow('', null).messages({
        'string.base': 'Project description must be a string.',
        'string.empty': 'Project description cannot be empty.',
        'string.min':
            'Project description must be at least {#limit} characters long.',
    }),
    status: Joi.string()
        .valid(...statusEnum)
        .default('not_started')
        .messages({
            'any.only': 'Invalid project status.',
            'string.base': 'Project status must be a string.',
        }),
    priority: Joi.string()
        .valid('low', 'medium', 'high', 'critical')
        .default('medium')
        .messages({
            'any.only': 'Invalid project priority.',
            'string.base': 'Project priority must be a string.',
        }),
    startDate: Joi.date().allow(null).messages({
        'date.base': 'Start date must be a valid date.',
        'date.empty': 'Start date cannot be empty.',
    }),
    endDate: Joi.date().greater(Joi.ref('startDate')).allow(null).messages({
        'date.base': 'End date must be a valid date.',
        'date.empty': 'End date cannot be empty.',
        'date.greater': 'End date must be greater than start date.',
        'date.ref': 'End date must be greater than start date.',
    }),
    members: Joi.array()
        .items(objectIdValidator)
        .min(1)
        .required()
        .default([])
        .messages({
            'array.base': 'Members must be an array of ObjectIds.',
            'array.min': 'At least one member is required.',
            'any.required': 'Members are required.',
        }),
    teams: Joi.array()
        .items(
            objectIdValidator.messages({
                'string.base': 'Team ID must be a string.',
                'any.invalid': 'Invalid Team ID.',
            })
        )
        .messages({
            'array.base': 'Teams must be an array of ObjectIds.',
        }),
});
