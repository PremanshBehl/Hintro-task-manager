import { formatDistanceToNow } from "date-fns";

const ActivitySidebar = ({ activities, onClose }) => {
    return (
        <div className="fixed top-0 right-0 h-full w-80 bg-white shadow-2xl z-50 flex flex-col transform transition-transform duration-300 ease-in-out">
            <div className="p-4 border-b flex justify-between items-center bg-gray-50">
                <h2 className="text-lg font-bold flex items-center gap-2">
                    <span>🕒</span> Activity Feed
                </h2>
                <button onClick={onClose} className="text-gray-500 hover:text-gray-700 text-2xl">×</button>
            </div>

            <div className="flex-1 overflow-y-auto p-4 space-y-4">
                {activities.length === 0 ? (
                    <div className="text-center text-gray-500 mt-10 italic">
                        No activity yet. Start collaborating!
                    </div>
                ) : (
                    activities.map((activity) => (
                        <div key={activity._id} className="flex gap-3 text-sm">
                            <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 font-bold flex-shrink-0">
                                {activity.userId?.name?.[0].toUpperCase() || "U"}
                            </div>
                            <div className="flex-1">
                                <p className="text-gray-800">
                                    <span className="font-bold">{activity.userId?.name || "Unknown User"}</span>{" "}
                                    {activity.action}
                                </p>
                                <p className="text-xs text-gray-500 mt-1">
                                    {formatDistanceToNow(new Date(activity.createdAt), { addSuffix: true })}
                                </p>
                            </div>
                        </div>
                    ))
                )}
            </div>
        </div>
    );
};

export default ActivitySidebar;
