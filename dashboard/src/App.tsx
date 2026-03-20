import { useState, useEffect } from 'react';
import { 
  BarChart3, 
  Users, 
  Send, 
  Sparkles, 
  Plus, 
  MessageSquare, 
  CheckCircle2, 
  Clock, 
  AlertCircle,
  LayoutDashboard,
  Settings,
  MoreVertical,
  Search,
  Bell,
  ArrowUpRight,
  Database,
  Cpu,
  Globe,
  Share2
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

// Types
interface LeadStats {
    total: number;
    pending: number;
    personalized: number;
    sent: number;
    replied: number;
    failed: number;
}

interface OutreachLead {
    id: string;
    name: string;
    company_name: string;
    phone_number: string;
    status: string;
    created_at: string;
    last_action_at?: string;
    business_details?: string;
}

interface Conversation {
    id: string;
    sender: 'user' | 'ai';
    message: string;
    created_at: string;
    leads?: {
        name: string;
        phone_number: string;
    }
}

interface SystemConfig {
    whatsapp_provider: string;
    ai_model: string;
    connected: boolean;
    last_sync: string;
    region: string;
}

export default function App() {
    const [stats, setStats] = useState<LeadStats>({ total: 0, pending: 0, personalized: 0, sent: 0, replied: 0, failed: 0 });
    const [pool, setPool] = useState<OutreachLead[]>([]);
    const [history, setHistory] = useState<Conversation[]>([]);
    const [config, setConfig] = useState<SystemConfig | null>(null);
    
    const [activeTab, setActiveTab] = useState('Campaign Center');
    const [isAdding, setIsAdding] = useState(false);
    const [loading, setLoading] = useState(false);
    const [newLead, setNewLead] = useState({ name: '', company_name: '', phone_number: '', business_details: '' });
    const [toast, setToast] = useState<{ msg: string, type: 'success' | 'error' } | null>(null);

    // Initial Fetch
    useEffect(() => {
        fetchAllData();
    }, []);

    const fetchAllData = async () => {
        await Promise.all([
            fetchStats(),
            fetchPool(),
            fetchHistory(),
            fetchConfig()
        ]);
    };

    const fetchStats = async () => {
        try {
            const res = await fetch('/api/outreach/stats');
            const data = await res.json();
            setStats(data);
        } catch (e) { console.error('Stats Error', e); }
    };

    const fetchPool = async () => {
        try {
            const res = await fetch('/api/outreach/pool');
            const data = await res.json();
            setPool(data || []);
        } catch (e) { console.error('Pool Error', e); }
    };

    const fetchHistory = async () => {
        try {
            const res = await fetch('/api/outreach/history');
            const data = await res.json();
            setHistory(data || []);
        } catch (e) { console.error('History Error', e); }
    };

    const fetchConfig = async () => {
        try {
            const res = await fetch('/api/outreach/config');
            const data = await res.json();
            setConfig(data);
        } catch (e) { console.error('Config Error', e); }
    };

    const notify = (msg: string, type: 'success' | 'error' = 'success') => {
        setToast({ msg, type });
        setTimeout(() => setToast(null), 4000);
    };

    const handleAddLead = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            const res = await fetch('/api/outreach/leads', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(newLead)
            });
            if (res.ok) {
                notify('New lead added to campaign!');
                setIsAdding(false);
                setNewLead({ name: '', company_name: '', phone_number: '', business_details: '' });
                fetchAllData();
            }
        } catch (e) { notify('Failed to add lead', 'error'); }
    };

    const runPersonalization = async () => {
        setLoading(true);
        try {
            const res = await fetch('/api/outreach/campaign/personalize', { method: 'POST' });
            const data = await res.json();
            notify(`Successfully personalized ${data.count} leads with Gemini AI.`);
            fetchAllData();
        } finally { setLoading(false); }
    };

    const launchCampaign = async () => {
        setLoading(true);
        try {
            const res = await fetch('/api/outreach/campaign/launch', { method: 'POST' });
            const data = await res.json();
            notify(`Outreach Campaign Launched! Sent ${data.sentCount} messages.`);
            fetchAllData();
        } finally { setLoading(false); }
    };

    return (
        <div className="flex min-h-screen text-slate-900 bg-[#f8fafc]">
            {/* Sidebar */}
            <aside className="w-72 border-r border-slate-200 bg-white p-6 hidden lg:flex flex-col shadow-sm">
                <div className="flex items-center space-x-3 mb-12">
                    <div className="w-10 h-10 bg-indigo-600 rounded-xl flex items-center justify-center shadow-lg shadow-indigo-500/20">
                        <Sparkles className="text-white w-6 h-6 fill-white/20" />
                    </div>
                    <span className="text-xl font-bold tracking-tight text-slate-900">Outreach<span className="text-indigo-600">PRO</span></span>
                </div>

                <nav className="flex-1 space-y-1">
                    <SidebarItem icon={<LayoutDashboard size={20} />} label="Campaign Center" active={activeTab === 'Campaign Center'} onClick={() => setActiveTab('Campaign Center')} />
                    <SidebarItem icon={<Users size={20} />} label="Lead CRM" active={activeTab === 'Lead CRM'} onClick={() => setActiveTab('Lead CRM')} />
                    <SidebarItem icon={<MessageSquare size={20} />} label="Bot Conversations" active={activeTab === 'Bot Conversations'} onClick={() => setActiveTab('Bot Conversations')} />
                </nav>

                <div className="mt-auto space-y-1">
                    <SidebarItem icon={<Settings size={20} />} label="Config" active={activeTab === 'Config'} onClick={() => setActiveTab('Config')} />
                </div>
            </aside>

            {/* Main Content */}
            <main className="flex-1 overflow-x-hidden relative">
                <header className="h-[72px] border-b border-slate-200 bg-white/80 backdrop-blur-xl px-10 flex items-center justify-between sticky top-0 z-30">
                    <div className="relative w-96">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4" />
                        <input type="text" placeholder="Find a lead or business..." className="w-full bg-slate-100 border border-slate-200 rounded-full py-2.5 pl-11 pr-4 focus:outline-none focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/5 transition-all text-sm" />
                    </div>
                    <div className="flex items-center space-x-5">
                        <button className="relative w-10 h-10 glass rounded-full flex items-center justify-center hover:bg-slate-50 transition-colors">
                            <Bell size={18} className="text-slate-500" />
                            <span className="absolute top-2 right-2 w-2 h-2 bg-indigo-600 rounded-full border-2 border-white"></span>
                        </button>
                        <div className="w-10 h-10 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-full border border-white/20 flex items-center justify-center font-bold text-sm text-white">S</div>
                    </div>
                </header>

                <div className="p-10 max-w-7xl mx-auto">
                    <AnimatePresence mode="wait">
                        {activeTab === 'Campaign Center' && (
                            <motion.div key="campaign" initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 20 }}>
                                <div className="flex flex-col md:flex-row md:items-end justify-between mb-12">
                                    <div>
                                        <h2 className="text-4xl font-extrabold tracking-tight mb-2 text-slate-900">Campaign Performance</h2>
                                        <p className="text-slate-500 font-medium">Tracking AI engagement across your outreach pool.</p>
                                    </div>
                                    <button onClick={() => setIsAdding(true)} className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-3.5 px-8 rounded-2xl flex items-center transition-all shadow-xl shadow-indigo-200">
                                        <Plus size={20} className="mr-2.5" /> Prospect New Lead
                                    </button>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
                                    <StatCard icon={<Users className="text-blue-600" />} color="blue" label="Total Leads" val={stats.total} />
                                    <StatCard icon={<Send className="text-indigo-600" />} color="indigo" label="Campaigns Sent" val={stats.sent} />
                                    <StatCard icon={<MessageSquare className="text-emerald-600" />} color="emerald" label="Client Replies" val={stats.replied} />
                                    <StatCard icon={<AlertCircle className="text-rose-600" />} color="rose" label="Bounces / Failed" val={stats.failed} />
                                </div>

                                <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
                                    <div className="xl:col-span-1 space-y-6">
                                        <div className="glass p-8 rounded-[32px] bg-white/70 shadow-sm relative overflow-hidden group">
                                            <h3 className="text-2xl font-bold mb-6 flex items-center text-slate-900"><Sparkles className="mr-3 text-indigo-600" size={24} /> AI Controller</h3>
                                            <div className="space-y-4">
                                                <div className="p-5 bg-slate-50 border border-slate-100 rounded-2xl">
                                                    <div className="flex items-center justify-between mb-2">
                                                        <span className="text-sm font-semibold text-slate-400 uppercase tracking-tighter">Queue Status</span>
                                                        <span className="px-2 py-0.5 bg-yellow-100 text-yellow-700 rounded text-[10px] font-bold">READY</span>
                                                    </div>
                                                    <div className="text-2xl font-bold text-slate-900">{stats.pending} Pending Leads</div>
                                                </div>
                                                <button disabled={loading || stats.pending === 0} onClick={runPersonalization} className="w-full py-4 glass hover:bg-slate-50 border border-slate-200 rounded-2xl font-bold flex items-center justify-center transition-all disabled:opacity-30 text-slate-700">
                                                    <Sparkles size={18} className="mr-2.5 text-indigo-600" /> {loading ? 'Processing AI...' : 'Personalize Queue'}
                                                </button>
                                                <button disabled={loading || stats.personalized === 0} onClick={launchCampaign} className="w-full py-4 bg-gradient-to-r from-emerald-500 to-teal-600 hover:opacity-90 text-white rounded-2xl font-black shadow-lg shadow-emerald-200 transition-all disabled:opacity-30">
                                                    <Send size={18} className="mr-2.5" /> Launch {stats.personalized} Messages
                                                </button>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="xl:col-span-2">
                                        <div className="glass rounded-[32px] bg-white/70 shadow-sm overflow-hidden">
                                            <div className="p-8 border-b border-slate-100 flex items-center justify-between">
                                                <h3 className="text-xl font-bold text-slate-900">Recent Activity</h3>
                                                <button onClick={() => setActiveTab('Lead CRM')} className="text-sm font-semibold text-slate-400 hover:text-slate-600 transition-colors flex items-center">View Pool <ArrowUpRight size={14} className="ml-1.5" /></button>
                                            </div>
                                            <div className="overflow-x-auto">
                                                <table className="w-full">
                                                    <thead className="bg-slate-50 text-xs font-bold text-slate-400 uppercase tracking-widest text-left">
                                                        <tr><th className="px-8 py-5">Prospect</th><th className="px-8 py-5">Status</th><th className="px-8 py-5">Added</th></tr>
                                                    </thead>
                                                    <tbody className="divide-y divide-slate-100">
                                                        {pool.slice(0, 5).map(lead => (
                                                            <LeadRow key={lead.id} name={lead.name} company={lead.company_name} time={new Date(lead.created_at).toLocaleDateString()} status={lead.status} />
                                                        ))}
                                                        {pool.length === 0 && <tr><td colSpan={3} className="px-8 py-10 text-center text-slate-400 italic">No leads in the pool yet.</td></tr>}
                                                    </tbody>
                                                </table>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </motion.div>
                        )}

                        {activeTab === 'Lead CRM' && (
                            <motion.div key="crm" initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 20 }}>
                                <div className="mb-10">
                                    <h2 className="text-4xl font-extrabold tracking-tight mb-2 text-slate-900">Lead Database</h2>
                                    <p className="text-slate-500 font-medium">Manage your entire outreach target pool.</p>
                                </div>
                                <div className="glass bg-white/70 rounded-[32px] overflow-hidden shadow-sm">
                                    <table className="w-full">
                                        <thead className="bg-slate-50 text-xs font-bold text-slate-400 uppercase tracking-widest text-left">
                                            <tr><th className="px-8 py-5">Name</th><th className="px-8 py-5">Company</th><th className="px-8 py-5">Phone</th><th className="px-8 py-5">Status</th><th className="px-8 py-5">Created</th></tr>
                                        </thead>
                                        <tbody className="divide-y divide-slate-100">
                                            {pool.map(lead => (
                                                <tr key={lead.id} className="hover:bg-slate-50/50 transition-colors">
                                                    <td className="px-8 py-5 font-bold text-sm text-slate-900">{lead.name}</td>
                                                    <td className="px-8 py-5 text-sm text-slate-500 text-slate-500 font-semibold">{lead.company_name}</td>
                                                    <td className="px-8 py-5 text-sm text-slate-500">{lead.phone_number}</td>
                                                    <td className="px-8 py-5"><StatusBadge status={lead.status} /></td>
                                                    <td className="px-8 py-5 text-[11px] font-bold text-slate-400 uppercase">{new Date(lead.created_at).toLocaleDateString()}</td>
                                                </tr>
                                            ))}
                                            {pool.length === 0 && <tr><td colSpan={5} className="px-8 py-20 text-center text-slate-400">No data available.</td></tr>}
                                        </tbody>
                                    </table>
                                </div>
                            </motion.div>
                        )}

                        {activeTab === 'Bot Conversations' && (
                            <motion.div key="chat" initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 20 }} className="space-y-8">
                                <div className="mb-10">
                                    <h2 className="text-4xl font-extrabold tracking-tight mb-2 text-slate-900">Bot Intelligence</h2>
                                    <p className="text-slate-500 font-medium">Real-time chat history between AI and Leads.</p>
                                </div>
                                <div className="grid grid-cols-1 gap-4">
                                    {history.map(chat => (
                                        <div key={chat.id} className="glass p-6 bg-white/70 rounded-3xl shadow-sm flex items-start space-x-4">
                                            <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 ${chat.sender === 'ai' ? 'bg-indigo-100 text-indigo-600' : 'bg-emerald-100 text-emerald-600'}`}>
                                                {chat.sender === 'ai' ? <Sparkles size={20} /> : <Users size={20} />}
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <div className="flex items-center justify-between mb-1">
                                                    <h4 className="font-bold text-slate-900 truncate">
                                                        {chat.leads?.name || 'Anonymous Lead'} 
                                                        <span className="ml-2 text-[10px] font-bold text-slate-400 uppercase bg-slate-100 px-2 py-0.5 rounded tracking-tighter">{chat.sender === 'ai' ? 'AI REPLY' : 'USER MESSAGE'}</span>
                                                    </h4>
                                                    <span className="text-[10px] font-bold text-slate-400 uppercase">{new Date(chat.created_at).toLocaleTimeString()}</span>
                                                </div>
                                                <p className="text-sm text-slate-600 leading-relaxed">{chat.message}</p>
                                            </div>
                                        </div>
                                    ))}
                                    {history.length === 0 && <div className="text-center py-20 text-slate-400 italic">Silence... No one has chatted yet.</div>}
                                </div>
                            </motion.div>
                        )}

                        {activeTab === 'Config' && (
                            <motion.div key="config" initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 20 }}>
                                <div className="mb-10">
                                    <h2 className="text-4xl font-extrabold tracking-tight mb-2 text-slate-900">System Core</h2>
                                    <p className="text-slate-500 font-medium">Infrastructure and AI engine configuration.</p>
                                </div>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                    <ConfigCard icon={<Share2 className="text-indigo-600" />} label="Messaging Engine" val={config?.whatsapp_provider || 'Not Connected'} helper="Twilio API for WhatsApp" />
                                    <ConfigCard icon={<Cpu className="text-purple-600" />} label="AI Generation" val={config?.ai_model || 'Standard Engine'} helper="LLM Orchestration Layer" />
                                    <ConfigCard icon={<Globe className="text-emerald-600" />} label="Deployment Region" val={config?.region || 'Global Cluster'} helper="Low-latency execution zone" />
                                    <ConfigCard icon={<Database className="text-amber-600" />} label="Sync Status" val={config?.connected ? 'LIVE' : 'SYNCING...'} helper={`Last sync: ${config ? new Date(config.last_sync).toLocaleString() : 'Never'}`} />
                                </div>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>

                <AnimatePresence>
                    {isAdding && (
                        <>
                            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setIsAdding(false)} className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-50 px-10" />
                            <motion.div initial={{ opacity: 0, scale: 0.95, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95, y: 20 }} className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-xl bg-white p-10 rounded-[40px] z-[60] shadow-2xl">
                                <h3 className="text-3xl font-black mb-10 tracking-tight text-slate-900">Manual Prospecting</h3>
                                <form onSubmit={handleAddLead} className="space-y-6">
                                    <div className="grid grid-cols-2 gap-6">
                                        <div className="space-y-2">
                                            <label className="text-xs font-bold text-slate-400 uppercase tracking-widest pl-1">Full Name</label>
                                            <input required onChange={e => setNewLead({...newLead, name: e.target.value})} className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-5 py-4 focus:outline-none focus:border-indigo-500 transition-all text-sm" placeholder="John Doe" />
                                        </div>
                                        <div className="space-y-2">
                                            <label className="text-xs font-bold text-slate-400 uppercase tracking-widest pl-1">Business Name</label>
                                            <input required onChange={e => setNewLead({...newLead, company_name: e.target.value})} className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-5 py-4 focus:outline-none focus:border-indigo-500 transition-all text-sm" placeholder="TechCorp Inc." />
                                        </div>
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-xs font-bold text-slate-400 uppercase tracking-widest pl-1">WhatsApp Number</label>
                                        <input required onChange={e => setNewLead({...newLead, phone_number: e.target.value})} className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-5 py-4 focus:outline-none focus:border-indigo-500 transition-all text-sm" placeholder="+14155552671" />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-xs font-bold text-slate-400 uppercase tracking-widest pl-1">Pitch Context (Optional)</label>
                                        <textarea rows={3} onChange={e => setNewLead({...newLead, business_details: e.target.value})} className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-5 py-4 focus:outline-none focus:border-indigo-500 transition-all text-sm" placeholder="e.g. Needs a new website..." />
                                    </div>
                                    <div className="pt-4 flex space-x-4">
                                        <button type="submit" className="flex-1 bg-indigo-600 hover:bg-indigo-700 text-white font-black py-4 rounded-2xl shadow-xl shadow-indigo-200 transition-all">Save Prospect</button>
                                        <button type="button" onClick={() => setIsAdding(false)} className="flex-1 bg-slate-100 text-slate-500 font-bold py-4 rounded-2xl hover:bg-slate-200 transition-all">Cancel</button>
                                    </div>
                                </form>
                            </motion.div>
                        </>
                    )}
                </AnimatePresence>

                <AnimatePresence>
                    {toast && (
                        <motion.div initial={{ x: 100, opacity: 0 }} animate={{ x: 0, opacity: 1 }} exit={{ x: 100, opacity: 0 }} className="fixed bottom-10 right-10 z-[100] p-6 bg-white border border-slate-200 rounded-2xl shadow-2xl flex items-center min-w-[320px]">
                            <div className={`w-10 h-10 ${toast.type === 'success' ? 'bg-emerald-500' : 'bg-rose-500'} rounded-lg flex items-center justify-center mr-4`}>
                                {toast.type === 'success' ? <CheckCircle2 className="text-white" /> : <AlertCircle className="text-white" />}
                            </div>
                            <div>
                                <h4 className="font-bold text-sm text-slate-900">{toast.type === 'success' ? 'Success' : 'Attention'}</h4>
                                <p className="text-xs text-slate-500">{toast.msg}</p>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </main>
        </div>
    );
}

function SidebarItem({ icon, label, active = false, onClick }: { icon: any, label: string, active?: boolean, onClick: () => void }) {
    return (
        <button onClick={onClick} className={`w-full flex items-center space-x-3.5 px-6 py-4 rounded-2xl font-bold text-sm transition-all ${active ? 'bg-indigo-50 text-indigo-600 border border-indigo-100' : 'text-slate-400 hover:text-slate-600 hover:bg-slate-50 border border-transparent'}`}>
            {icon} <span>{label}</span>
        </button>
    );
}

function StatCard({ icon, label, val, color }: { icon: any, label: string, val: number, color: string }) {
    const colorStyles: Record<string, string> = { blue: 'bg-blue-50', indigo: 'bg-indigo-50', emerald: 'bg-emerald-50', rose: 'bg-rose-50' };
    return (
        <div className="glass p-8 rounded-[32px] hover:bg-white transition-all cursor-default shadow-sm bg-white/70">
            <div className={`w-12 h-12 ${colorStyles[color] || 'bg-slate-50'} rounded-2xl flex items-center justify-center mb-6`}>{icon}</div>
            <div className="text-slate-400 font-bold text-sm mb-1">{label}</div>
            <div className="text-3xl font-black text-slate-900">{val}</div>
        </div>
    );
}

function ConfigCard({ icon, label, val, helper }: { icon: any, label: string, val: string, helper: string }) {
    return (
        <div className="glass p-8 rounded-[32px] bg-white/70 shadow-sm border border-slate-100">
            <div className="w-12 h-12 bg-slate-50 rounded-2xl flex items-center justify-center mb-6">{icon}</div>
            <div className="text-slate-400 font-bold text-xs uppercase tracking-widest mb-1">{label}</div>
            <div className="text-xl font-bold text-slate-900 mb-2">{val}</div>
            <p className="text-xs text-slate-400 font-semibold">{helper}</p>
        </div>
    );
}

function StatusBadge({ status }: { status: string }) {
    const statusMap: any = {
        'pending': { label: 'In Queue', class: 'bg-slate-100 text-slate-500' },
        'personalized': { label: 'AI Ready', class: 'bg-indigo-100 text-indigo-600' },
        'sent': { label: 'Outreach Sent', class: 'bg-blue-100 text-blue-600' },
        'replied': { label: 'Client Replied', class: 'bg-emerald-100 text-emerald-600' },
        'failed': { label: 'Bounced', class: 'bg-rose-100 text-rose-600' }
    };
    const s = statusMap[status] || { label: status, class: 'bg-slate-50 text-slate-400' };
    return <span className={`px-3 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-widest ${s.class}`}>{s.label}</span>;
}

function LeadRow({ name, company, time, status }: { name: string, company: string, time: string, status: string }) {
    return (
        <tr className="hover:bg-slate-50/50 transition-colors">
            <td className="px-8 py-5">
                <div className="flex items-center space-x-3">
                    <div className="w-9 h-9 bg-slate-100 flex items-center justify-center font-bold text-xs text-indigo-600 rounded-full">{name[0]}</div>
                    <span className="font-bold text-sm text-slate-900">{name}</span>
                </div>
            </td>
            <td className="px-8 py-5"><StatusBadge status={status} /></td>
            <td className="px-8 py-5 text-[11px] font-bold text-slate-400 uppercase">{time}</td>
        </tr>
    );
}
