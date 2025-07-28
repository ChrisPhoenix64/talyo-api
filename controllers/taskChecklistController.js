const Task = require('../models/Task');

// POST /api/tasks/:taskId/checklist - Add a checklist item to a task - Ajouter un élément de liste de contrôle à une tâche
exports.addChecklistItem = async (req, res) => {
    const { taskId } = req.params.taskId;
    const { label } = req.body;

    if (!label) {
        return res.status(400).json({ message: 'Label is required.' });
    }

    try {
        const task = await Task.findById(taskId);
        if (!task) {
            return res.status(404).json({ message: 'Task not found.' });
        }

        task.checklist.push({
            label,
            done: false,
            createdBy: req.user._id,
        });
        await task.save();

        res.status(201).json({
            message: 'Checklist item added successfully.',
            checklist: task.checklist.at(-1),
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Internal server error.' });
    }
};

// PUT /api/tasks/:taskId/checklist/:checklistId - Update a checklist item - Mettre à jour un élément de liste de contrôle
exports.updateChecklistItem = async (req, res) => {
    const { taskId, checklistId } = req.params;
    const { label, done } = req.body;

    try {
        const task = await Task.findById(taskId);
        if (!task) {
            return res.status(404).json({ message: 'Task not found.' });
        }

        const checklistItem = task.checklist.id(checklistId);
        if (!checklistItem) {
            return res
                .status(404)
                .json({ message: 'Checklist item not found.' });
        }

        const isOwner = checklistItem.createdBy.equals(req.user._id);
        const hasPermission = req.user.permissions?.includes('task:update');

        if (!isOwner && !hasPermission) {
            return res.status(403).json({
                message:
                    'You are not authorized to update this checklist item.',
            });
        }

        if (label !== undefined) checklistItem.label = label;
        if (done !== undefined) checklistItem.done = done;
        if (
            typeof checklistItem.label.trim() === 'string' &&
            checklistItem.label.trim() === ''
        ) {
            return res.status(400).json({ message: 'Label cannot be empty.' });
        }
        if (typeof checklistItem.done !== 'boolean') {
            return res
                .status(400)
                .json({ message: 'Done status must be a boolean.' });
        }

        await task.save();

        res.status(200).json({
            message: 'Checklist item updated successfully.',
            checklist: checklistItem,
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Internal server error.' });
    }
};

// DELETE /api/tasks/:taskId/checklist/:checklistId - Delete a checklist item - Supprimer un élément de liste de contrôle
exports.deleteChecklistItem = async (req, res) => {
    const { taskId, checklistId } = req.params;

    try {
        const task = await Task.findById(taskId);
        if (!task) {
            return res.status(404).json({ message: 'Task not found.' });
        }

        const checklistItem = task.checklist.id(checklistId);
        if (!checklistItem) {
            return res
                .status(404)
                .json({ message: 'Checklist item not found.' });
        }

        const isOwner = checklistItem.createdBy.equals(req.user._id);
        const hasPermission = req.user.permissions?.includes('task:update');

        if (!isOwner && !hasPermission) {
            return res.status(403).json({
                message:
                    'You are not authorized to update this checklist item.',
            });
        }

        checklistItem.remove();
        await task.save();

        res.status(200).json({
            message: 'Checklist item deleted successfully.',
            checklist: task.checklist,
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Internal server error.' });
    }
};
