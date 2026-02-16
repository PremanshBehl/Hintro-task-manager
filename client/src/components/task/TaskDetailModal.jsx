import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
    X,
    Tag,
    AlignLeft,
    CheckSquare,
    Clock,
    Trash2,
    Type,
    ChevronRight,
    Plus
} from "lucide-react";

const PRESET_COLORS = [
    { name: "Emerald", color: "#10b981" },
    { name: "Amber", color: "#f59e0b" },
    { name: "Rose", color: "#f43f5e" },
    { name: "Indigo", color: "#6366f1" },
    { name: "Violet", color: "#8b5cf6" },
    { name: "Sky", color: "#0ea5e9" },
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
            const currentDueDate = task.dueDate ? new Date(task.dueDate).toISOString().split('T')[0] : "";
            if (
                title !== task.title ||
                description !== task.description ||
                JSON.stringify(labels) !== JSON.stringify(task.labels) ||
                JSON.stringify(checklist) !== JSON.stringify(task.checklist) ||
                dueDate !== currentDueDate
            ) {
                onUpdate({ title, description, labels, checklist, dueDate });
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
        <div className="fixed inset-0 z-[110] flex items-center justify-center p-4">
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={onClose}
                className="absolute inset-0 bg-slate-900/60 backdrop-blur-md"
            />

            <motion.div
                initial={{ scale: 0.95, opacity: 0, y: 20 }}
                animate={{ scale: 1, opacity: 1, y: 0 }}
                exit={{ scale: 0.95, opacity: 0, y: 20 }}
                className="relative bg-white rounded-[2.5rem] shadow-2xl w-full max-w-3xl overflow-hidden border border-white/20 flex flex-col max-h-[90vh]"
                onClick={e => e.stopPropagation()}
            >
                {/* Header Section */}
                <div className="p-8 border-b border-slate-100 flex items-start shrink-0">
                    <div className="flex-grow flex gap-4 pr-12">
                        <div className="w-12 h-12 rounded-2xl premium-gradient flex items-center justify-center text-white shrink-0 shadow-lg shadow-indigo-100">
                            <Type size={20} />
                        </div>
                        <div className="flex-grow">
                            <input
                                type="text"
                                className="text-2xl font-black text-slate-800 bg-transparent border-none focus:ring-0 p-0 w-full tracking-tight"
                                value={title}
                                onChange={(e) => setTitle(e.target.value)}
                            />
                            <div className="flex items-center gap-2 mt-2">
                                <p className="text-xs font-bold text-slate-400 uppercase tracking-widest flex items-center gap-1">
                                    Active in <ChevronRight size={10} /> <span className="text-indigo-500">Workspace</span>
                                </p>
                            </div>
                        </div>
                    </div>
                    <button
                        onClick={onClose}
                        className="p-3 text-slate-300 hover:text-slate-500 hover:bg-slate-50 rounded-2xl transition-all"
                    >
                        <X size={24} />
                    </button>
                </div>

                <div className="flex-grow overflow-y-auto p-8 custom-scrollbar">
                    <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
                        {/* Main Column */}
                        <div className="lg:col-span-8 space-y-10">
                            {/* Properties Quick View */}
                            <div className="flex flex-wrap gap-8">
                                {labels.length > 0 && (
                                    <div className="space-y-3">
                                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
                                            <Tag size={12} /> Labels
                                        </p>
                                        <div className="flex flex-wrap gap-1.5">
                                            {labels.map((label, i) => (
                                                <div key={i} className="h-2 w-8 rounded-full" style={{ backgroundColor: label.color }} />
                                            ))}
                                            <button onClick={() => setShowLabelPicker(true)} className="h-2 w-4 rounded-full bg-slate-100 hover:bg-slate-200" />
                                        </div>
                                    </div>
                                )}

                                {dueDate && (
                                    <div className="space-y-3">
                                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
                                            <Clock size={12} /> Deadline
                                        </p>
                                        <div className="px-3 py-1 bg-indigo-50 border border-indigo-100 rounded-lg text-indigo-600 text-xs font-bold">
                                            {new Date(dueDate).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}
                                        </div>
                                    </div>
                                )}
                            </div>

                            {/* Description */}
                            <div className="space-y-4">
                                <div className="flex items-center gap-3">
                                    <AlignLeft size={18} className="text-indigo-500" />
                                    <h3 className="font-black text-slate-800 tracking-tight">Activity Info</h3>
                                </div>
                                <div className="bg-slate-50 rounded-3xl p-1 border border-slate-100 focus-within:ring-4 focus-within:ring-indigo-50 transition-all">
                                    <textarea
                                        className="w-full p-5 bg-transparent border-none focus:ring-0 text-slate-600 font-medium leading-relaxed min-h-[160px] resize-none"
                                        placeholder="Provide additional details for this activity..."
                                        value={description}
                                        onChange={(e) => setDescription(e.target.value)}
                                    />
                                </div>
                            </div>

                            {/* Checklist */}
                            <div className="space-y-4">
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-3">
                                        <CheckSquare size={18} className="text-indigo-500" />
                                        <h3 className="font-black text-slate-800 tracking-tight">Milestones</h3>
                                    </div>
                                    <span className="text-[10px] font-black text-slate-400 bg-slate-50 px-2 py-1 rounded-lg uppercase tracking-widest">
                                        {checklist.filter(i => i.completed).length} / {checklist.length} Completed
                                    </span>
                                </div>

                                <div className="space-y-3">
                                    {checklist.map((item, i) => (
                                        <motion.div
                                            layout
                                            key={i}
                                            className="flex items-center gap-4 group bg-white border border-slate-100 p-4 rounded-2xl hover:border-indigo-100 hover:shadow-sm transition-all"
                                        >
                                            <button
                                                onClick={() => toggleChecklistItem(i)}
                                                className={`w-6 h-6 rounded-lg border-2 flex items-center justify-center transition-all ${item.completed
                                                    ? "bg-indigo-600 border-indigo-600 text-white"
                                                    : "border-slate-200 hover:border-indigo-400"
                                                    }`}
                                            >
                                                {item.completed && <CheckSquare size={14} />}
                                            </button>
                                            <span className={`flex-1 font-bold text-sm ${item.completed ? 'text-slate-300 line-through font-medium' : 'text-slate-600'}`}>
                                                {item.text}
                                            </span>
                                            <button
                                                onClick={() => removeChecklistItem(i)}
                                                className="opacity-0 group-hover:opacity-100 p-2 text-slate-300 hover:text-red-500 hover:bg-red-50 rounded-xl transition-all"
                                            >
                                                <Trash2 size={16} />
                                            </button>
                                        </motion.div>
                                    ))}

                                    <form onSubmit={handleAddChecklistItem} className="relative mt-4">
                                        <Plus size={16} className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-300" />
                                        <input
                                            type="text"
                                            placeholder="Define a new milestone..."
                                            className="w-full pl-12 pr-5 py-4 bg-slate-50 border border-transparent border-dashed hover:border-indigo-200 focus:bg-white focus:border-indigo-400 focus:ring-4 focus:ring-indigo-50 rounded-2xl text-sm font-bold transition-all outline-none"
                                            value={newChecklistItem}
                                            onChange={(e) => setNewChecklistItem(e.target.value)}
                                        />
                                    </form>
                                </div>
                            </div>
                        </div>

                        {/* Sidebar Actions */}
                        <div className="lg:col-span-4 space-y-8">
                            <div className="space-y-4">
                                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Add Properties</p>
                                <div className="grid grid-cols-1 gap-3">
                                    <div className="relative">
                                        <button
                                            onClick={() => setShowLabelPicker(!showLabelPicker)}
                                            className="w-full flex items-center gap-3 px-4 py-3 rounded-2xl bg-slate-50 hover:bg-slate-100 border border-slate-100 font-bold text-sm text-slate-700 transition-all"
                                        >
                                            <Tag size={18} className="text-indigo-500" />
                                            Add Labels
                                        </button>

                                        <AnimatePresence>
                                            {showLabelPicker && (
                                                <motion.div
                                                    initial={{ opacity: 0, scale: 0.95, y: 10 }}
                                                    animate={{ opacity: 1, scale: 1, y: 0 }}
                                                    exit={{ opacity: 0, scale: 0.95, y: 10 }}
                                                    className="absolute top-14 left-0 w-full bg-white shadow-2xl border border-slate-100 rounded-3xl p-3 z-20 grid grid-cols-2 gap-2"
                                                >
                                                    {PRESET_COLORS.map(c => (
                                                        <button
                                                            key={c.color}
                                                            onClick={() => handleAddLabel(c)}
                                                            className="group relative flex items-center justify-center p-3 rounded-xl hover:bg-slate-50 transition-all"
                                                        >
                                                            <div className="w-8 h-8 rounded-full shadow-sm" style={{ backgroundColor: c.color }} />
                                                            {labels.find(l => l.color === c.color) && (
                                                                <div className="absolute inset-0 flex items-center justify-center text-white drop-shadow">
                                                                    <ChevronRight size={14} className="rotate-90" />
                                                                </div>
                                                            )}
                                                        </button>
                                                    ))}
                                                </motion.div>
                                            )}
                                        </AnimatePresence>
                                    </div>

                                    <div className="space-y-2">
                                        <div className="relative">
                                            <Clock size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-indigo-500" />
                                            <input
                                                type="date"
                                                value={dueDate}
                                                onChange={(e) => setDueDate(e.target.value)}
                                                className="w-full pl-12 pr-4 py-3 bg-slate-50 hover:bg-slate-100 border border-slate-100 rounded-2xl font-bold text-sm text-slate-700 outline-none focus:bg-white focus:ring-4 focus:ring-indigo-50 transition-all"
                                            />
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div className="pt-8 border-t border-slate-100">
                                <button
                                    onClick={() => { onDelete(task._id); onClose(); }}
                                    className="w-full flex items-center justify-center gap-3 px-4 py-4 rounded-2xl text-red-100 bg-red-600 hover:bg-red-700 font-black text-sm transition-all shadow-lg shadow-red-100"
                                >
                                    <Trash2 size={18} />
                                    Terminate Activity
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </motion.div>
        </div>
    );
};

export default TaskDetailModal;
