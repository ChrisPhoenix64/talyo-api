const Project = require('../models/project');
const User = require('../models/user');

// GET /api/projects - Get all projects //* Récupérer tous les projets
exports.getAllProjects = async (req, res) => {
    try {
        // Extract query parameters with default values //* Extraire les paramètres de requête avec des valeurs par défaut
        let {
            page = 1,
            limit = 10,
            search,
            status,
            priority,
            member,
            team,
            sortBy = 'createdAt',
            sortOrder = 'desc',
        } = req.query;

        page = Math.max(1, parseInt(page, 10)); // Ensure page is at least 1 //* S'assurer que la page est au moins 1
        limit = Math.max(1, parseInt(limit, 10)); // Ensure limit is at least 1 //* S'assurer que la limite est au moins 1
        sortOrder = sortOrder === 'asc' ? 1 : -1; // Convert sortOrder to 1 or -1 //* Convertir sortOrder en 1 ou -1

        // Build the query object //* Construire l'objet de requête
        const filter = {};
        if (search) {
            filter.name = { $regex: search, $options: 'i' }; // Case-insensitive search //* Recherche insensible à la casse
        }

        if (status) {
            filter.status = status; // Filter by status //* Filtrer par statut
        }

        if (priority) {
            filter.priority = priority; // Filter by priority //* Filtrer par priorité
        }

        if (member) {
            filter.members = member; // Filter by member ID //* Filtrer par ID de membre
        }

        if (team) {
            filter.teams = team; // Filter by team ID //* Filtrer par ID d'équipe
        }

        // Total count of projects matching the filter //* Nombre total de projets correspondant au filtre
        const totalCount = await Project.countDocuments(filter);

        // Execute the query with pagination and sorting //* Exécuter la requête avec pagination et tri
        const projects = await Project.find(filter)
            .sort({ [sortBy]: sortOrder })
            .skip((page - 1) * limit) // Skip documents for pagination //* Ignorer les documents pour la pagination
            .limit(limit) // Limit the number of documents returned //* Limiter le nombre de documents
            .populate('members', 'firstName lastName email') // Populate members with specific fields //* Peupler les membres avec des champs spécifiques
            .populate('teams', 'name members') // Populate teams with specific fields //* Peupler les équipes avec des champs spécifiques
            .populate('createBy', 'firstName lastName email'); // Populate creator with specific fields //* Peupler le créateur avec des champs spécifiques

        // Prepare the response object //* Préparer l'objet de réponse
        res.status(200).json({
            data: projects,
            pagination: {
                page,
                limit,
                totalCount,
                totalPages: Math.ceil(totalCount / limit), // Calculate total pages //* Calculer le nombre total de pages
            },
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Internal server error' });
    }
};

// GET /api/projects/:projectId - Get project by ID //* Récupérer un projet par ID
exports.getProjectById = async (req, res) => {
    const { projectId } = req.params;

    try {
        const project = await Project.findById(projectId)
            .populate('members', 'firstName lastName email')
            .populate('teams', 'name members')
            .populate('createBy', 'firstName lastName email');

        if (!project) {
            return res.status(404).json({ message: 'Project not found' });
        }

        res.status(200).json(project);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Internal server error' });
    }
};

// POST /api/projects - Create a new project //* Créer un nouveau projet
exports.createProject = async (req, res) => {
    const { name, description, status, priority, startDate, endDate, members } =
        req.body;

    if (
        !name ||
        !description ||
        !startDate ||
        !endDate ||
        !Array.isArray(members)
    ) {
        return res.status(400).json({
            message:
                'Name, description, start date, end date and members are required.',
        });
    }

    try {
        const createBy = req.user._id; // Assuming req.user is populated with the authenticated user //* Supposons que req.user soit peuplé avec l'utilisateur authentifié
        const newProject = new Project({
            name,
            description,
            status,
            priority,
            startDate,
            endDate,
            members,
            teams,
            createBy,
        });
        await newProject.save();
        res.status(201).json({ message: 'Project created', newProject });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Internal server error' });
    }
};

// PUT /api/projects/:projectId - Update a project //* Mettre à jour un projet
exports.updateProject = async (req, res) => {
    const { projectId } = req.params;
    const {
        name,
        description,
        status,
        priority,
        startDate,
        endDate,
        members,
        teams,
    } = req.body;

    try {
        const project = await Project.findByIdAndUpdate(
            projectId,
            {
                name,
                description,
                status,
                priority,
                startDate,
                endDate,
                members,
                teams,
            },
            { new: true }
        );

        if (!project) {
            return res.status(404).json({ message: 'Project not found' });
        }

        // Check if the user has permission to update the project //* Vérifier si l'utilisateur a la permission de mettre à jour le projet
        if (!['owner', 'leader'].includes(req.accessLevel)) {
            return res.status(403).json({
                message:
                    'Access denied: insufficient permissions to update project',
            });
        }

        res.status(200).json({ message: 'Project updated', project });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Internal server error' });
    }
};

// DELETE /api/projects/:projectId - Delete a project //* Supprimer un projet
exports.deleteProject = async (req, res) => {
    const { projectId } = req.params;

    try {
        const project = await Project.findByIdAndDelete(projectId);

        if (!project) {
            return res.status(404).json({ message: 'Project not found' });
        }

        res.status(200).json({ message: 'Project deleted' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Internal server error' });
    }
};

// GET /api/teams/:teamId/projects
exports.getProjectsByTeam = async (req, res) => {
    try {
        let {
            page = 1,
            limit = 10,
            status,
            sortBy = 'createdAt',
            sortOrder = 'desc',
        } = req.query;
        page = Math.max(1, parseInt(page, 10));
        limit = Math.max(1, parseInt(limit, 10));
        sortOrder = sortOrder === 'asc' ? 1 : -1;

        const filter = { teams: req.params.teamId };
        if (status) filter.status = status;

        const totalCount = await Project.countDocuments(filter);
        const projects = await Project.find({ teams: teamId })
            .sort({ [sortBy]: sortOrder })
            .skip((page - 1) * limit)
            .limit(limit)
            .populate('members', 'firstName lastName email')
            .populate('createdBy', 'firstName lastName email');

        res.status(200).json({
            data: projects,
            pagination: { total, page, limit, pages: Math.ceil(total / limit) },
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Internal server error' });
    }
};
