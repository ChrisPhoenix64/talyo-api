const Task = require('../models/Task');

// GET /api/tasks - Get all tasks //* Récupérer toutes les tâches
exports.getAllTasks = async (req, res) => {
    try {
        // Destructure query parameters with default values //* Déstructurer les paramètres de requête avec des valeurs par défaut
        let {
            page = 1,
            limit = 10,
            search,
            status,
            priority,
            project,
            assignedTo,
            team,
            sortBy = 'createdAt',
            sortOrder = 'desc',
        } = req.query;

        page = Math.max(1, parseInt(page, 10)); // Ensure page is at least 1 //* S'assurer que la page est au moins 1
        limit = Math.max(1, parseInt(limit, 10)); // Ensure limit is at least 1 //* S'assurer que la limite est au moins 1
        sortOrder = sortOrder === 'asc' ? 1 : -1; // Convert sortOrder to 1 or -1 //* Convertir sortOrder en 1 ou -1

        // Build the query object //* Construire l'objet de requête
        const filter = {};
        if (search) filter.title = { $regex: search, $options: 'i' }; // Case-insensitive search //* Recherche insensible à la casse
        if (status) filter.status = status; // Filter by status //* Filtrer par statut
        if (priority) filter.priority = priority; // Filter by priority //* Filtrer par priorité
        if (project) filter.project = project; // Filter by project ID //* Filtrer par ID de projet
        if (assignedTo) filter.assignedTo = assignedTo; // Filter by assigned user ID //* Filtrer par ID d'utilisateur assigné
        if (team) filter.teams = team; // Filter by team ID //* Filtrer par ID d'équipe

        // Total count of tasks matching the filter //* Nombre total de tâches correspondant au filtre
        const totalCount = await Task.countDocuments(filter);

        // Execute the query with pagination and sorting //* Exécuter la requête avec pagination et tri
        const tasks = await Task.find(filter)
            .sort({ [sortBy]: sortOrder })
            .skip((page - 1) * limit) // Skip documents for pagination //* Ignorer les documents pour la pagination
            .limit(limit) // Limit the number of documents returned //* Limiter le nombre de documents
            .populate('project', 'name')
            .populate('assignedTo', 'firstName lastName email')
            .populate('teams', 'name')
            .populate('createdBy', 'firstName lastName email');

        res.status(200).json({
            data: tasks,
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

// GET /api/tasks/:taskId - Get task by ID //* Récupérer une tâche par ID
exports.getTaskById = async (req, res) => {
    const { taskId } = req.params;

    try {
        const task = await Task.findById(taskId)
            .populate('project', 'name')
            .populate('assignedTo', 'firstName lastName email')
            .populate('teams', 'name')
            .populate('comments.createdBy', 'firstName lastName email')
            .populate('createdBy', 'firstName lastName email');

        if (!task) {
            return res.status(404).json({ message: 'Task not found' });
        }

        res.status(200).json(task);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Internal server error' });
    }
};

// POST /api/tasks - Create a new task //* Créer une nouvelle tâche
exports.createTask = async (req, res) => {
    const {
        title,
        description,
        status,
        priority,
        dueDate,
        project,
        assignedTo,
        teams,
    } = req.body;

    if (!title || !project) {
        return res
            .status(400)
            .json({ message: 'Title and project are required.' });
    }

    try {
        const newTask = new Task({
            title,
            description,
            status: status || 'todo',
            priority: priority || 'medium',
            dueDate,
            project,
            assignedTo,
            teams,
            createdBy: req.user._id, // Assuming req.user is set by authentication middleware //* En supposant que req.user est défini par le middleware d'authentification
        });

        // Include audit information //* Inclure les informations d'audit
        newTask._auditUser = req.user._id;

        await newTask.save();
        res.status(201).json(newTask);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Internal server error' });
    }
};

// PUT /api/tasks/:taskId - Update a task //* Mettre à jour une tâche
exports.updateTask = async (req, res) => {
    const { taskId } = req.params;
    const {
        title,
        description,
        status,
        priority,
        dueDate,
        project,
        assignedTo,
        teams,
    } = req.body;

    try {
        const task = await Task.findByIdAndUpdate(
            taskId,
            {
                title,
                description,
                status,
                priority,
                dueDate,
                project,
                assignedTo,
                teams,
            },
            { new: true }
        )
            .populate('project', 'name')
            .populate('assignedTo', 'firstName lastName email')
            .populate('teams', 'name')
            .populate('createdBy', 'firstName lastName email');
        if (!task) {
            return res.status(404).json({ message: 'Task not found' });
        }

        // Include audit information //* Inclure les informations d'audit
        task._auditUser = req.user._id;

        res.status(200).json({ message: 'Task updated successfully', task });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Internal server error' });
    }
};

// DELETE /api/tasks/:taskId - Delete a task //* Supprimer une tâche
exports.deleteTask = async (req, res) => {
    const { taskId } = req.params;

    try {
        const query = Task.findByIdAndDelete(taskId);
        
        // Include audit information //* Inclure les informations d'audit
        query._auditUser = req.user._id;

        const task = await query.exec();

        if (!task) {
            return res.status(404).json({ message: 'Task not found' });
        }
        res.status(200).json({ message: 'Task deleted successfully' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Internal server error' });
    }
};

// GET /api/projects/:projectId/tasks
exports.getTasksByProject = async (req, res) => {
    try {
        let {
            page = 1,
            limit = 10,
            status,
            priority,
            sortBy = 'createdAt',
            sortOrder = 'desc',
        } = req.query;
        page = Math.max(1, parseInt(page, 10));
        limit = Math.max(1, parseInt(limit, 10));
        sortOrder = sortOrder === 'asc' ? 1 : -1;

        const filter = { project: req.params.projectId };
        if (status) filter.status = status;
        if (priority) filter.priority = priority;

        const totalCount = await Task.countDocuments(filter);
        const tasks = await Task.find(filter)
            .sort({ [sortBy]: sortOrder })
            .skip((page - 1) * limit)
            .limit(limit)
            .populate('assignedTo', 'firstName lastName email')
            .populate('teams', 'name')
            .populate('createdBy', 'firstName lastName email');

        res.status(200).json({
            data: tasks,
            pagination: {
                totalCount,
                page,
                limit,
                page: Math.ceil(totalCount / limit),
            },
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Internal server error' });
    }
};

// GET /api/users/:userId/tasks
exports.getTasksByUser = async (req, res) => {
    try {
        let {
            page = 1,
            limit = 10,
            status,
            priority,
            sortBy = 'createdAt',
            sortOrder = 'desc',
        } = req.query;
        page = Math.max(1, parseInt(page, 10));
        limit = Math.max(1, parseInt(limit, 10));
        sortOrder = sortOrder === 'asc' ? 1 : -1;

        const filter = { assignedTo: req.params.userId };
        if (status) filter.status = status;
        if (priority) filter.priority = priority;

        const totalCount = await Task.countDocuments(filter);
        const tasks = await Task.find({ assignedTo: userId })
            .sort({ [sortBy]: sortOrder })
            .skip((page - 1) * limit)
            .limit(limit)
            .populate('project', 'name')
            .populate('teams', 'name')
            .populate('createdBy', 'firstName lastName email');

        res.status(200).json({
            data: tasks,
            pagination: {
                totalCount,
                page,
                limit,
                pages: Math.ceil(totalCount / limit),
            },
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Internal server error' });
    }
};

// GET /api/teams/:teamId/tasks
exports.getTasksByTeam = async (req, res) => {
    try {
        let {
            page = 1,
            limit = 10,
            status,
            priority,
            sortBy = 'createdAt',
            sortOrder = 'desc',
        } = req.query;
        page = Math.max(1, parseInt(page, 10));
        limit = Math.max(1, parseInt(limit, 10));
        sortOrder = sortOrder === 'asc' ? 1 : -1;

        const filter = { teams: req.params.teamId };
        if (status) filter.status = status;
        if (priority) filter.priority = priority;

        const totalCount = await Task.countDocuments(filter);
        const tasks = await Task.find({ teams: teamId })
            .sort({ [sortBy]: sortOrder })
            .skip((page - 1) * limit)
            .limit(limit)
            .populate('project', 'name')
            .populate('assignedTo', 'firstName lastName email')
            .populate('createdBy', 'firstName lastName email');

        res.status(200).json({
            data: tasks,
            pagination: {
                totalCount,
                page,
                limit,
                pages: Math.ceil(totalCount / limit),
            },
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Internal server error' });
    }
};
