import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { fetchBoards, createBoard } from "../../api";
import { useAuth } from "../../context/AuthContext";

const Dashboard = () => {
    const navigate = useNavigate();
    const [boards, setBoards] = useState([]);
    const [newBoardTitle, setNewBoardTitle] = useState("");
    const [joinToken, setJoinToken] = useState("");
    const { user, logout } = useAuth();

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
        } catch (error) {
            console.error("Failed to create board", error);
        }
    };

    const handleJoinBoard = (e) => {
        e.preventDefault();
        if (!joinToken.trim()) return;

        // Extract token if a full link was pasted
        let token = joinToken.trim();
        if (token.includes("/join/")) {
            token = token.split("/join/").pop();
        }

        navigate(`/join/${token}`);
    };

    return (
        <div className="min-h-screen bg-gray-100">
            <nav className="bg-white shadow p-4 flex justify-between items-center">
                <h1 className="text-xl font-bold">TaskFlow</h1>
                <div className="flex items-center gap-4">
                    <span>Welcome, {user?.name}</span>
                    <button
                        onClick={logout}
                        className="text-red-500 hover:text-red-700"
                    >
                        Logout
                    </button>
                </div>
            </nav>

            <div className="container mx-auto p-8">
                <h2 className="text-2xl font-bold mb-6">Your Boards</h2>

                <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-6">
                    {/* Join Board Card */}
                    <div className="bg-white p-6 rounded-lg shadow-md border-2 border-dashed border-blue-200">
                        <h3 className="font-semibold mb-4">Join via Link</h3>
                        <form onSubmit={handleJoinBoard}>
                            <input
                                type="text"
                                placeholder="Paste link or token"
                                className="w-full p-2 border rounded mb-2 text-sm"
                                value={joinToken}
                                onChange={(e) => setJoinToken(e.target.value)}
                            />
                            <button
                                type="submit"
                                className="w-full bg-green-600 text-white p-2 rounded hover:bg-green-700"
                                disabled={!joinToken.trim()}
                            >
                                Join Board
                            </button>
                        </form>
                    </div>

                    {/* Create Board Card */}
                    <div className="bg-white p-6 rounded-lg shadow-md">
                        <h3 className="font-semibold mb-4">Create New Board</h3>
                        <form onSubmit={handleCreateBoard}>
                            <input
                                type="text"
                                placeholder="Board Title"
                                className="w-full p-2 border rounded mb-2"
                                value={newBoardTitle}
                                onChange={(e) => setNewBoardTitle(e.target.value)}
                            />
                            <button
                                type="submit"
                                className="w-full bg-blue-600 text-white p-2 rounded hover:bg-blue-700"
                                disabled={!newBoardTitle.trim()}
                            >
                                Create
                            </button>
                        </form>
                    </div>

                    {/* Board List */}
                    {boards.map((board) => (
                        <Link
                            key={board._id}
                            to={`/board/${board._id}`}
                            className="bg-white p-6 rounded-lg shadow-md hover:shadow-lg transition cursor-pointer flex flex-col justify-between h-32"
                        >
                            <h3 className="font-bold text-lg">{board.title}</h3>
                            <span className="text-gray-500 text-sm">
                                Last updated: {new Date(board.updatedAt).toLocaleDateString()}
                            </span>
                        </Link>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default Dashboard;
