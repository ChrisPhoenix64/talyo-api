const express = require('express');
const router = express.Router({ mergeParams: true });

const teamMemberController = require('../controllers/teamMemberController');
const authMiddleware = require('../middlewares/authMiddleware');
const { auditContext } = require('../middlewares/auditContextMiddleware');

const authorize = require('../middlewares/authorizationMiddleware');
const validate = require('../middlewares/validationMiddleware');
const {
    addMemberSchema,
    updateMemberRoleSchema,
} = require('../validators/teamMemberValidator');

router.use(authMiddleware);
router.use(auditContext);

// GET /api/teams/:teamId/members - Get all team members //* Récupérer tous les membres de l'équipe
router.get(
    '/',
    authorize('team:update'),
    teamMemberController.getAllTeamMembers
);

// POST /api/teams/:teamId/members - Add a member to the team //* Ajouter un membre à l'équipe
router.post(
    '/',
    authorize('team:update'),
    validate(addMemberSchema),
    teamMemberController.addTeamMember
);

// PUT /api/teams/:teamId/members/:userId - Update a member's role in the team //* Mettre à jour le rôle d'un membre de l'équipe
router.put(
    '/:userId',
    authorize('team:update'),
    validate(updateMemberRoleSchema),
    teamMemberController.updateTeamMemberRole
);

// DELETE /api/teams/:teamId/members/:userId - Remove a member from the team //* Supprimer un membre de l'équipe
router.delete(
    '/:userId',
    authorize('team:update'),
    teamMemberController.removeTeamMember
);
