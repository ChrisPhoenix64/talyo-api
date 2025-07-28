const express = require('express');
const router = express.Router();

const taskController = require('../controllers/taskController');
const authMiddleware = require('../middlewares/authMiddleware');
const { auditContext } = require('../middlewares/auditContextMiddleware');

const authorize = require('../middlewares/authorizationMiddleware');
const validate = require('../middlewares/validationMiddleware');
const { taskSchema } = require('../validators/taskValidator');
const canAccessTaskMiddleware = require('../middlewares/canAccessTaskMiddleware');

// All routes require authentication - Toutes ces routes nécessitent une authentification
router.use(authMiddleware);
router.use(auditContext);

// GET /api/tasks - Get all tasks - Récupérer toutes les tâches
router.get(
    '/',
    authorize('task:read'),
    taskController.getAllTasks
);

// GET /api/tasks/:taskId - Get task by ID - Récupérer une tâche par ID
router.get(
    '/:taskId',
    canAccessTaskMiddleware, // Middleware to check if the user can access the task //* Middleware pour vérifier si l'utilisateur peut accéder à la tâche
    authorize('task:read'),
    taskController.getTaskById
);

// POST /api/tasks - Create a new task - Créer une nouvelle tâche
router.post(
    '/',
    authorize('task:create'),
    validate(taskSchema),
    taskController.createTask
);

// PUT /api/tasks/:taskId - Update a task - Mettre à jour une tâche
router.put(
    '/:taskId',
    canAccessTaskMiddleware, // Middleware to check if the user can access the task //* Middleware pour vérifier si l'utilisateur peut accéder à la tâche
    authorize('task:update'),
    validate(taskSchema),
    taskController.updateTask
);

// DELETE /api/tasks/:taskId - Delete a task - Supprimer une tâche
router.delete(
    '/:taskId',
    canAccessTaskMiddleware, // Middleware to check if the user can access the task //* Middleware pour vérifier si l'utilisateur peut accéder à la tâche
    authorize('task:delete'),
    taskController.deleteTask
);

module.exports = router;
