const mongoose = require('mongoose');

const { Schema } = mongoose;

const auditLogSchema = new Schema(
    {
        user: {
            type: Schema.Types.ObjectId,
            ref: 'User',
            required: true,
        },
        action: {
            type: String,
            enum: ['create', 'update', 'delete'],
            require: true,
        },
        entityType: {
            type: String,
            required: true,
            trim: true,
        },
        entityId: {
            type: Schema.Types.ObjectId,
            required: true,
        },
        before: {
            type: Schema.Types.Mixed,
            default: null,
        },
        after: {
            type: Schema.Types.Mixed,
            default: null,
        },
        timestamp: {
            type: Date,
            default: Date.now,
        },
    },
    { collection: 'audit_logs' }
);

module.exports = mongoose.model('AuditLog', auditLogSchema);
