import Activity from "../models/activity.model.js";

export const getBoardActivities = async (req, res) => {
    try {
        const { id: boardId } = req.params;
        const activities = await Activity.find({ boardId })
            .populate("userId", "name email")
            .sort({ createdAt: -1 })
            .limit(50);

        res.json(activities);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};
