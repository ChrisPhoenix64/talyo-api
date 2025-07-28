const express = require('express');
const router = express.Router({ mergeParams: true });

const taskAttachmentController = require('../controllers/taskAttachmentController');
const authMiddleware = require('../middlewares/authMiddleware');
const { auditContext } = require('../middlewares/auditContextMiddleware');

const authorize = require('../middlewares/authorizationMiddleware');
const uploadMiddleware = require('../middlewares/uploadMiddleware');

// All routes require authentication //* Toutes ces routes nécessitent une authentification
router.use(authMiddleware);
router.use(auditContext);

// GET /api/tasks/:taskId/attachments - Get all attachments for a task //* Obtenir toutes les pièces jointes d'une tâche
router.get(
    '/',
    authorize('task:read'),
    taskAttachmentController.getAttachments
);

// POST /api/tasks/:taskId/attachments - Upload an attachment to a task //* Télécharger une pièce jointe à une tâche
router.post(
    '/',
    authorize('task:update'),
    uploadMiddleware.single('attachment'), // Use 'attachment' as the field name for the file //* Utiliser 'attachment' comme nom de champ pour le fichier
    taskAttachmentController.uploadAttachment
);

// DELETE /api/tasks/:taskId/attachments/:attachmentId - Delete an attachment from a task //* Supprimer une pièce jointe d'une tâche
router.delete(
    '/:attachmentId',
    authorize('task:update'),
    taskAttachmentController.deleteAttachment
);

module.exports = router;
