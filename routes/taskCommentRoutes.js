const express = require('express');
const router = express.Router({ mergeParams: true });

const taskCommentController = require('../controllers/taskCommentController');
const authMiddleware = require('../middlewares/authMiddleware');
const { auditContext } = require('../middlewares/auditContextMiddleware');

const authorize = require('../middlewares/authorizationMiddleware');
const validate = require('../middlewares/validationMiddleware');
const { commentSchema } = require('../validators/commentValidator');
const canAccessTaskMiddleware = require('../middlewares/canAccessTaskMiddleware');

// All routes require authentication //*Toutes ces routes nécessitent une authentification
router.use(authMiddleware);
router.use(auditContext);

// Middleware to check if the user can access the task //* Middleware pour vérifier si l'utilisateur peut accéder à la tâche
router.use('/:taskId/comments', canAccessTaskMiddleware);

// POST /api/tasks/:taskId/comments - Add a comment to a task //*Ajouter un commentaire à une tâche
router.post(
    '/',
    authorize('task:update'),
    validate(commentSchema),
    taskCommentController.addComment
);

// PUT /api/tasks/:taskId/comments/:commentId - Update a comment //*Mettre à jour un commentaire
router.put(
    '/:commentId',
    authorize('task:update'),
    validate(commentSchema),
    taskCommentController.updateComment
);

// DELETE /api/tasks/:taskId/comments/:commentId - Delete a comment //*Supprimer un commentaire
router.delete(
    '/:commentId',
    authorize('task:update'),
    taskCommentController.deleteComment
);

module.exports = router;
