const Joi = require('joi');
const mongoose = require('mongoose');

const objectId = (value, helpers) => {
    if (!mongoose.Types.ObjectId.isValid(value)) {
        return helpers.error('any.invalid');
    }
    return value;
};

exports.addMemberSchema = Joi.object({
    userId: Joi.string()
        .custom(objectId, 'ObjectId validation')
        .required()
        .messages({
            'string.base': 'User ID must be a valid ObjectId.',
            'any.required': 'User ID is required.',
        }),
    role: Joi.string().valid('member', 'leader').default('member').messages({
        'string.base': 'Role must be a string.',
        'any.only': 'Role must be one of: member, admin, owner.',
    }),
});

exports.updateMemberRoleSchema = Joi.object({
    role: Joi.string().valid('member', 'leader').required().messages({
        'string.base': 'Role must be a string.',
        'any.only': 'Role must be one of: member, leader.',
        'any.required': 'Role is required.',
    }),
});
