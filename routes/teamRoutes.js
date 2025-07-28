const express = require('express');
const router = express.Router();

const teamController = require('../controllers/teamController');
const taskController = require('../controllers/taskController');
const projectController = require('../controllers/projectController');
const authMiddleware = require('../middlewares/authMiddleware');
const { auditContext } = require('../middlewares/auditContextMiddleware');

const authorize = require('../middlewares/authorizationMiddleware');
const validate = require('../middlewares/validationMiddleware');
const {
    createTeamSchema,
    updateTeamSchema,
} = require('../validators/teamValidator');

router.use(authMiddleware);
router.use(auditContext);

// GET /api/teams - Get all teams - Récupérer toutes les équipes
router.get(
    '/',
    authorize('team:read'),
    teamController.getAllTeams
);

// GET /api/teams/:teamId - Get team by ID - Récupérer une équipe par ID
router.get(
    '/:teamId',
    authorize('team:read'),
    teamController.getTeamById
);

// POST /api/teams - Create a new team - Créer une nouvelle équipe
router.post(
    '/',
    authorize('team:create'),
    validate(createTeamSchema),
    teamController.createTeam
);

// PUT /api/teams/:teamId - Update a team - Mettre à jour une équipe
router.put(
    '/:teamId',
    authorize('team:update'),
    validate(updateTeamSchema),
    teamController.updateTeam
);

// DELETE /api/teams/:teamId - Delete a team - Supprimer une équipe
router.delete(
    '/:teamId',
    authorize('team:delete'),
    teamController.deleteTeam
);

// GET /api/teams/:teamId/tasks
router.get(
    '/:teamId/tasks',
    authorize('task:read'),
    taskController.getTasksByTeam
);

// GET /api/teams/:teamId/projects
router.get(
    '/:teamId/projects',
    authorize(
        'project:read',
        projectController.getProjectsByTeam
    )
);

module.exports = router;
