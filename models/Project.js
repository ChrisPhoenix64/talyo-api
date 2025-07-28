const mongoose = require('mongoose');
const auditPlugin = require('../plugins/auditPlugin')

const { Schema } = mongoose;

const projectSchema = new Schema(
    {
        name: {
            type: String,
            required: true,
            trim: true,
        },
        description: {
            type: String,
            required: true,
            trim: true,
        },
        status: {
            type: String,
            enum: [
                'not_started',
                'in_progress',
                'on_hold',
                'completed',
                'cancelled',
                'archived',
            ],
            default: 'not started',
        },
        priority: {
            type: String,
            enum: ['low', 'medium', 'high', 'critical'],
            default: 'medium',
        },
        startDate: {
            type: Date,
            required: true,
        },
        endDate: {
            type: Date,
            required: true,
        },
        members: [
            {
                type: mongoose.Schema.Types.ObjectId,
                ref: 'User',
                required: true,
            },
        ],
        teams: [
            {
                type: mongoose.Schema.Types.ObjectId,
                ref: 'Team',
                required: true,
            },
        ],
        createBy: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            required: true,
        },
    },
    {
        timestamps: true,
    }
);

module.exports = mongoose.models.Project || mongoose.model('Project', projectSchema);
