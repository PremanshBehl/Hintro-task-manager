import { useState, useEffect } from "react";

const PRESET_COLORS = [
    { name: "Green", color: "bg-green-500" },
    { name: "Yellow", color: "bg-yellow-400" },
    { name: "Orange", color: "bg-orange-500" },
    { name: "Red", color: "bg-red-500" },
    { name: "Purple", color: "bg-purple-600" },
    { name: "Blue", color: "bg-blue-500" },
];

const TaskDetailModal = ({ task, onUpdate, onDelete, onClose }) => {
    const [title, setTitle] = useState(task.title);
    const [description, setDescription] = useState(task.description || "");
    const [labels, setLabels] = useState(task.labels || []);
    const [checklist, setChecklist] = useState(task.checklist || []);
    const [dueDate, setDueDate] = useState(task.dueDate ? new Date(task.dueDate).toISOString().split('T')[0] : "");
    const [newChecklistItem, setNewChecklistItem] = useState("");
    const [showLabelPicker, setShowLabelPicker] = useState(false);

    useEffect(() => {
        const timer = setTimeout(() => {
            if (title !== task.title || description !== task.description || JSON.stringify(labels) !== JSON.stringify(task.labels) || JSON.stringify(checklist) !== JSON.stringify(task.checklist) || dueDate !== (task.dueDate ? new Date(task.dueDate).toISOString().split('T')[0] : "")) {
                onUpdate(task._id, { title, description, labels, checklist, dueDate });
            }
        }, 1000);
        return () => clearTimeout(timer);
    }, [title, description, labels, checklist, dueDate]);

    const handleAddLabel = (colorObj) => {
        if (labels.find(l => l.color === colorObj.color)) {
            setLabels(labels.filter(l => l.color !== colorObj.color));
        } else {
            setLabels([...labels, { text: "", color: colorObj.color }]);
        }
    };

    const handleAddChecklistItem = (e) => {
        e.preventDefault();
        if (!newChecklistItem.trim()) return;
        setChecklist([...checklist, { text: newChecklistItem, completed: false }]);
        setNewChecklistItem("");
    };

    const toggleChecklistItem = (index) => {
        const newChecklist = [...checklist];
        newChecklist[index].completed = !newChecklist[index].completed;
        setChecklist(newChecklist);
    };

    const removeChecklistItem = (index) => {
        setChecklist(checklist.filter((_, i) => i !== index));
    };

    return (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4" onClick={onClose}>
            <div className="bg-gray-50 rounded-lg w-full max-w-2xl shadow-2xl flex flex-col max-h-[90vh]" onClick={e => e.stopPropagation()}>
                {/* Header */}
                <div className="p-4 border-b flex justify-between items-start">
                    <div className="flex-1 mr-4">
                        <input
                            type="text"
                            className="text-xl font-bold bg-transparent border-none focus:ring-2 focus:ring-blue-500 rounded px-1 w-full"
                            value={title}
                            onChange={(e) => setTitle(e.target.value)}
                        />
                        <p className="text-sm text-gray-500 ml-1">in list <span className="underline">Tasks</span></p>
                    </div>
                    <button onClick={onClose} className="text-gray-500 hover:text-gray-700 text-2xl">×</button>
                </div>

                <div className="flex-1 overflow-y-auto p-6 flex flex-col md:flex-row gap-8">
                    {/* Main Content */}
                    <div className="flex-1 space-y-8">
                        {/* Labels Content */}
                        {labels.length > 0 && (
                            <div>
                                <h3 className="text-xs font-bold text-gray-500 uppercase tracking-widest mb-2">Labels</h3>
                                <div className="flex flex-wrap gap-2">
                                    {labels.map((label, i) => (
                                        <div key={i} className={`${label.color} h-8 min-w-[40px] px-3 rounded flex items-center text-white text-xs font-bold`}>
                                            {label.text}
                                        </div>
                                    ))}
                                    <button
                                        onClick={() => setShowLabelPicker(!showLabelPicker)}
                                        className="bg-gray-200 hover:bg-gray-300 w-8 h-8 rounded flex items-center justify-center"
                                    >
                                        +
                                    </button>
                                </div>
                            </div>
                        )}

                        {/* Description */}
                        <div>
                            <div className="flex items-center gap-2 mb-2 text-gray-700">
                                <span>📝</span>
                                <h3 className="font-bold">Description</h3>
                            </div>
                            <textarea
                                className="w-full p-3 bg-white border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 min-h-[120px]"
                                placeholder="Add a more detailed description..."
                                value={description}
                                onChange={(e) => setDescription(e.target.value)}
                            />
                        </div>

                        {/* Checklist */}
                        <div>
                            <div className="flex items-center gap-2 mb-3 text-gray-700 text-lg">
                                <span>✔️</span>
                                <h3 className="font-bold">Checklist</h3>
                            </div>

                            <div className="space-y-2 mb-4">
                                {checklist.map((item, i) => (
                                    <div key={i} className="flex items-center gap-3 group">
                                        <input
                                            type="checkbox"
                                            className="w-4 h-4 rounded text-blue-600"
                                            checked={item.completed}
                                            onChange={() => toggleChecklistItem(i)}
                                        />
                                        <span className={`flex-1 ${item.completed ? 'line-through text-gray-400' : 'text-gray-700'}`}>
                                            {item.text}
                                        </span>
                                        <button
                                            onClick={() => removeChecklistItem(i)}
                                            className="opacity-0 group-hover:opacity-100 text-gray-400 hover:text-red-500"
                                        >
                                            ×
                                        </button>
                                    </div>
                                ))}
                            </div>

                            <form onSubmit={handleAddChecklistItem} className="ml-7">
                                <input
                                    type="text"
                                    placeholder="Add an item"
                                    className="w-full p-2 bg-gray-100 border border-transparent focus:bg-white focus:border-gray-300 rounded"
                                    value={newChecklistItem}
                                    onChange={(e) => setNewChecklistItem(e.target.value)}
                                />
                            </form>
                        </div>
                    </div>

                    {/* Sidebar Actions */}
                    <div className="w-full md:w-48 space-y-4">
                        <div>
                            <h4 className="text-xs font-bold text-gray-500 uppercase tracking-widest mb-2">Add to card</h4>
                            <div className="flex flex-col gap-2 relative">
                                <button
                                    onClick={() => setShowLabelPicker(!showLabelPicker)}
                                    className="bg-gray-200 hover:bg-gray-300 p-2 rounded text-sm font-medium flex items-center gap-2"
                                >
                                    <span>🏷️</span> Labels
                                </button>

                                {showLabelPicker && (
                                    <div className="absolute top-10 left-0 w-full bg-white shadow-xl border rounded p-2 z-10 grid grid-cols-1 gap-1">
                                        <h5 className="text-center text-xs font-bold mb-2">Labels</h5>
                                        {PRESET_COLORS.map(c => (
                                            <button
                                                key={c.color}
                                                onClick={() => handleAddLabel(c)}
                                                className={`${c.color} h-8 rounded hover:opacity-80 flex items-center justify-between px-2 text-white`}
                                            >
                                                <span className="text-xs font-bold">{c.name}</span>
                                                {labels.find(l => l.color === c.color) && <span>✓</span>}
                                            </button>
                                        ))}
                                    </div>
                                )}

                                <div className="space-y-1">
                                    <label className="text-[10px] font-bold text-gray-500 uppercase ml-1">Due Date</label>
                                    <input
                                        type="date"
                                        value={dueDate}
                                        onChange={(e) => setDueDate(e.target.value)}
                                        className="bg-gray-200 hover:bg-gray-300 p-2 rounded text-sm font-medium flex items-center gap-2 w-full outline-none focus:bg-white focus:ring-2 focus:ring-blue-500"
                                    />
                                </div>
                            </div>
                        </div>

                        <div>
                            <h4 className="text-xs font-bold text-gray-500 uppercase tracking-widest mb-2">Actions</h4>
                            <button
                                onClick={() => { onDelete(task._id); onClose(); }}
                                className="w-full bg-red-50 hover:bg-red-100 p-2 rounded text-red-600 text-sm font-medium flex items-center gap-2"
                            >
                                <span>🗑️</span> Delete card
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default TaskDetailModal;
