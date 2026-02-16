import Task from "../models/task.model.js";
import { logActivity } from "../utils/activity.utils.js";

// Create Task
export const createTask = async (req, res) => {
    try {
        const { boardId, listId, title, description, assignee, dueDate } = req.body;

        const lastTask = await Task.findOne({ listId }).sort({ position: -1 });
        const position = lastTask ? lastTask.position + 1 : 1;

        const task = await Task.create({
            boardId,
            listId,
            title,
            description,
            assignee,
            dueDate,
            position,
            createdBy: req.user._id,
        });

        const io = req.app.get("io");
        io.to(boardId).emit("taskCreated", task);

        // Log activity
        await logActivity({
            io,
            boardId,
            userId: req.user._id,
            action: `created task "${title}"`,
            entityType: "task",
            entityId: task._id,
        });

        res.status(201).json(task);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Update Task
export const updateTask = async (req, res) => {
    try {
        const { title, description, assignee, dueDate, listId, position } = req.body;

        const task = await Task.findByIdAndUpdate(
            req.params.id,
            {
                title,
                description,
                assignee,
                dueDate,
                listId,
                position,
            },
            { new: true }
        );

        const io = req.app.get("io");
        io.to(task.boardId.toString()).emit("taskUpdated", task);

        res.json(task);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Delete Task
export const deleteTask = async (req, res) => {
    try {
        const task = await Task.findById(req.params.id);
        if (!task) return res.status(404).json({ message: "Task not found" });

        await Task.findByIdAndDelete(req.params.id);

        const io = req.app.get("io");
        io.to(task.boardId.toString()).emit("taskDeleted", req.params.id);

        // Log activity
        await logActivity({
            io,
            boardId: task.boardId,
            userId: req.user._id,
            action: `deleted task "${task.title}"`,
            entityType: "task",
            entityId: task._id,
        });

        res.json({ message: "Task deleted" });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};
