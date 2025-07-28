const AuditLog = require('../models/AuditLog');
const { getCurrentUserId } = require('../middlewares/auditContextMiddleware');

module.exports = function auditPlugin(schema, options) {
    const entity = options && options.entityName;

    // Helper : créer un log
    const createLog = async ({ action, entityId, before, after }) => {
        const userId = getCurrentUserId();

        if (!userId) return; // En cas d'opération "system"

        await AuditLog.create({
            user: userId,
            action,
            entityType: entity,
            entityId,
            before: before || null,
            after: after || null,
        });
    };

    // 1. Création & mise à jour via save()
    schema.pre('save', async function (next) {
        this._isNew = this.isNew;

        if (!this.isNew) {
            // Pour update, on charge l'état avant
            this._before = await this.constructor.findById(this._id).lean();
        }
        next();
    });

    schema.post('save', async function (doc) {
        if (this._isNew) {
            await createLog({
                action: 'create',
                entityId: doc._id,
                after: doc.toObject(),
            });
        } else {
            await createLog({
                action: 'update',
                entityId: doc._id,
                before: this._before,
                after: doc.toObject(),
            });
        }
    });

    // 2. findOneAndUpdate
    schema.pre('findOneAndUpdate', async function () {
        this._before = await this.model.findOne(this.getFilter()).lean();
    });

    schema.post('findOneAndUpdate', async function (result) {
        if (result) {
            await createLog({
                action: 'update',
                entityId: result._id,
                before: this._before,
                after: result.toObject(),
            });
        }
    });

    // 3. findOneAndDelete
    schema.post('findOneAndDelete', async function (doc) {
        if (doc) {
            await createLog({
                action: 'delete',
                entityId: doc._id,
                before: doc.toObject(),
            });
        }
    });
};
