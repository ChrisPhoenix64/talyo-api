const mongoose = require('mongoose');
const auditPlugin = require('../plugins/auditPlugin')

const { Schema } = mongoose;

const roleSchema = new Schema(
    {
        name: {
            // example: 'Admin', 'User', 'Guest'
            type: String,
            required: true,
            unique: true,
        },
        permission: [
            {
                type: String, // example: ['project:create', 'task:read']
                required: true,
            },
        ],
    },
    {
        timestamps: true,
    }
);

module.exports = mongoose.model('Role', roleSchema);
