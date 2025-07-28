const express = require('express');
const router = express.Router({ mergeParams: true });

const taskChecklistController = require('../controllers/taskChecklistController');
const authMiddleware = require('../middlewares/authMiddleware');
const { auditContext } = require('../middlewares/auditContextMiddleware');

const authorize = require('../middlewares/authorizationMiddleware');
const validate = require('../middlewares/validationMiddleware');
const {
    newChecklistItemValidator,
    checklistItemValidator,
} = require('../validators/checklistItemValidator');
const canAccessTaskMiddleware = require('../middlewares/canAccessTaskMiddleware');

// All routes require authentication //* Toutes ces routes nécessitent une authentification
router.use(authMiddleware);
router.use(auditContext);

// Middleware to check if the user can access the task //* Middleware pour vérifier si l'utilisateur peut accéder à la tâche
router.use('/:taskId/checklists', canAccessTaskMiddleware);

// POST /api/tasks/:taskId/checklist - Add a checklist item to a task //* Ajouter un élément de liste de contrôle à une tâche
router.post(
    '/',
    authorize('task:update'),
    validate(newChecklistItemValidator),
    taskChecklistController.addChecklistItem
);

// PUT /api/tasks/:taskId/checklist/:checklistId - Update a checklist item //* Mettre à jour un élément de liste de contrôle
router.put(
    '/:checklistId',
    authorize('task:update'),
    validate(checklistItemValidator),
    taskChecklistController.updateChecklistItem
);

// DELETE /api/tasks/:taskId/checklist/:checklistId - Delete a checklist item //* Supprimer un élément de liste de contrôle
router.delete(
    '/:checklistId',
    authorize('task:update'),
    taskChecklistController.deleteChecklistItem
);

module.exports = router;
