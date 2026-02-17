import Board from "../models/board.models.js";
import BoardMember from "../models/boardMember.model.js";
import List from "../models/list.model.js";
import Task from "../models/task.model.js";

// Create a new board
export const createBoard = async (req, res) => {
    try {
        const { title } = req.body;
        const shareToken = Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
        const board = await Board.create({
            title,
            owner: req.user._id,
            shareToken,
        });

        // Add owner as a member
        await BoardMember.create({
            boardId: board._id,
            userId: req.user._id,
            role: "admin",
        });

        res.status(201).json(board);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Get all boards for the user
export const getMyBoards = async (req, res) => {
    try {
        const memberships = await BoardMember.find({ userId: req.user._id });
        const boardIds = memberships.map((m) => m.boardId);

        const boards = await Board.find({ _id: { $in: boardIds } }).sort({
            createdAt: -1,
        });

        // Ensure all boards have a share token
        for (let board of boards) {
            if (!board.shareToken) {
                board.shareToken = Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
                await board.save();
            }
        }

        res.json(boards);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Get a single board with lists and tasks
export const getBoard = async (req, res) => {
    try {
        const board = await Board.findById(req.params.id);
        if (!board) {
            return res.status(404).json({ message: "Board not found" });
        }

        // Fix for existing boards without tokens
        if (!board.shareToken) {
            board.shareToken = Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
            await board.save();
        }

        // Check membership
        const isMember = await BoardMember.findOne({
            boardId: req.params.id,
            userId: req.user._id,
        });

        if (!isMember) {
            return res.status(403).json({ message: "Not a member of this board" });
        }

        const lists = await List.find({ boardId: req.params.id }).sort({
            position: 1,
        });

        const tasks = await Task.find({ boardId: req.params.id }).sort({
            position: 1,
        });

        res.json({ ...board.toObject(), lists, tasks });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Update board
export const updateBoard = async (req, res) => {
    try {
        const { title } = req.body;
        const board = await Board.findByIdAndUpdate(
            req.params.id,
            { title },
            { new: true }
        );
        res.json(board);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
}

// Delete board
export const deleteBoard = async (req, res) => {
    try {
        const board = await Board.findById(req.params.id);
        if (!board) {
            return res.status(404).json({ message: "Board not found" });
        }

        if (board.owner.toString() !== req.user._id.toString()) {
            return res.status(403).json({ message: "Not authorized to delete this board" });
        }

        await Board.findByIdAndDelete(req.params.id);
        await BoardMember.deleteMany({ boardId: req.params.id });
        await List.deleteMany({ boardId: req.params.id });
        await Task.deleteMany({ boardId: req.params.id });

        res.json({ message: 'Board deleted' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
}

// Join board using share token
export const joinBoardByToken = async (req, res) => {
    try {
        const { token } = req.params;
        const board = await Board.findOne({ shareToken: token });

        if (!board) {
            return res.status(404).json({ message: "Invalid share link or board not found" });
        }

        // Check if already a member
        const existingMember = await BoardMember.findOne({
            boardId: board._id,
            userId: req.user._id,
        });

        if (existingMember) {
            return res.json({ message: "You are already a member of this board", boardId: board._id });
        }

        // Add user as a member
        await BoardMember.create({
            boardId: board._id,
            userId: req.user._id,
            role: "member",
        });

        // Update member count
        board.membersCount += 1;
        await board.save();

        res.status(201).json({ message: "Joined board successfully", boardId: board._id });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
}
