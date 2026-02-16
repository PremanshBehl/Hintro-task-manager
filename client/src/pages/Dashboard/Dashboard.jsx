import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { Plus, Link as LinkIcon, LogOut, Layout, Clock } from "lucide-react";
import { fetchBoards, createBoard } from "../../api";
import { useAuth } from "../../context/AuthContext";

const Dashboard = () => {
    const navigate = useNavigate();
    const [boards, setBoards] = useState([]);
    const [newBoardTitle, setNewBoardTitle] = useState("");
    const [joinToken, setJoinToken] = useState("");
    const { user, logout } = useAuth();
    const [isCreating, setIsCreating] = useState(false);

    useEffect(() => {
        loadBoards();
    }, []);

    const loadBoards = async () => {
        try {
            const { data } = await fetchBoards();
            setBoards(data);
        } catch (error) {
            console.error("Failed to load boards", error);
        }
    };

    const handleCreateBoard = async (e) => {
        e.preventDefault();
        if (!newBoardTitle.trim()) return;

        try {
            const { data } = await createBoard({ title: newBoardTitle });
            setBoards([data, ...boards]);
            setNewBoardTitle("");
            setIsCreating(false);
        } catch (error) {
            console.error("Failed to create board", error);
        }
    };

    const handleJoinBoard = (e) => {
        e.preventDefault();
        if (!joinToken.trim()) return;

        let token = joinToken.trim();
        if (token.includes("/join/")) {
            token = token.split("/join/").pop();
        }

        navigate(`/join/${token}`);
    };

    return (
        <div className="min-h-screen bg-[#f8fafc] text-slate-900">
            {/* Header */}
            <header className="glass-header sticky top-0 z-50 px-6 py-4 flex justify-between items-center">
                <div className="flex items-center gap-2">
                    <div className="w-10 h-10 premium-gradient rounded-xl flex items-center justify-center text-white shadow-lg shadow-indigo-200">
                        <Layout size={24} />
                    </div>
                    <h1 className="text-2xl font-black bg-clip-text text-transparent premium-gradient">
                        TaskFlow
                    </h1>
                </div>

                <div className="flex items-center gap-6">
                    <div className="hidden sm:flex flex-col items-end">
                        <span className="text-sm font-bold text-slate-700">{user?.name}</span>
                        <span className="text-xs text-slate-400">Personal Workspace</span>
                    </div>
                    <button
                        onClick={logout}
                        className="group flex items-center gap-2 px-4 py-2 rounded-xl text-slate-500 hover:text-red-600 hover:bg-red-50 transition-all duration-300"
                    >
                        <LogOut size={20} className="group-hover:rotate-12 transition-transform" />
                        <span className="font-semibold text-sm">Logout</span>
                    </button>
                </div>
            </header>

            <main className="container mx-auto px-6 py-12 max-w-7xl">
                {/* Hero / Action Section */}
                <div className="mb-12 flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
                    <motion.div
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.5 }}
                    >
                        <h2 className="text-4xl font-extrabold tracking-tight text-slate-900 mb-2">
                            Welcome back, {user?.name.split(' ')[0]}!
                        </h2>
                        <p className="text-slate-500 font-medium">
                            You have {boards.length} active boards to manage.
                        </p>
                    </motion.div>

                    <div className="flex gap-3 w-full md:w-auto">
                        <motion.button
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                            onClick={() => setIsCreating(true)}
                            className="flex-1 md:flex-none premium-button premium-gradient text-white flex items-center justify-center gap-2"
                        >
                            <Plus size={20} />
                            Create Board
                        </motion.button>
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                    {/* Create/Join Card Overlay Modal (Simulation) */}
                    <AnimatePresence>
                        {isCreating && (
                            <motion.div
                                initial={{ opacity: 0, scale: 0.9 }}
                                animate={{ opacity: 1, scale: 1 }}
                                exit={{ opacity: 0, scale: 0.9 }}
                                className="col-span-1 md:col-span-2 bg-white rounded-3xl p-8 shadow-2xl border border-slate-100 flex flex-col justify-center gap-6"
                            >
                                <div className="flex justify-between items-center">
                                    <h3 className="text-xl font-bold text-slate-800">New Workspace</h3>
                                    <button onClick={() => setIsCreating(false)} className="text-slate-400 hover:text-slate-600">✕</button>
                                </div>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                    <div className="space-y-4">
                                        <p className="text-sm font-bold text-slate-500 uppercase tracking-wider">Start Fresh</p>
                                        <form onSubmit={handleCreateBoard} className="space-y-3">
                                            <input
                                                autoFocus
                                                type="text"
                                                placeholder="Enter board title..."
                                                className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:border-indigo-500 focus:ring-4 focus:ring-indigo-100 transition-all outline-none"
                                                value={newBoardTitle}
                                                onChange={(e) => setNewBoardTitle(e.target.value)}
                                            />
                                            <button
                                                type="submit"
                                                disabled={!newBoardTitle.trim()}
                                                className="w-full premium-button bg-slate-900 text-white hover:bg-slate-800"
                                            >
                                                Create Project
                                            </button>
                                        </form>
                                    </div>
                                    <div className="space-y-4">
                                        <p className="text-sm font-bold text-slate-500 uppercase tracking-wider">Join Team</p>
                                        <form onSubmit={handleJoinBoard} className="space-y-3">
                                            <div className="relative">
                                                <LinkIcon size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
                                                <input
                                                    type="text"
                                                    placeholder="Paste share link..."
                                                    className="w-full pl-11 pr-4 py-3 rounded-xl border border-slate-200 focus:border-indigo-500 focus:ring-4 focus:ring-indigo-100 transition-all outline-none"
                                                    value={joinToken}
                                                    onChange={(e) => setJoinToken(e.target.value)}
                                                />
                                            </div>
                                            <button
                                                type="submit"
                                                disabled={!joinToken.trim()}
                                                className="w-full premium-button border-2 border-slate-200 text-slate-700 hover:bg-slate-50"
                                            >
                                                Join Board
                                            </button>
                                        </form>
                                    </div>
                                </div>
                            </motion.div>
                        )}
                    </AnimatePresence>

                    {/* Board List */}
                    {boards.map((board, index) => (
                        <motion.div
                            key={board._id}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: index * 0.05 }}
                        >
                            <Link
                                to={`/board/${board._id}`}
                                className="group block bg-white p-6 rounded-3xl shadow-sm border border-slate-100 hover:shadow-xl hover:shadow-indigo-100/50 hover:border-indigo-100 transition-all duration-500 h-48 relative overflow-hidden"
                            >
                                <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-50 rounded-full -mr-16 -mt-16 group-hover:bg-indigo-100 transition-colors" />

                                <div className="relative h-full flex flex-col justify-between">
                                    <div>
                                        <h3 className="font-bold text-xl text-slate-800 mb-2 truncate group-hover:text-indigo-600 transition-colors">
                                            {board.title}
                                        </h3>
                                        <div className="flex items-center gap-2 text-slate-400">
                                            <Clock size={14} />
                                            <span className="text-xs font-medium uppercase tracking-wider">
                                                Active Session
                                            </span>
                                        </div>
                                    </div>

                                    <div className="flex items-center justify-between">
                                        <span className="text-xs font-bold text-slate-400">
                                            {new Date(board.updatedAt).toLocaleDateString(undefined, {
                                                month: 'short',
                                                day: 'numeric'
                                            })}
                                        </span>
                                        <div className="flex -space-x-2">
                                            {[1, 2].map((i) => (
                                                <div key={i} className="w-8 h-8 rounded-full border-2 border-white bg-slate-100 flex items-center justify-center text-[10px] font-bold text-slate-500">
                                                    U{i}
                                                </div>
                                            ))}
                                            <div className="w-8 h-8 rounded-full border-2 border-white premium-gradient flex items-center justify-center text-[10px] font-bold text-white">
                                                +
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </Link>
                        </motion.div>
                    ))}
                </div>
            </main>
        </div>
    );
};

export default Dashboard;
