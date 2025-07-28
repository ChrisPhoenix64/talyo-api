const express = require('express');
const router = express.Router();

const userController = require('../controllers/userController');
const taskController = require('../controllers/taskController');
const authMiddleware = require('../middlewares/authMiddleware');
const { auditContext } = require('../middlewares/auditContextMiddleware');

const authorize = require('../middlewares/authorizationMiddleware');
const validate = require('../middlewares/validationMiddleware');
const { userSchema } = require('../validators/userValidator');

// All routes require authentication - Toutes ces routes nécessitent une authentification
router.use(authMiddleware);
router.use(auditContext);

// GET /api/users - Get all users - Récupérer tous les utilisateurs
router.get('/', authorize('user:read'), userController.getAllUsers);

// GET /api/users/:userId - Get user by ID - Récupérer un utilisateur par ID
router.get('/:userId', authorize('user:read'), userController.getUserById);

// GET /api/users/:userId/permissions - Get user permissions - Récupérer les permissions d'un utilisateur
router.get(
    '/:userId/permissions',
    authorize('user:read'),
    userController.getUserPermissions
);

// POST /api/users - Create a new user - Créer un nouvel utilisateur
router.post(
    '/',
    authorize('user:create'),
    validate(userSchema),
    userController.createUser
);

// PATCH /api/users/:userId - Update user roles - Mettre à jour les rôles d'un utilisateur
router.patch(
    '/:userId/roles',
    authorize('user:role:update'),
    userController.updateUserRoles
);

// PUT /api/users/:userId - Update a user - Mettre à jour un utilisateur
router.put(
    '/:userId',
    authorize('user:update'),
    validate(userSchema),
    userController.updateUser
);

// DELETE /api/users/:userId - Disable a user - Désactiver un utilisateur
router.delete(
    '/:userId/disable',
    authorize('user:disable'),
    userController.desativateUser
);

// DELETE /api/users/:userId - Delete a user - Supprimer un utilisateur
router.delete('/:userId', authorize('user:delete'), userController.deleteUser);

// GET /api/users/:userId/tasks
router.get(
    '/:userId/tasks',
    authorize('task:read'),
    taskController.getTasksByUser
);

module.exports = router;
