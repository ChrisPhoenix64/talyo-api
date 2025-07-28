const express = require('express');
const router = express.Router();

const roleController = require('../controllers/roleController');
const authMiddleware = require('../middlewares/authMiddleware');
const { auditContext } = require('../middlewares/auditContextMiddleware');

const authorize = require('../middlewares/authorizationMiddleware');
const validate = require('../middlewares/validationMiddleware');
const { roleSchema } = require('../validators/roleValidator');

// All routes require authentication - Toutes ces routes nécessitent une authentification
router.use(authMiddleware);
router.use(auditContext);

// GET /api/roles - Get all roles - Récupérer tous les rôles
router.get('/', authorize('role:read'), roleController.getAllRoles);

// GET /api/roles/:roleId - Get role by ID - Récupérer un rôle par ID
router.get('/:roleId', authorize('role:read'), roleController.getRoleById);

// POST /api/roles - Create a new role - Créer un nouveau rôle
router.post(
    '/',
    authorize('role:create'),
    validate(roleSchema),
    roleController.createRole
);

// PUT /api/roles/:roleId - Update a role - Mettre à jour un rôle
router.put(
    '/:roleId',
    authorize('role:update'),
    validate(roleSchema),
    roleController.updateRole
);

// DELETE /api/roles/:roleId - Delete a role - Supprimer un rôle
router.delete('/:roleId', authorize('role:delete'), roleController.deleteRole);

module.exports = router;

// This router handles all role-related routes and applies the necessary authentication and authorization middleware.
// Ce routeur gère toutes les routes liées aux rôles et applique les middlewares d'authentification et d'autorisation nécessaires.
// It includes routes for getting all roles, getting a role by ID, creating a new role,
// updating a role, and deleting a role.
