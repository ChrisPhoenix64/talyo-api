const Joi = require('joi');
const mongoose = require('mongoose');

// Allowed values for status and priority - Statuts et priorités autorisés
const allowedStatuses = ['todo', 'in-progress', 'done', 'archived'];
const allowedPriorities = ['low', 'medium', 'high', 'critical'];

// Custom validation for ObjectId - Validation personnalisée pour ObjectId
const objectId = Joi.string().custom((value, helpers) => {
    if (!mongoose.Types.ObjectId.isValid(value)) {
        return helpers.error('any.invalid');
    }
    return value;
}, 'ObjectId validation');

exports.taskSchema = Joi.object({
    title: Joi.string().trim().min(3).max(100).required().messages({
        'string.base': 'Title must be a string.',
        'string.empty': 'Title cannot be empty.',
        'string.min': 'Title must be at least 3 characters long.',
        'string.max': 'Title must not exceed 100 characters.',
        'any.required': 'Title is required.',
    }),
    description: Joi.string().trim().allow('', null).messages({
        'string.base': 'Description must be a string.',
        'string.empty': 'Description cannot be empty.',
    }),
    status: Joi.string()
        .valid(...allowedStatuses)
        .default('todo')
        .messages({
            'string.base': 'Status must be a string.',
            'any.only': `Status must be one of: ${allowedStatuses.join(', ')}.`,
        }),
    priority: Joi.string()
        .valid(...allowedPriorities)
        .default('medium')
        .messages({
            'string.base': 'Priority must be a string.',
            'any.only': `Priority must be one of: ${allowedPriorities.join(
                ', '
            )}.`,
        }),
    dueDate: Joi.date().allow(null).messages({
        'date.base': 'Due date must be a valid date.',
        'date.empty': 'Due date cannot be empty.',
    }),
    project: objectId.required().messages({
        'string.base': 'Project must be a valid ObjectId.',
        'any.required': 'Project is required.',
    }),
    assignedTo: Joi.array().items(objectId).default([]).messages({
        'string.base': 'AssignedTo must be a valid ObjectId.',
        'array.base': 'AssignedTo must be an array of ObjectIds.',
        'any.default': 'AssignedTo is optional and defaults to an empty array.',
    }),
    checklist: Joi.array()
        .items(
            Joi.object({
                label: Joi.string().trim().min(1).required().messages({
                    'string.base': 'Checklist item label must be a string.',
                    'string.empty': 'Checklist item label cannot be empty.',
                    'string.min':
                        'Checklist item label must be at least 1 character long.',
                    'any.required': 'Checklist item label is required.',
                }),
                done: Joi.boolean().default(false).messages({
                    'boolean.base':
                        'Checklist item done status must be a boolean.',
                }),
            })
        )
        .default([])
        .messages({
            'array.base': 'Checklist must be an array of objects.',
            'any.default':
                'Checklist is optional and defaults to an empty array.',
        }),
    teams: Joi.array().items(objectId).default([]).messages({
        'string.base': 'Teams must be an array of valid ObjectIds.',
        'array.base': 'Teams must be an array of ObjectIds.',
        'any.default': 'Teams is optional and defaults to an empty array.',
    }),
}).messages({
    'object.base': 'Task must be an object.',
    'object.unknown': 'Task contains unknown keys.',
});
