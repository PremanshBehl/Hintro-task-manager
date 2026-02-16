import { useState } from "react";

const ShareModal = ({ shareToken, onClose }) => {
    const [copied, setCopied] = useState(false);
    const shareUrl = `${window.location.origin}/join/${shareToken}`;

    const handleCopy = () => {
        navigator.clipboard.writeText(shareUrl);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    return (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 w-96 shadow-xl">
                <div className="flex justify-between items-center mb-4">
                    <h2 className="text-xl font-bold">Share Board</h2>
                    <button onClick={onClose} className="text-gray-500 hover:text-gray-700 text-2xl">×</button>
                </div>

                <p className="text-gray-600 mb-4">Anyone with this link can view and collaborate on this board.</p>

                <div className="flex gap-2">
                    <input
                        type="text"
                        readOnly
                        value={shareUrl}
                        className="flex-1 p-2 bg-gray-100 rounded border border-gray-300 text-sm overflow-hidden"
                    />
                    <button
                        onClick={handleCopy}
                        className={`px-4 py-2 rounded font-medium transition ${copied ? 'bg-green-500 text-white' : 'bg-blue-500 text-white hover:bg-blue-600'}`}
                    >
                        {copied ? 'Copied!' : 'Copy'}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default ShareModal;
