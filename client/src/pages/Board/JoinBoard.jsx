import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { joinBoard } from "../../api";

const JoinBoard = () => {
    const { token } = useParams();
    const navigate = useNavigate();
    const [error, setError] = useState(null);

    useEffect(() => {
        const handleJoin = async () => {
            try {
                const { data } = await joinBoard(token);
                // navigate to the board
                navigate(`/board/${data.boardId}`);
            } catch (err) {
                setError(err.response?.data?.message || "Failed to join board");
            }
        };

        if (token) {
            handleJoin();
        }
    }, [token, navigate]);

    if (error) {
        return (
            <div className="h-screen flex items-center justify-center bg-gray-50 p-4">
                <div className="bg-white p-8 rounded-lg shadow-md max-w-md w-full text-center">
                    <h1 className="text-2xl font-bold text-red-600 mb-4">Oops!</h1>
                    <p className="text-gray-600 mb-6">{error}</p>
                    <button
                        onClick={() => navigate("/")}
                        className="bg-blue-500 text-white px-6 py-2 rounded hover:bg-blue-600 transition"
                    >
                        Go to Dashboard
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="h-screen flex items-center justify-center bg-gray-50 text-center">
            <div>
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
                <p className="text-gray-600 font-medium">Joining the workspace...</p>
            </div>
        </div>
    );
};

export default JoinBoard;
