const Joi = require('joi');
const validPermissions = require('../config/permissions');

exports.roleSchema = Joi.object({
    name: Joi.string().trim().min(5).required(),
    permissions: Joi.array()
        .items(
            Joi.string()
                .pattern(/^[a-z]+(:[a-z]+){1,2}$/)
                .valid(...validPermissions)
                .messages({
                    'any.only': 'Permission "{#value}" is not allowed',
                    'string.base': 'Permission must be a string',
                })
        ) // Matches "action:resource" or "action:resource:subresource" - Correspond à "action:ressource" ou "action:ressource:sous-ressource"
        .required()
        .custom((value, helpers) => {
            const duplicates = value.filter(
                (item, index) => value.indexOf(item) !== index
            );
            if (duplicates.length > 0) {
                return helpers.error('any.invalid', {
                    messages: `Duplicate permission(s): ${[
                        ...new Set(duplicates),
                    ].join(', ')}`,
                });
            }
            return value;
        }, 'No duplicate permissions allowed'),
}).messages({
    'string.base': 'Le nom du rôle doit être une chaîne de caractères.',
    'string.empty': 'Le nom du rôle ne peut pas être vide.',
    'string.min': 'Le nom du rôle doit comporter au moins {#limit} caractères.',
    'array.base':
        'Les permissions doivent être un tableau de chaînes de caractères.',
    'array.items':
        'Chaque permission doit être une chaîne de caractères au format "action:ressource".',
    'any.required': 'Le nom et les permissions sont requis.',
});
