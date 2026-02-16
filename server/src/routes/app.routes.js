import express from "express";
import {
    createBoard,
    getMyBoards,
    getBoard,
    updateBoard,
    deleteBoard,
    joinBoardByToken,
} from "../controllers/board.controller.js";
import { getBoardActivities } from "../controllers/activity.controller.js";
import {
    createList,
    updateList,
    deleteList,
} from "../controllers/list.controller.js";
import {
    createTask,
    updateTask,
    deleteTask,
} from "../controllers/task.controller.js";
import { protect } from "../middleware/auth.middleware.js";

const router = express.Router();

// Board Routes
router.post("/boards/join/:token", protect, joinBoardByToken);
router.route("/boards").post(protect, createBoard).get(protect, getMyBoards);
router
    .route("/boards/:id")
    .get(protect, getBoard)
    .put(protect, updateBoard)
    .delete(protect, deleteBoard);

router.get("/boards/:id/activities", protect, getBoardActivities);

// List Routes
router.route("/lists").post(protect, createList);
router
    .route("/lists/:id")
    .put(protect, updateList)
    .delete(protect, deleteList);

// Task Routes
router.route("/tasks").post(protect, createTask);
router
    .route("/tasks/:id")
    .put(protect, updateTask)
    .delete(protect, deleteTask);

export default router;
