import List from "../models/list.model.js";
import Task from "../models/task.model.js";
import { logActivity } from "../utils/activity.utils.js";

// Create a new list
export const createList = async (req, res) => {
    try {
        const { boardId, title } = req.body;

        const lastList = await List.findOne({ boardId }).sort({ position: -1 });
        const position = lastList ? lastList.position + 1 : 1;

        const list = await List.create({
            boardId,
            title,
            position,
        });

        // Emit event
        const io = req.app.get("io");
        io.to(boardId).emit("listCreated", list);

        // Log activity
        await logActivity({
            io,
            boardId,
            userId: req.user._id,
            action: `created list "${title}"`,
            entityType: "list",
            entityId: list._id,
        });

        res.status(201).json(list);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Update list
export const updateList = async (req, res) => {
    try {
        const { title, position } = req.body;
        const list = await List.findByIdAndUpdate(
            req.params.id,
            { title, position },
            { new: true }
        );

        // Emit event
        const io = req.app.get("io");
        io.to(list.boardId.toString()).emit("listUpdated", list);

        res.json(list);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Delete list
export const deleteList = async (req, res) => {
    try {
        const list = await List.findById(req.params.id);
        if (!list) return res.status(404).json({ message: "List not found" });

        await List.findByIdAndDelete(req.params.id);
        await Task.deleteMany({ listId: req.params.id });

        // Emit event
        const io = req.app.get("io");
        io.to(list.boardId.toString()).emit("listDeleted", req.params.id);

        // Log activity
        await logActivity({
            io,
            boardId: list.boardId,
            userId: req.user._id,
            action: `deleted list "${list.title}"`,
            entityType: "list",
            entityId: list._id,
        });

        res.json({ message: "List deleted" });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};
