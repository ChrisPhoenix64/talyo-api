const Joi = require('joi');
const mongoose = require('mongoose');

const ObjectId = (value, helpers) => {
    if (!mongoose.Types.ObjectId.isValid(value)) {
        return helpers.error('any.invalid');
    }
    return value;
};

const teamMemberSchema = Joi.object({
    user: Joi.string().custom(ObjectId, 'ObjectId validation').required(),
    role: Joi.string().valid('leader', 'member').default('member'),
});

exports.createTeamSchema = Joi.object({
    name: Joi.string().trim().min(2).max(100).required(),
    description: Joi.string().trim().max(500).allow(''),
    members: Joi.array().items(teamMemberSchema).default([]),
    createdBy: Joi.string().custom(ObjectId, 'ObjectId validation').required(),
});

exports.updateTeamSchema = Joi.object({
    name: Joi.string().trim().min(2).max(100).optional(),
    description: Joi.string().trim().max(500).allow('').optional(),
    members: Joi.array().items(teamMemberSchema).optional(),
}).or('name', 'description', 'members');
