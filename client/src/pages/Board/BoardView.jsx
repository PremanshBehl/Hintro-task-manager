import { useState, useEffect, useMemo } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
    DndContext,
    DragOverlay,
    closestCorners,
    KeyboardSensor,
    PointerSensor,
    useSensor,
    useSensors,
} from "@dnd-kit/core";
import {
    arrayMove,
    SortableContext,
    sortableKeyboardCoordinates,
    horizontalListSortingStrategy,
    verticalListSortingStrategy,
    useSortable
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { io } from "socket.io-client";
import { fetchBoard, createList, updateList, deleteList, createTask, updateTask, deleteTask } from "../../api";
import ShareModal from "../../components/board/ShareModal";

// --- Components ---

const TaskItem = ({ task, onDelete }) => {
    const {
        attributes,
        listeners,
        setNodeRef,
        transform,
        transition,
        isDragging
    } = useSortable({ id: task._id, data: { type: "Task", task } });

    const style = {
        transform: CSS.Transform.toString(transform),
        transition,
        opacity: isDragging ? 0.5 : 1,
    };

    return (
        <div
            ref={setNodeRef}
            style={style}
            {...attributes}
            {...listeners}
            className="bg-white p-3 rounded shadow-sm mb-2 cursor-grab active:cursor-grabbing group relative"
        >
            <div className="font-medium">{task.title}</div>
            {task.description && <div className="text-sm text-gray-500 mt-1">{task.description}</div>}
            <button
                onClick={(e) => { e.stopPropagation(); onDelete(task._id); }}
                className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 text-gray-400 hover:text-red-500"
            >
                ×
            </button>
        </div>
    );
};

const ListItem = ({ list, tasks, onAddTask, onDeleteList, onDeleteTask }) => {
    const {
        attributes,
        listeners,
        setNodeRef,
        transform,
        transition,
        isDragging
    } = useSortable({ id: list._id, data: { type: "List", list } });

    const [newTaskTitle, setNewTaskTitle] = useState("");

    const style = {
        transform: CSS.Transform.toString(transform),
        transition,
        opacity: isDragging ? 0.5 : 1,
    };

    const handleSubmitTask = (e) => {
        e.preventDefault();
        if (!newTaskTitle.trim()) return;
        onAddTask(list._id, newTaskTitle);
        setNewTaskTitle("");
    }

    return (
        <div
            ref={setNodeRef}
            style={style}
            className="bg-gray-100 w-72 flex-shrink-0 rounded-lg p-3 flex flex-col max-h-full"
        >
            <div
                {...attributes}
                {...listeners}
                className="font-bold text-gray-700 mb-3 flex justify-between items-center cursor-grab active:cursor-grabbing p-1"
            >
                <span>{list.title}</span>
                <button onClick={() => onDeleteList(list._id)} className="text-gray-400 hover:text-red-500">×</button>
            </div>

            <div className="flex-1 overflow-y-auto min-h-0">
                <SortableContext items={tasks.map(t => t._id)} strategy={verticalListSortingStrategy}>
                    {tasks.map((task) => (
                        <TaskItem key={task._id} task={task} onDelete={onDeleteTask} />
                    ))}
                </SortableContext>
            </div>

            <form onSubmit={handleSubmitTask} className="mt-2">
                <input
                    type="text"
                    placeholder="+ Add a task"
                    className="w-full p-2 rounded border border-gray-300 focus:outline-none focus:border-blue-500"
                    value={newTaskTitle}
                    onChange={(e) => setNewTaskTitle(e.target.value)}
                />
            </form>
        </div>
    );
};

// --- Main Board View ---

const BoardView = () => {
    const { id: boardId } = useParams();
    const navigate = useNavigate();
    const [board, setBoard] = useState(null);
    const [lists, setLists] = useState([]);
    const [tasks, setTasks] = useState([]);
    const [activeId, setActiveId] = useState(null);
    const [socket, setSocket] = useState(null);
    const [newListTitle, setNewListTitle] = useState("");
    const [showShareModal, setShowShareModal] = useState(false);

    const sensors = useSensors(
        useSensor(PointerSensor, {
            activationConstraint: { distance: 5 },
        }),
        useSensor(KeyboardSensor, {
            coordinateGetter: sortableKeyboardCoordinates,
        })
    );

    // Initial Fetch & Socket Setup
    useEffect(() => {
        const loadBoard = async () => {
            try {
                const { data } = await fetchBoard(boardId);
                setBoard(data);
                setLists(data.lists);
                setTasks(data.tasks);
            } catch (error) {
                console.error("Failed to load board", error);
                navigate("/");
            }
        };

        loadBoard();

        const newSocket = io("http://localhost:5001");
        setSocket(newSocket);

        newSocket.emit("joinBoard", boardId);

        newSocket.on("taskCreated", (task) => {
            setTasks(prev => {
                if (prev.find(t => t._id === task._id)) return prev;
                return [...prev, task];
            });
        });

        newSocket.on("taskUpdated", (updatedTask) => {
            setTasks(prev => prev.map(t => t._id === updatedTask._id ? updatedTask : t));
        });

        newSocket.on("taskDeleted", (taskId) => {
            setTasks(prev => prev.filter(t => t._id !== taskId));
        });

        newSocket.on("listCreated", (list) => {
            setLists(prev => {
                if (prev.find(l => l._id === list._id)) return prev;
                return [...prev, list];
            });
        });

        newSocket.on("listUpdated", (updatedList) => {
            setLists(prev => prev.map(l => l._id === updatedList._id ? updatedList : l));
        });

        newSocket.on("listDeleted", (listId) => {
            setLists(prev => prev.filter(l => l._id !== listId));
        });

        return () => newSocket.disconnect();
    }, [boardId, navigate]);


    // Handlers
    const handleDragStart = (event) => {
        setActiveId(event.active.id);
    };

    const handleDragOver = (event) => {
        const { active, over } = event;
        if (!over) return;

        const activeId = active.id;
        const overId = over.id;

        if (activeId === overId) return;

        const isActiveTask = active.data.current?.type === "Task";
        const isOverTask = over.data.current?.type === "Task";
        const isOverList = over.data.current?.type === "List";

        if (!isActiveTask) return;

        // Task over Task
        if (isActiveTask && isOverTask) {
            setTasks((tasks) => {
                const activeIndex = tasks.findIndex((t) => t._id === activeId);
                const overIndex = tasks.findIndex((t) => t._id === overId);

                if (tasks[activeIndex].listId !== tasks[overIndex].listId) {
                    tasks[activeIndex].listId = tasks[overIndex].listId;
                }

                return arrayMove(tasks, activeIndex, overIndex);
            })
        }

        // Task over List (Empty list or just hovering list container)
        if (isActiveTask && isOverList) {
            setTasks((tasks) => {
                const activeIndex = tasks.findIndex((t) => t._id === activeId);
                if (tasks[activeIndex].listId !== overId) {
                    tasks[activeIndex].listId = overId;
                    // Move to end of list visually? Or just let standard sort logic handle?
                    // Usually arrayMove isn't needed here if we just change listId, 
                    // but DND-Kit expects index stability.
                    // We will just change listId state locally for smooth UI.
                    return [...tasks];
                }
                return tasks;
            })
        }

    };

    const handleDragEnd = async (event) => {
        const { active, over } = event;
        setActiveId(null);

        if (!over) return;

        const activeId = active.id;
        const overId = over.id;

        const activeType = active.data.current?.type;

        if (activeType === "List") {
            if (activeId !== overId) {
                const oldIndex = lists.findIndex(l => l._id === activeId);
                const newIndex = lists.findIndex(l => l._id === overId);

                const newLists = arrayMove(lists, oldIndex, newIndex);
                setLists(newLists);

                // Persist order
                // For simplicity, we might just update the moved list's position
                // In a real app, you'd batch update all positions.
                // Here we just accept client-side reorder visual for now or implement full reorder API.
                // Let's implement basic persistence: update target list's position? 
                // Actually, Trello style often uses floating point positions or linked lists.
                // We used simple numbers. We'll skip complex reorder persistence for this MVP 
                // and just update the moved item's position if needed, 
                // but ideally we should update ALL affected.

                // For this interview MVP, we will just update the UI locally mostly
                // unless we implement a 'reorderLists' API.
                // We'll update just the moved one for "position" field sake.
                await updateList(activeId, { position: newIndex + 1 });
            }
        }

        if (activeType === "Task") {
            const activeTask = tasks.find(t => t._id === activeId);
            const overTask = tasks.find(t => t._id === overId);

            // If dropped on a list
            if (over.data.current?.type === "List") {
                const newListId = overId;
                if (activeTask.listId !== newListId) {
                    // Moved to empty list or end of list
                    const updatedTask = { ...activeTask, listId: newListId };
                    setTasks(tasks.map(t => t._id === activeId ? updatedTask : t));
                    await updateTask(activeId, { listId: newListId });
                }
            }
            // Dropped on another task
            else if (overTask) {
                const oldIndex = tasks.findIndex(t => t._id === activeId);
                const newIndex = tasks.findIndex(t => t._id === overId);

                if (activeTask.listId !== overTask.listId) {
                    // Changed list
                    const updatedTask = { ...activeTask, listId: overTask.listId };
                    setTasks(arrayMove(tasks.map(t => t._id === activeId ? updatedTask : t), oldIndex, newIndex));
                    await updateTask(activeId, { listId: overTask.listId });
                } else {
                    // Same list reorder
                    if (oldIndex !== newIndex) {
                        setTasks(arrayMove(tasks, oldIndex, newIndex));
                        // Persist? Skip complex reorder API for MVP.
                        await updateTask(activeId, { position: newIndex + 1 });
                    }
                }
            }
        }
    };

    // Create List
    const handleCreateList = async (e) => {
        e.preventDefault();
        if (!newListTitle.trim()) return;
        try {
            const { data } = await createList({ boardId, title: newListTitle });
            // Socket will handle update, but optimistic update is good practice. 
            // We rely on socket for now.
            setNewListTitle("");
        } catch (error) {
            console.error(error);
        }
    }

    // Create Task
    const handleCreateTask = async (listId, title) => {
        try {
            await createTask({ boardId, listId, title, position: 1000, createdBy: "user" }); // position logic simplified
        } catch (error) {
            console.error(error);
        }
    }

    // Delete List
    const handleDeleteList = async (listId) => {
        if (!confirm("Delete this list and all its tasks?")) return;
        try {
            await deleteList(listId);
        } catch (error) { console.error(error); }
    }

    // Delete Task
    const handleDeleteTask = async (taskId) => {
        try {
            await deleteTask(taskId);
        } catch (error) { console.error(error); }
    }


    const sortedLists = useMemo(() => [...lists].sort((a, b) => a.position - b.position), [lists]); // Crude sort, rely on array order usually
    // Better: Rely on the order in the `lists` array which is managed by dnd-kit

    return (
        <div className="h-screen flex flex-col bg-blue-500">
            {/* Header */}
            <div className="bg-black/20 p-4 text-white flex justify-between items-center backdrop-blur-sm">
                <div className="flex items-center gap-4">
                    <h1 className="font-bold text-xl">{board?.title}</h1>
                    <button
                        onClick={() => setShowShareModal(true)}
                        className="bg-white/20 hover:bg-white/30 px-3 py-1 rounded text-sm flex items-center gap-2"
                    >
                        <span>🔗</span> Share
                    </button>
                </div>
                <button onClick={() => navigate("/")} className="bg-white/20 hover:bg-white/30 px-3 py-1 rounded">Dashboard</button>
            </div>

            {showShareModal && (
                <ShareModal
                    shareToken={board?.shareToken}
                    onClose={() => setShowShareModal(false)}
                />
            )}

            {/* Board Canvas */}
            <DndContext
                sensors={sensors}
                collisionDetection={closestCorners}
                onDragStart={handleDragStart}
                onDragOver={handleDragOver}
                onDragEnd={handleDragEnd}
            >
                <div className="flex-1 overflow-x-auto p-6 flex items-start gap-4">
                    <SortableContext items={lists.map(l => l._id)} strategy={horizontalListSortingStrategy}>
                        {lists.map((list) => (
                            <ListItem
                                key={list._id}
                                list={list}
                                tasks={tasks.filter(t => t.listId === list._id).sort((a, b) => a.position - b.position)} // Ensure tasks sorted locally
                                onAddTask={handleCreateTask}
                                onDeleteList={handleDeleteList}
                                onDeleteTask={handleDeleteTask}
                            />
                        ))}
                    </SortableContext>

                    {/* Add List Button */}
                    <div className="w-72 flex-shrink-0 bg-white/20 rounded-lg p-3">
                        <form onSubmit={handleCreateList}>
                            <input
                                type="text"
                                placeholder="+ Add another list"
                                className="w-full p-2 rounded bg-transparent placeholder-white text-white focus:bg-white focus:text-black border border-transparent focus:border-blue-500 transition"
                                value={newListTitle}
                                onChange={(e) => setNewListTitle(e.target.value)}
                            />
                        </form>
                    </div>
                </div>

                <DragOverlay>
                    {activeId ? (
                        lists.find(l => l._id === activeId) ? (
                            <div className="bg-gray-100 w-72 h-32 rounded-lg p-3 opacity-90 border-2 border-blue-500 transform rotate-3 cursor-grabbing shadow-xl">
                                <span className="font-bold text-gray-700">{lists.find(l => l._id === activeId)?.title}</span>
                            </div>
                        ) : (
                            <div className="bg-white p-3 rounded shadow-lg transform rotate-3 cursor-grabbing w-64 border-2 border-blue-500">
                                {tasks.find(t => t._id === activeId)?.title}
                            </div>
                        )
                    ) : null}
                </DragOverlay>
            </DndContext>
        </div>
    );
};

export default BoardView;
