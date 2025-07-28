const mongoose = require('mongoose');
const auditPlugin = require('../plugins/auditPlugin')

const { Schema } = mongoose;

const taskSchema = new Schema(
    {
        title: {
            type: String,
            required: true,
            trim: true,
        },
        description: {
            type: String,
            trim: true,
        },
        status: {
            type: String,
            enum: ['todo', 'in-progress', 'done', 'archived'],
            default: 'todo',
        },
        priority: {
            type: String,
            enum: ['low', 'medium', 'high', 'critical'],
            default: 'medium',
        },
        dueDate: {
            type: Date,
            required: false,
        },
        project: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Project',
            required: true,
        },
        assignedTo: [
            {
                type: mongoose.Schema.Types.ObjectId,
                ref: 'User',
                required: false,
            },
        ],
        teams: [
            {
                type: mongoose.Schema.Types.ObjectId,
                ref: 'Team',
            },
        ],
        checklist: [
            {
                _id: { type: mongoose.Schema.Types.ObjectId, auto: true },
                label: {
                    type: String,
                    required: true,
                    trim: true,
                },
                done: {
                    type: Boolean,
                    default: false,
                },
                createdBy: {
                    type: mongoose.Schema.Types.ObjectId,
                    ref: 'User',
                    required: true,
                },
                createdAt: {
                    type: Date,
                    default: Date.now,
                },
            },
        ],
        comments: [
            {
                _id: { type: mongoose.Schema.Types.ObjectId, auto: true },
                content: {
                    type: String,
                    required: true,
                    trim: true,
                },
                createdBy: {
                    type: mongoose.Schema.Types.ObjectId,
                    ref: 'User',
                    required: true,
                },
                createdAt: {
                    type: Date,
                    default: Date.now,
                },
                updatedBy: {
                    type: mongoose.Schema.Types.ObjectId,
                    ref: 'User',
                    required: false,
                },
                updatedAt: {
                    type: Date,
                    default: Date.now,
                },
            },
        ],
        attachments: [
            {
                _id: { type: mongoose.Schema.Types.ObjectId, auto: true },
                filename: {
                    type: String,
                    required: true,
                },
                originalName: {
                    type: String,
                    required: true,
                },
                mimetype: {
                    type: String,
                    required: true,
                },
                size: {
                    type: Number,
                    required: true,
                },
                uploadedBy: {
                    type: mongoose.Schema.Types.ObjectId,
                    ref: 'User',
                    required: true,
                },
                uploadedAt: {
                    type: Date,
                    default: Date.now,
                },
            },
        ],
        createdBy: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            required: true,
        },
    },
    {
        timestamps: true,
    }
);

module.exports = mongoose.model('Task', taskSchema);
