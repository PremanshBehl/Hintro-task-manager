import axios from "axios";

const API = axios.create({
    baseURL: import.meta.env.VITE_API_URL || "http://localhost:5001/api",
});

API.interceptors.request.use((req) => {
    if (localStorage.getItem("token")) {
        req.headers.Authorization = `Bearer ${localStorage.getItem("token")}`;
    }
    return req;
});

export const login = (formData) => API.post("/auth/login", formData);
export const register = (formData) => API.post("/auth/register", formData);
export const fetchUser = () => API.get("/auth/me");

export const fetchBoards = () => API.get("/boards");
export const createBoard = (boardData) => API.post("/boards", boardData);
export const fetchBoard = (id) => API.get(`/boards/${id}`);
export const updateBoard = (id, boardData) => API.put(`/boards/${id}`, boardData);
export const deleteBoard = (id) => API.delete(`/boards/${id}`);
export const joinBoard = (token) => API.post(`/boards/join/${token}`);

export const createList = (listData) => API.post("/lists", listData);
export const updateList = (id, listData) => API.put(`/lists/${id}`, listData);
export const deleteList = (id) => API.delete(`/lists/${id}`);

export const createTask = (taskData) => API.post("/tasks", taskData);
export const updateTask = (id, taskData) => API.put(`/tasks/${id}`, taskData);
export const deleteTask = (id) => API.delete(`/tasks/${id}`);

export const fetchActivities = (boardId) => API.get(`/boards/${boardId}/activities`);
