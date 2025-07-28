const express = require('express');
const router = express.Router();

const projectController = require('../controllers/projectController');
const taskController = require('../controllers/taskController');
const authMiddleware = require('../middlewares/authMiddleware');
const { auditContext } = require('../middlewares/auditContextMiddleware');

const authorize = require('../middlewares/authorizationMiddleware');
const validate = require('../middlewares/validationMiddleware');
const { projectSchema } = require('../validators/projectValidator');
const canAccessProjectMiddleware = require('../middlewares/canAccessProjectMiddleware');

// All routes require authentication - Toutes ces routes nécessitent une authentification
router.use(authMiddleware);
router.use(auditContext);

// GET /api/projects - Get all projects - Récupérer tous les projets
router.get(
    '/',
    authorize('project:read'),
    projectController.getAllProjects
);

// GET /api/projects/:projectId - Get project by ID - Récupérer un projet par ID
router.get(
    '/:projectId',
    canAccessProjectMiddleware, // Middleware to check if the user can access the project //* Middleware pour vérifier si l'utilisateur peut accéder au projet
    authorize('project:read'),
    projectController.getProjectById
);

// POST /api/projects - Create a new project - Créer un nouveau projet
router.post(
    '/',
    authorize('project:create'),
    validate(projectSchema),
    projectController.createProject
);

// PUT /api/projects/:projectId - Update a project - Mettre à jour un projet
router.put(
    '/:projectId',
    canAccessProjectMiddleware, // Middleware to check if the user can access the project //* Middleware pour vérifier si l'utilisateur peut accéder au projet
    authorize('project:update'),
    validate(projectSchema),
    projectController.updateProject
);

// DELETE /api/projects/:projectId - Delete a project - Supprimer un projet
router.delete(
    '/:projectId',
    authorize('project:delete'),
    projectController.deleteProject
);

// GET /api/projects/:projectId/tasks
router.get(
    '/:projectId/tasks',
    canAccessProjectMiddleware,
    authorize('task:read'),
    taskController.getTasksByProject
);

module.exports = router;
