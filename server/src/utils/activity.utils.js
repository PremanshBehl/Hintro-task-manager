import Activity from "../models/activity.model.js";

export const logActivity = async ({ io, boardId, userId, action, entityType, entityId, metaData }) => {
    try {
        const activity = await Activity.create({
            boardId,
            userId,
            action,
            entityType,
            entityId,
            metaData,
        });

        const populatedActivity = await activity.populate("userId", "name email");

        if (io) {
            io.to(boardId.toString()).emit("newActivity", populatedActivity);
        }

        return populatedActivity;
    } catch (error) {
        console.error("Error logging activity:", error);
    }
};
