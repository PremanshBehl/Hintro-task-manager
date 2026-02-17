import React from "react";
import { Link, Navigate } from "react-router-dom";
import { motion } from "framer-motion";
import { useAuth } from "../../context/AuthContext";
import {
    Layout,
    Users,
    Zap,
    Shield,
    ArrowRight,
    CheckCircle,
    Activity,
    Github
} from "lucide-react";

const LandingPage = () => {
    const { user } = useAuth();

    // Redirect to dashboard if already logged in
    if (user) {
        return <Navigate to="/dashboard" />;
    }

    return (
        <div className="min-h-screen bg-[#f8fafc] text-slate-900 font-sans">
            {/* Top Navigation */}
            <nav className="fixed top-0 left-0 right-0 z-50 bg-white/70 backdrop-blur-xl border-b border-slate-200">
                <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <div className="w-8 h-8 premium-gradient rounded-lg flex items-center justify-center shadow-lg shadow-indigo-200 overflow-hidden">
                            <img src="/logo.png" alt="TaskFlow" className="w-full h-full object-cover" />
                        </div>
                        <span className="font-black text-xl tracking-tight bg-clip-text text-transparent premium-gradient">
                            TaskFlow
                        </span>
                    </div>

                    <div className="hidden md:flex items-center gap-8">
                        <a href="#features" className="text-sm font-bold text-slate-500 hover:text-indigo-600 transition-colors">Features</a>
                        <a href="#about" className="text-sm font-bold text-slate-500 hover:text-indigo-600 transition-colors">About</a>
                    </div>

                    <div className="flex items-center gap-4">
                        <Link to="/login" className="text-sm font-bold text-slate-500 hover:text-indigo-600 transition-colors">
                            Sign In
                        </Link>
                        <Link to="/register" className="premium-button premium-gradient text-white text-xs px-6 py-2.5">
                            Get Started
                        </Link>
                    </div>
                </div>
            </nav>

            {/* Hero Section */}
            <section className="pt-32 pb-20 px-6">
                <div className="max-w-7xl mx-auto text-center space-y-8">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.5 }}
                    >
                        <span className="inline-block px-4 py-1.5 rounded-full bg-indigo-50 text-indigo-600 text-[10px] font-black uppercase tracking-widest mb-6">
                            The Future of Collaboration
                        </span>
                        <h1 className="text-5xl md:text-7xl font-black tracking-tight text-slate-900 leading-[1.1]">
                            Manage Your Workflow <br />
                            <span className="text-transparent bg-clip-text premium-gradient">with Task Flow</span>
                        </h1>
                        <p className="mt-6 text-lg text-slate-500 max-w-2xl mx-auto font-medium leading-relaxed">
                            Every move, every task, every member — synchronized in high fidelity. Experience weightless collaboration for your next big project.
                        </p>
                    </motion.div>

                    <motion.div
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ delay: 0.2, duration: 0.5 }}
                        className="flex items-center justify-center gap-4"
                    >
                        <Link to="/register" className="premium-button premium-gradient text-white px-8 py-4 text-sm font-black shadow-xl shadow-indigo-100 hover:shadow-indigo-200 transition-all">
                            Start Building Now
                        </Link>
                    </motion.div>

                    {/* Abstract Hero Visual */}
                    <motion.div
                        initial={{ opacity: 0, y: 40 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.4, duration: 0.7 }}
                        className="relative mt-16 max-w-5xl mx-auto"
                    >
                        <div className="aspect-[16/9] rounded-[3rem] overflow-hidden shadow-2xl shadow-indigo-100 border border-white/40 bg-white/30 backdrop-blur-sm p-4">
                            <div className="w-full h-full rounded-[2rem] bg-slate-50 border border-slate-100 flex items-center justify-center relative overflow-hidden group">
                                <div className="absolute inset-0 premium-gradient opacity-10 group-hover:opacity-20 transition-opacity duration-700" />
                                <Layout size={120} className="text-indigo-200 group-hover:scale-110 transition-transform duration-700" />

                                {/* Floating elements mock */}
                                <div className="absolute top-10 left-10 p-4 glass-card bg-white/80 rounded-2xl flex items-center gap-3 animate-bounce">
                                    <CheckCircle size={20} className="text-green-500" />
                                    <div className="text-left"><span className="block text-xs font-black">Design Review</span><span className="text-[10px] text-slate-400">Completed</span></div>
                                </div>
                                <div className="absolute bottom-10 right-10 p-4 glass-card bg-white/80 rounded-2xl flex items-center gap-3">
                                    <Activity size={20} className="text-indigo-500" />
                                    <div className="text-left"><span className="block text-xs font-black">Live Pulse</span><span className="text-[10px] text-slate-400">Syncing...</span></div>
                                </div>
                            </div>
                        </div>

                        {/* Background Orbs */}
                        <div className="absolute -top-20 -left-20 w-64 h-64 bg-indigo-200/40 blur-[100px] rounded-full -z-10" />
                        <div className="absolute -bottom-20 -right-20 w-80 h-80 bg-purple-200/40 blur-[120px] rounded-full -z-10" />
                    </motion.div>
                </div>
            </section>

            {/* Features Section */}
            <section id="features" className="py-24 bg-white">
                <div className="max-w-7xl mx-auto px-6">
                    <div className="text-center mb-16">
                        <h2 className="text-sm font-black text-indigo-600 uppercase tracking-widest mb-4">Core Principles</h2>
                        <h3 className="text-4xl font-black text-slate-900">Everything you need to ship faster</h3>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                        <FeatureCard
                            icon={<Zap size={24} className="text-yellow-500" />}
                            title="Real-time Sync"
                            desc="Experience instantaneous updates. Collaborate with your team as if you were in the same room."
                        />
                        <FeatureCard
                            icon={<Users size={24} className="text-indigo-600" />}
                            title="Team Hub"
                            desc="Manage multiple boards and teams from a single dashboard. Keep everyone on the same page."
                        />
                        <FeatureCard
                            icon={<Shield size={24} className="text-purple-600" />}
                            title="Secure by Design"
                            desc="Enterprise-grade security. Your data is encrypted and protected with granular access controls."
                        />
                    </div>
                </div>
            </section>

            {/* About Section */}
            <section id="about" className="py-24 bg-slate-50 overflow-hidden relative">
                <div className="max-w-7xl mx-auto px-6">
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
                        <motion.div
                            initial={{ opacity: 0, x: -30 }}
                            whileInView={{ opacity: 1, x: 0 }}
                            viewport={{ once: true }}
                            className="space-y-8"
                        >
                            <div>
                                <h2 className="text-sm font-black text-indigo-600 uppercase tracking-widest mb-4">Our Philosophy</h2>
                                <h3 className="text-4xl md:text-5xl font-black text-slate-900 leading-tight">
                                    Designed for the way <br />
                                    modern teams work.
                                </h3>
                            </div>
                            <p className="text-lg text-slate-600 font-medium leading-relaxed">
                                Task Flow isn't just another project management tool. It's a high-fidelity workspace designed to eliminate friction and amplify productivity.
                            </p>
                            <div className="space-y-4">
                                {[
                                    "Frictionless User Experience",
                                    "Enterprise-Grade Reliability",
                                    "Human-Centric Collaboration"
                                ].map((item, i) => (
                                    <div key={i} className="flex items-center gap-3">
                                        <div className="w-6 h-6 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-600">
                                            <CheckCircle size={14} />
                                        </div>
                                        <span className="font-bold text-slate-700">{item}</span>
                                    </div>
                                ))}
                            </div>
                        </motion.div>

                        <motion.div
                            initial={{ opacity: 0, scale: 0.9 }}
                            whileInView={{ opacity: 1, scale: 1 }}
                            viewport={{ once: true }}
                            className="relative"
                        >
                            <div className="aspect-square bg-white rounded-[3rem] shadow-2xl p-8 flex flex-col justify-center gap-8 relative z-10">
                                <div className="space-y-2">
                                    <div className="h-4 w-1/3 bg-slate-100 rounded-full animate-pulse" />
                                    <div className="h-8 w-2/3 bg-slate-50 rounded-lg" />
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="h-32 bg-indigo-50 rounded-2xl border border-indigo-100 p-4">
                                        <Users className="text-indigo-600 mb-2" size={24} />
                                        <span className="block text-xs font-black text-indigo-900">12 Active Team Members</span>
                                    </div>
                                    <div className="h-32 bg-purple-50 rounded-2xl border border-purple-100 p-4">
                                        <Zap className="text-purple-600 mb-2" size={24} />
                                        <span className="block text-xs font-black text-purple-900">Instant Syncing Enabled</span>
                                    </div>
                                </div>
                                <div className="h-4 w-full bg-slate-50 rounded-full" />
                            </div>

                            {/* Decorative elements */}
                            <div className="absolute -top-10 -right-10 w-40 h-40 premium-gradient rounded-full blur-[80px] opacity-20" />
                            <div className="absolute -bottom-10 -left-10 w-40 h-40 bg-purple-400 rounded-full blur-[80px] opacity-20" />
                        </motion.div>
                    </div>
                </div>
            </section>

            {/* Footer */}
            <footer className="py-12 border-t border-slate-100 bg-white">
                <div className="max-w-7xl mx-auto px-6 flex flex-col md:flex-row justify-between items-center gap-8">
                    <div className="flex items-center gap-2">
                        <div className="w-6 h-6 premium-gradient rounded-md flex items-center justify-center overflow-hidden">
                            <img src="/logo.png" alt="Branding" className="w-full h-full object-cover" />
                        </div>
                        <span className="font-black text-lg tracking-tight">TaskFlow</span>
                    </div>

                    <p className="text-slate-400 text-sm font-medium">© 2026 Task Flow. Designed for high fidelity.</p>

                    <div className="flex items-center gap-6">
                        <a href="#" className="text-slate-400 hover:text-indigo-600 transition-colors"><Github size={20} /></a>
                    </div>
                </div>
            </footer>
        </div>
    );
};

const FeatureCard = ({ icon, title, desc }) => (
    <div className="p-8 rounded-[2.5rem] bg-[#f8fafc] border border-slate-100 hover:border-indigo-200 hover:shadow-xl hover:shadow-indigo-100/40 transition-all group">
        <div className="w-14 h-14 rounded-2xl bg-white shadow-md flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
            {icon}
        </div>
        <h4 className="text-xl font-black text-slate-900 mb-4">{title}</h4>
        <p className="text-slate-500 font-medium leading-relaxed text-sm">
            {desc}
        </p>
    </div>
);

export default LandingPage;
