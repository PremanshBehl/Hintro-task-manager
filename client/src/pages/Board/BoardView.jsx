import { useState, useEffect, useMemo } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
    ChevronLeft,
    Layout,
    Share2,
    Activity as ActivityIcon,
    Clock,
    Plus,
    X,
    Copy,
    Check,
    CheckSquare,
    MoreVertical
} from "lucide-react";
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
import { fetchBoard, createList, updateList, deleteList, createTask, updateTask, deleteTask, fetchActivities } from "../../api";
import ShareModal from "../../components/board/ShareModal";
import ActivitySidebar from "../../components/board/ActivitySidebar";
import TaskDetailModal from "../../components/task/TaskDetailModal";

const socket = io("http://localhost:5001");

// --- Components ---

const TaskItem = ({ task, onClick }) => {
    const {
        attributes,
        listeners,
        setNodeRef,
        transform,
        transition,
        isDragging,
    } = useSortable({
        id: task._id,
        data: {
            type: "Task",
            task,
        },
    });

    const style = {
        transition,
        transform: CSS.Translate.toString(transform),
        opacity: isDragging ? 0.3 : 1,
    };

    const completedItems = task.checklist?.filter(i => i.completed)?.length || 0;
    const totalItems = task.checklist?.length || 0;

    const isOverdue = task.dueDate && new Date(task.dueDate) < new Date();

    return (
        <motion.div
            ref={setNodeRef}
            style={style}
            {...attributes}
            {...listeners}
            whileHover={{ y: -2, shadow: "0 10px 15px -3px rgba(0, 0, 0, 0.1)" }}
            onClick={() => onClick(task)}
            className="bg-white p-4 rounded-2xl shadow-sm border border-slate-100 hover:border-indigo-200 transition-all cursor-pointer group mb-3 last:mb-0"
        >
            <div className="flex gap-1.5 mb-2 flex-wrap">
                {task.labels?.map((label, idx) => (
                    <div
                        key={idx}
                        className="h-1.5 w-8 rounded-full"
                        style={{ backgroundColor: label.color }}
                    />
                ))}
            </div>

            <h4 className="font-bold text-slate-800 text-sm mb-3 group-hover:text-indigo-600 transition-colors">
                {task.title}
            </h4>

            <div className="flex items-center gap-3 text-slate-400">
                {totalItems > 0 && (
                    <div className="flex items-center gap-1 bg-slate-50 px-2 py-0.5 rounded-lg border border-slate-100">
                        <CheckSquare size={12} className={completedItems === totalItems ? "text-green-500" : "text-slate-400"} />
                        <span className={`text-[10px] font-bold ${completedItems === totalItems ? "text-green-600" : "text-slate-500"}`}>
                            {completedItems}/{totalItems}
                        </span>
                    </div>
                )}

                {task.dueDate && (
                    <div className={`flex items-center gap-1 px-2 py-0.5 rounded-lg border ${isOverdue ? "bg-red-50 border-red-100 text-red-500" : "bg-slate-50 border-slate-100 text-slate-400"
                        }`}>
                        <Clock size={12} />
                        <span className={`text-[10px] font-bold ${isOverdue ? "text-red-600" : "text-slate-500"}`}>
                            {new Date(task.dueDate).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
                        </span>
                    </div>
                )}
            </div>
        </motion.div>
    );
};

const ListItem = ({ list, tasks, onAddTask, onDeleteList, onClickTask }) => {
    const [isAdding, setIsAdding] = useState(false);
    const [newTaskTitle, setNewTaskTitle] = useState("");

    const {
        attributes,
        listeners,
        setNodeRef,
        transform,
        transition,
        isDragging,
    } = useSortable({
        id: list._id,
        data: {
            type: "List",
            list,
        },
    });

    const style = {
        transition,
        transform: CSS.Translate.toString(transform),
        opacity: isDragging ? 0.5 : 1,
    };

    const handleCreateTask = (e) => {
        e.preventDefault();
        if (!newTaskTitle.trim()) return;
        onAddTask(list._id, newTaskTitle);
        setNewTaskTitle("");
        setIsAdding(false);
    };

    return (
        <div
            ref={setNodeRef}
            style={style}
            className="flex-shrink-0 w-80 max-h-full flex flex-col"
        >
            <div className="glass-card rounded-[2rem] p-5 flex flex-col max-h-full overflow-hidden">
                <div
                    {...attributes}
                    {...listeners}
                    className="flex justify-between items-center mb-6 cursor-grab active:cursor-grabbing px-1"
                >
                    <div className="flex items-center gap-3">
                        <h3 className="font-black text-slate-800 tracking-tight">{list.title}</h3>
                        <span className="bg-slate-100 text-slate-500 text-[10px] font-black px-2 py-0.5 rounded-full uppercase">
                            {tasks.length}
                        </span>
                    </div>
                    <button
                        onClick={() => onDeleteList(list._id)}
                        className="text-slate-300 hover:text-red-500 p-1 hover:bg-red-50 rounded-lg transition-colors"
                    >
                        <X size={18} />
                    </button>
                </div>

                <div className="flex-grow overflow-y-auto min-h-[50px] px-1 custom-scrollbar pb-2">
                    <SortableContext items={tasks.map(t => t._id)} strategy={verticalListSortingStrategy}>
                        {tasks.map((task) => (
                            <TaskItem key={task._id} task={task} onClick={onClickTask} />
                        ))}
                    </SortableContext>
                </div>

                <div className="mt-4 pt-4 border-t border-white/40">
                    {isAdding ? (
                        <motion.form
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            onSubmit={handleCreateTask}
                            className="space-y-3"
                        >
                            <textarea
                                autoFocus
                                className="w-full p-4 text-sm rounded-2xl border border-slate-200 focus:border-indigo-400 focus:ring-4 focus:ring-indigo-50 outline-none transition-all resize-none shadow-sm"
                                placeholder="What needs to be done?"
                                rows={3}
                                value={newTaskTitle}
                                onChange={(e) => setNewTaskTitle(e.target.value)}
                                onKeyDown={(e) => {
                                    if (e.key === "Enter" && !e.shiftKey) {
                                        handleCreateTask(e);
                                    }
                                }}
                            />
                            <div className="flex gap-2">
                                <button
                                    type="submit"
                                    className="flex-grow premium-button bg-indigo-600 text-white text-xs py-2.5"
                                >
                                    Confirm Task
                                </button>
                                <button
                                    onClick={() => setIsAdding(false)}
                                    className="px-3 rounded-xl border border-slate-200 text-slate-400 hover:bg-slate-50 transition-colors"
                                >
                                    <X size={16} />
                                </button>
                            </div>
                        </motion.form>
                    ) : (
                        <motion.button
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                            onClick={() => setIsAdding(true)}
                            className="w-full flex items-center justify-center gap-2 py-3 rounded-2xl border-2 border-dashed border-slate-200 text-slate-400 font-bold text-xs hover:border-indigo-300 hover:text-indigo-500 hover:bg-indigo-50/30 transition-all"
                        >
                            <Plus size={16} />
                            Add Activity
                        </motion.button>
                    )}
                </div>
            </div>
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
    const [newListTitle, setNewListTitle] = useState("");
    const [showShareModal, setShowShareModal] = useState(false);
    const [selectedTask, setSelectedTask] = useState(null);
    const [activities, setActivities] = useState([]);
    const [showJournal, setShowJournal] = useState(false);
    const [copied, setCopied] = useState(false);

    const sensors = useSensors(
        useSensor(PointerSensor, {
            activationConstraint: { distance: 5 },
        }),
        useSensor(KeyboardSensor, {
            coordinateGetter: sortableKeyboardCoordinates,
        })
    );

    useEffect(() => {
        loadBoard();
        socket.emit("joinBoard", boardId);

        socket.on("taskCreated", (task) => {
            setTasks(prev => [...prev, task]);
        });

        socket.on("taskUpdated", (updatedTask) => {
            setTasks(prev => prev.map(t => t._id === updatedTask._id ? updatedTask : t));
            setSelectedTask(prev => prev?._id === updatedTask._id ? updatedTask : prev);
        });

        socket.on("taskDeleted", (taskId) => {
            setTasks(prev => prev.filter(t => t._id !== taskId));
        });

        socket.on("listCreated", (list) => {
            setLists(prev => [...prev, list]);
        });

        socket.on("listDeleted", (listId) => {
            setLists(prev => prev.filter(l => l._id !== listId));
        });

        socket.on("newActivity", (activity) => {
            setActivities(prev => [activity, ...prev]);
        });

        return () => {
            socket.off("taskCreated");
            socket.off("taskUpdated");
            socket.off("taskDeleted");
            socket.off("listCreated");
            socket.off("listDeleted");
            socket.off("newActivity");
        };
    }, [boardId]);

    const loadBoard = async () => {
        try {
            const { data } = await fetchBoard(boardId);
            setBoard(data);
            setLists(data.lists);
            setTasks(data.tasks);
            const { data: activityData } = await fetchActivities(boardId);
            setActivities(activityData);
        } catch (error) {
            console.error("Failed to load board", error);
            navigate("/");
        }
    };

    const handleAddList = async (e) => {
        e.preventDefault();
        if (!newListTitle.trim()) return;
        try {
            const { data } = await createList({ boardId, title: newListTitle });
            setNewListTitle("");
        } catch (error) {
            console.error(error);
        }
    };

    const handleAddTask = async (listId, title) => {
        try {
            await createTask({ boardId, listId, title, position: tasks.length + 1 });
        } catch (error) {
            console.error(error);
        }
    };

    const handleDeleteList = async (listId) => {
        if (!confirm("Delete this list and all its tasks?")) return;
        try {
            await deleteList(listId);
        } catch (error) {
            console.error(error);
        }
    };

    const handleUpdateTask = async (taskId, updates) => {
        try {
            await updateTask(taskId, updates);
        } catch (error) {
            console.error("Failed to update task", error);
        }
    };

    const handleDeleteTask = async (taskId) => {
        try {
            await deleteTask(taskId);
        } catch (error) {
            console.error("Failed to delete task", error);
        }
    };

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

        if (isActiveTask && isOverTask) {
            setTasks((tasks) => {
                const activeIndex = tasks.findIndex((t) => t._id === activeId);
                const overIndex = tasks.findIndex((t) => t._id === overId);

                if (tasks[activeIndex].listId !== tasks[overIndex].listId) {
                    tasks[activeIndex].listId = tasks[overIndex].listId;
                }

                return arrayMove(tasks, activeIndex, overIndex);
            });
        }

        if (isActiveTask && isOverList) {
            setTasks((tasks) => {
                const activeIndex = tasks.findIndex((t) => t._id === activeId);
                if (tasks[activeIndex].listId !== overId) {
                    tasks[activeIndex].listId = overId;
                    return [...tasks];
                }
                return tasks;
            });
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
                await updateList(activeId, { position: newIndex + 1 });
            }
        } else if (activeType === "Task") {
            const activeTask = tasks.find(t => t._id === activeId);
            const listTasks = tasks.filter(t => t.listId === activeTask.listId);
            const position = listTasks.findIndex(t => t._id === activeId) + 1;
            await updateTask(activeId, { listId: activeTask.listId, position });
        }
    };

    const copyToClipboard = () => {
        const link = `http://localhost:5173/join/${board.shareToken}`;
        navigator.clipboard.writeText(link);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    if (!board) return (
        <div className="min-h-screen flex items-center justify-center bg-slate-50">
            <div className="w-16 h-16 border-4 border-indigo-200 border-t-indigo-600 rounded-full animate-spin" />
        </div>
    );

    return (
        <div className="h-screen flex flex-col bg-[#f0f2f5] overflow-hidden font-sans text-slate-900">
            {/* Header */}
            <header className="glass-header z-30 px-8 py-5 flex justify-between items-center shrink-0">
                <div className="flex items-center gap-6">
                    <Link
                        to="/"
                        className="p-2 hover:bg-white/40 rounded-xl transition-colors text-slate-500 hover:text-indigo-600"
                    >
                        <ChevronLeft size={24} />
                    </Link>
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 premium-gradient rounded-xl flex items-center justify-center text-white shadow-lg shadow-indigo-200">
                            <Layout size={20} />
                        </div>
                        <h1 className="text-2xl font-black text-slate-800 tracking-tight">{board.title}</h1>
                    </div>
                </div>

                <div className="flex items-center gap-3">
                    <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => setShowShareModal(true)}
                        className="flex items-center gap-2 px-5 py-2.5 rounded-2xl bg-white/60 hover:bg-white shadow-sm border border-white/40 text-slate-700 font-bold text-sm transition-all"
                    >
                        <Share2 size={18} className="text-indigo-500" />
                        Share
                    </motion.button>

                    <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => setShowJournal(!showJournal)}
                        className={`flex items-center gap-2 px-5 py-2.5 rounded-2xl font-bold text-sm transition-all shadow-sm border ${showJournal
                            ? "premium-gradient text-white border-transparent"
                            : "bg-white/60 hover:bg-white text-slate-700 border-white/40"
                            }`}
                    >
                        <ActivityIcon size={18} />
                        Journal
                    </motion.button>
                </div>
            </header>

            <main className="flex-grow flex relative overflow-hidden">
                <div className="flex-grow overflow-x-auto overflow-y-hidden custom-scrollbar">
                    <DndContext
                        sensors={sensors}
                        collisionDetection={closestCorners}
                        onDragStart={handleDragStart}
                        onDragOver={handleDragOver}
                        onDragEnd={handleDragEnd}
                    >
                        <div className="flex items-start gap-8 p-10 h-full min-w-max">
                            <SortableContext items={(lists || []).map(l => l._id)} strategy={horizontalListSortingStrategy}>
                                {(lists || []).map((list) => (
                                    <ListItem
                                        key={list._id}
                                        list={list}
                                        tasks={(tasks || []).filter(t => t.listId === list._id).sort((a, b) => a.position - b.position)}
                                        onAddTask={handleAddTask}
                                        onDeleteList={handleDeleteList}
                                        onClickTask={setSelectedTask}
                                    />
                                ))}
                            </SortableContext>

                            <div className="w-80 flex-shrink-0">
                                <form onSubmit={handleAddList} className="glass-card rounded-[2rem] p-5">
                                    <input
                                        type="text"
                                        className="w-full p-4 mb-4 text-sm font-bold rounded-2xl border border-slate-200 focus:border-indigo-400 focus:ring-4 focus:ring-indigo-50 outline-none transition-all"
                                        placeholder="New Stage Title..."
                                        value={newListTitle}
                                        onChange={(e) => setNewListTitle(e.target.value)}
                                    />
                                    <button
                                        type="submit"
                                        disabled={!newListTitle.trim()}
                                        className="w-full premium-button premium-gradient text-white text-xs py-3"
                                    >
                                        Launch Stage
                                    </button>
                                </form>
                            </div>
                        </div>

                        <DragOverlay>
                            {activeId ? (
                                lists?.find(l => l._id === activeId) ? (
                                    <div className="rotate-3 opacity-90 scale-105">
                                        <ListItem
                                            list={lists.find(l => l._id === activeId)}
                                            tasks={tasks.filter(t => t.listId === activeId)}
                                        />
                                    </div>
                                ) : (
                                    <div className="rotate-3">
                                        <TaskItem task={tasks?.find(t => t._id === activeId)} />
                                    </div>
                                )
                            ) : null}
                        </DragOverlay>
                    </DndContext>
                </div>

                {/* Journal Sidebar */}
                <AnimatePresence>
                    {showJournal && (
                        <motion.aside
                            initial={{ x: "100%" }}
                            animate={{ x: 0 }}
                            exit={{ x: "100%" }}
                            transition={{ type: "spring", damping: 25, stiffness: 200 }}
                            className="w-96 flex-shrink-0 glass-header border-l-0 shadow-[-20px_0_50px_-20px_rgba(0,0,0,0.1)] z-20 flex flex-col"
                        >
                            <div className="p-8 flex justify-between items-center border-b border-white/20">
                                <div className="flex items-center gap-3">
                                    <ActivityIcon className="text-indigo-500" />
                                    <h2 className="text-xl font-black text-slate-800 tracking-tight">Journal</h2>
                                </div>
                                <button onClick={() => setShowJournal(false)} className="text-slate-400 hover:text-slate-600 p-2 hover:bg-slate-100 rounded-xl transition-colors">
                                    <X size={20} />
                                </button>
                            </div>

                            <div className="flex-grow overflow-y-auto p-6 space-y-6 custom-scrollbar">
                                {(activities || []).map((activity, idx) => (
                                    <motion.div
                                        initial={{ opacity: 0, x: 20 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        transition={{ delay: idx * 0.05 }}
                                        key={activity._id}
                                        className="flex gap-4 group"
                                    >
                                        <div className="shrink-0 w-10 h-10 rounded-2xl premium-gradient text-white flex items-center justify-center font-black text-sm shadow-md">
                                            {activity.userId?.name?.[0]?.toUpperCase() || "A"}
                                        </div>
                                        <div className="flex-grow">
                                            <div className="flex justify-between items-baseline mb-1">
                                                <p className="text-sm font-bold text-slate-800">{activity.userId?.name || "Someone"}</p>
                                                <span className="text-[10px] font-black uppercase text-slate-400">
                                                    {new Date(activity.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                                </span>
                                            </div>
                                            <p className="text-sm text-slate-500 leading-relaxed font-medium">
                                                {activity.action}
                                            </p>
                                        </div>
                                    </motion.div>
                                ))}
                            </div>
                        </motion.aside>
                    )}
                </AnimatePresence>
            </main>

            {/* Share Modal */}
            <AnimatePresence>
                {showShareModal && (
                    <div className="fixed inset-0 z-[100] flex items-center justify-center p-6">
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            onClick={() => setShowShareModal(false)}
                            className="absolute inset-0 bg-slate-900/60 backdrop-blur-md"
                        />
                        <motion.div
                            initial={{ scale: 0.9, opacity: 0, y: 20 }}
                            animate={{ scale: 1, opacity: 1, y: 0 }}
                            exit={{ scale: 0.9, opacity: 0, y: 20 }}
                            className="relative bg-white rounded-[2.5rem] shadow-2xl w-full max-w-lg overflow-hidden border border-white/20 p-8"
                        >
                            <div className="flex justify-between items-center mb-8">
                                <div>
                                    <h2 className="text-2xl font-black text-slate-800 tracking-tight">Expand Workspace</h2>
                                    <p className="text-slate-400 font-medium text-sm mt-1">Invite others to collaborate in real-time.</p>
                                </div>
                                <button
                                    onClick={() => setShowShareModal(false)}
                                    className="p-3 text-slate-300 hover:text-slate-500 hover:bg-slate-50 rounded-2xl transition-all"
                                >
                                    <X size={20} />
                                </button>
                            </div>

                            <div className="space-y-6">
                                <div className="space-y-3">
                                    <p className="text-xs font-black text-slate-400 uppercase tracking-widest pl-1">Sharable Link</p>
                                    <div className="flex gap-2 p-2 bg-slate-50 border border-slate-100 rounded-2xl">
                                        <input
                                            readOnly
                                            type="text"
                                            className="bg-transparent flex-grow px-3 py-2 text-sm text-slate-600 outline-none font-medium"
                                            value={`http://localhost:5173/join/${board.shareToken}`}
                                        />
                                        <button
                                            onClick={copyToClipboard}
                                            className={`px-4 py-2 rounded-xl font-bold text-xs flex items-center gap-2 transition-all ${copied
                                                ? "bg-green-500 text-white shadow-lg shadow-green-100"
                                                : "bg-slate-800 text-white hover:bg-slate-900"
                                                }`}
                                        >
                                            {copied ? <Check size={14} /> : <Copy size={14} />}
                                            {copied ? "Copied" : "Copy"}
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>

            {selectedTask && (
                <TaskDetailModal
                    task={selectedTask}
                    onUpdate={(updates) => handleUpdateTask(selectedTask._id, updates)}
                    onDelete={handleDeleteTask}
                    onClose={() => setSelectedTask(null)}
                />
            )}
        </div>
    );
};

export default BoardView;
