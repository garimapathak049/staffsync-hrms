import { Link } from 'react-router-dom';
import { 
  Users, 
  CalendarCheck, 
  FileText, 
  GraduationCap, 
  ShieldCheck, 
  BarChart3, 
  ArrowRight, 
  Sparkles, 
  Zap, 
  Star, 
  ChevronRight
} from 'lucide-react';
import { Logo } from '../components/ui';

const FEATURES = [
  {
    icon: Users,
    tag: 'TALENT GRID',
    title: 'Precision Workforce Directory',
    desc: 'Unified central intelligence for global teams, hierarchy mapping, and dynamic reporting chains.',
    highlight: 'Instant Lookup'
  },
  {
    icon: CalendarCheck,
    tag: 'REAL-TIME TRACKING',
    title: 'Atomic Attendance Engine',
    desc: 'Server-synchronized biometric-grade clocking with automatic shift detection and overtime calculation.',
    highlight: 'Zero Latency'
  },
  {
    icon: FileText,
    tag: 'WORKFLOW AUTOMATION',
    title: 'Frictionless Leave System',
    desc: 'Automated multi-tier approval chains, comprehensive policy balances, and tamper-proof audit trails.',
    highlight: 'One-Click Action'
  },
  {
    icon: GraduationCap,
    tag: 'GROWTH ACCELERATOR',
    title: 'Upskilling & Academies',
    desc: 'Curated corporate training modules with verified capacity limits and interactive talent progress.',
    highlight: 'High Impact'
  },
  {
    icon: BarChart3,
    tag: 'DEEP INTELLIGENCE',
    title: 'Telemetry & Analytics',
    desc: 'C-suite visual dashboards with deep attrition metrics, peak productivity bands, and instant exports.',
    highlight: 'Live Metrics'
  },
  {
    icon: ShieldCheck,
    tag: 'ENTERPRISE GUARD',
    title: 'Hardened Security Protocol',
    desc: 'Role-enforced cryptographic session management separating HR, Managers, and Staff securely.',
    highlight: 'Encrypted'
  }
];

const METRICS = [
  { value: '99.98%', label: 'Uptime Reliability' },
  { value: '10x', label: 'Faster Onboarding' },
  { value: '150k+', label: 'Daily Clock-Ins' },
  { value: '< 1s', label: 'Query Telemetry' },
];

export default function Home() {
  return (
    <div className="bg-[#FAFAFA] min-h-screen text-black font-sans selection:bg-black selection:text-white overflow-x-hidden relative">
      {/* Dynamic Background Light Gradients */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[400px] bg-zinc-200/50 blur-[120px] pointer-events-none rounded-full" />
      <div className="absolute top-[800px] -left-40 w-[600px] h-[600px] bg-blue-100/40 blur-[140px] pointer-events-none rounded-full" />

      {/* --- HEADER --- */}
      <header className="sticky top-0 z-50 glass-nav">
        <div className="max-w-[1800px] mx-auto px-6 md:px-12 py-5 flex justify-between items-center">
          <Logo size={24} />

          <nav className="hidden md:flex items-center gap-8 text-xs font-bold uppercase tracking-widest text-zinc-600">
            <a href="#features" className="hover:text-black transition-colors">Capabilities</a>
            <a href="#stats" className="hover:text-black transition-colors">Performance</a>
            <a href="#platform" className="hover:text-black transition-colors">Architecture</a>
          </nav>

          <div className="flex items-center gap-4">
            <Link
              to="/login"
              className="px-6 py-2.5 rounded-full bg-black text-white font-extrabold text-xs uppercase tracking-widest hover:bg-zinc-800 hover:scale-105 transition-all shadow-md flex items-center gap-2"
            >
              <span>Launch App</span>
              <ArrowRight size={14} className="stroke-[3]" />
            </Link>
          </div>
        </div>
      </header>

      {/* --- HERO SECTION --- */}
      <section className="relative pt-20 pb-28 md:pt-32 md:pb-40 px-6 md:px-12 max-w-[1800px] mx-auto">
        {/* Background Gigantic Outline Typography like Nike Dn */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full text-center z-0 pointer-events-none select-none">
          <h1 className="text-[20vw] font-black tracking-tighter leading-none text-outline opacity-40">
            STAFFSYNC
          </h1>
        </div>

        <div className="relative z-10 max-w-5xl mx-auto text-center">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-zinc-100 border border-zinc-200 text-xs font-bold uppercase tracking-widest text-zinc-800 mb-8 animate-slide-up shadow-sm">
            <Zap size={14} className="fill-black text-black" />
            <span>Next-Generation Human Resource Engine</span>
          </div>

          <h1 className="text-5xl md:text-8xl lg:text-9xl font-black tracking-tighter uppercase leading-[0.9] mb-8 text-black animate-slide-up">
            BUILT FOR <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-black via-zinc-800 to-zinc-500">
              PEAK VELOCITY.
            </span>
          </h1>

          <p className="text-lg md:text-xl text-zinc-600 font-medium max-w-2xl mx-auto mb-10 leading-relaxed">
            Eliminate operational friction. StaffSync empowers high-performing enterprises with instant attendance verification, automated workflows, and telemetry intelligence.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link
              to="/login"
              className="w-full sm:w-auto px-10 py-5 rounded-full bg-black text-white font-black uppercase tracking-widest text-sm hover:bg-zinc-800 hover:scale-105 hover:shadow-xl transition-all flex items-center justify-center gap-3 group"
            >
              <span>Explore Portal Demo</span>
              <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform stroke-[2.5]" />
            </Link>
            <a
              href="#features"
              className="w-full sm:w-auto px-8 py-5 rounded-full bg-white border border-zinc-300 text-black font-bold uppercase tracking-widest text-sm hover:bg-zinc-50 transition-all text-center shadow-sm"
            >
              System Overview
            </a>
          </div>
        </div>
      </section>

      {/* --- SCROLLING NIKE-STYLE MARQUEE --- */}
      <section className="bg-black text-white py-6 overflow-hidden relative z-20 shadow-md">
        <div className="animate-marquee flex items-center">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="flex items-center whitespace-nowrap">
              <span className="text-3xl md:text-5xl font-black tracking-tighter uppercase px-8 text-white">MAXIMUM OUTPUT</span>
              <Star className="text-[#D4FF00] fill-[#D4FF00] w-6 h-6" />
              <span className="text-3xl md:text-5xl font-black tracking-tighter uppercase px-8 opacity-40">ZERO FRICTION</span>
              <Zap className="text-[#D4FF00] fill-[#D4FF00] w-6 h-6" />
              <span className="text-3xl md:text-5xl font-black tracking-tighter uppercase px-8 text-white">REALTIME TELEMETRY</span>
              <Star className="text-[#D4FF00] fill-[#D4FF00] w-6 h-6" />
            </div>
          ))}
        </div>
      </section>

      {/* --- STATS SECTION --- */}
      <section id="stats" className="py-24 px-6 md:px-12 max-w-[1800px] mx-auto relative z-10">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
          {METRICS.map((m, idx) => (
            <div key={idx} className="glass-card p-8 text-center group bg-white">
              <div className="text-4xl md:text-6xl font-black text-black group-hover:text-zinc-600 transition-colors mb-2">
                {m.value}
              </div>
              <div className="text-xs font-bold uppercase tracking-widest text-zinc-500">
                {m.label}
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* --- FEATURES GRID --- */}
      <section id="features" className="py-24 px-6 md:px-12 max-w-[1800px] mx-auto relative z-10">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-16 gap-6 border-b border-zinc-200 pb-8">
          <div>
            <p className="text-xs font-bold tracking-widest uppercase text-zinc-500 mb-3 flex items-center gap-2">
              <Sparkles size={14} className="text-black" /> Core Architectural Modules
            </p>
            <h2 className="text-4xl md:text-7xl font-black tracking-tighter uppercase text-black">
              Engineered For <br />Operational Dominance.
            </h2>
          </div>
          <p className="text-zinc-600 text-sm max-w-md font-medium leading-relaxed">
            Every feature is calibrated to reduce administrative overhead, ensure absolute audit accuracy, and elevate employee engagement.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {FEATURES.map((f, i) => {
            const Icon = f.icon;
            return (
              <div
                key={i}
                className="glass-card p-8 flex flex-col justify-between group hover:border-black transition-all duration-300 relative overflow-hidden bg-white"
              >
                <div>
                  <div className="flex justify-between items-center mb-6">
                    <span className="text-[10px] font-black uppercase tracking-widest px-3 py-1 rounded-full bg-zinc-100 text-black border border-zinc-200">
                      {f.tag}
                    </span>
                    <span className="text-xs font-bold text-zinc-400 uppercase">{f.highlight}</span>
                  </div>

                  <div className="w-14 h-14 rounded-2xl bg-zinc-100 border border-zinc-200 flex items-center justify-center text-black mb-6 group-hover:scale-110 group-hover:bg-black group-hover:text-white transition-all shadow-sm">
                    <Icon size={26} strokeWidth={2.2} />
                  </div>

                  <h3 className="text-2xl font-bold tracking-tight mb-3 text-black group-hover:text-black transition-colors">
                    {f.title}
                  </h3>
                  <p className="text-zinc-600 text-sm leading-relaxed mb-6 font-medium">
                    {f.desc}
                  </p>
                </div>

                <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-zinc-500 group-hover:text-black transition-colors pt-4 border-t border-zinc-100">
                  <span>Explore Module</span>
                  <ChevronRight size={14} className="group-hover:translate-x-1 transition-transform" />
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* --- IMMERSIVE CTA BANNER (Nike clean dark break) --- */}
      <section id="platform" className="py-20 px-6 md:px-12 max-w-[1800px] mx-auto">
        <div className="rounded-[3rem] bg-[#111111] text-white p-10 md:p-20 relative overflow-hidden text-center flex flex-col items-center shadow-2xl">
          <span className="text-xs font-black uppercase tracking-widest text-[#D4FF00] mb-4">
            Instant Deployment
          </span>
          <h2 className="text-4xl md:text-7xl font-black tracking-tighter uppercase max-w-4xl mb-6">
            Ready to upgrade your enterprise human workflow?
          </h2>
          <p className="text-zinc-400 text-base md:text-lg max-w-xl mb-10 font-medium">
            Experience the pre-seeded live environment right now with dedicated HR, Manager, and Employee accounts.
          </p>

          <Link
            to="/login"
            className="px-12 py-5 rounded-full bg-white text-black font-black uppercase tracking-widest text-sm hover:bg-[#D4FF00] hover:scale-105 transition-all flex items-center gap-3 shadow-lg"
          >
            <span>Access Interactive Portal</span>
            <ArrowRight size={18} className="stroke-[3]" />
          </Link>
        </div>
      </section>

      {/* --- FOOTER --- */}
      <footer className="border-t border-zinc-200 py-12 px-6 md:px-12 max-w-[1800px] mx-auto flex flex-col md:flex-row justify-between items-center gap-6 text-xs text-zinc-500 font-medium bg-white">
        <div className="flex items-center gap-3">
          <Logo size={20} />
          <span>&copy; {new Date().getFullYear()} StaffSync Pro. Modern HR Solution.</span>
        </div>
        <div className="flex items-center gap-6">
          <Link to="/login" className="hover:text-black transition-colors">Sign In</Link>
          <span className="hover:text-black transition-colors cursor-pointer">Security Protocol</span>
          <span className="hover:text-black transition-colors cursor-pointer">API Telemetry</span>
        </div>
      </footer>
    </div>
  );
}
