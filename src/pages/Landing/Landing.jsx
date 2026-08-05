import { Link } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { useTheme } from "../../context/ThemeContext";
import {
  Shield, Building2, CalendarDays, Users, ArrowRight,
  Moon, Sun, Menu, X, CheckCircle2, UserPlus, Star,
  ChevronDown, Sparkles, Globe, Megaphone
} from "lucide-react";
import { useState, useEffect } from "react";

const SAMPLE_ORGS = [
  { name: "Computer Science Society", abbr: "CSS", members: 142, events: 18, color: "from-blue-500 to-indigo-600", emoji: "💻" },
  { name: "Environmental Awareness Club", abbr: "EAC", members: 98, events: 12, color: "from-emerald-500 to-teal-600", emoji: "🌿" },
  { name: "Student Publication", abbr: "SP", members: 65, events: 9, color: "from-orange-500 to-red-500", emoji: "📰" },
  { name: "Mathematics Club", abbr: "MC", members: 77, events: 14, color: "from-purple-500 to-pink-600", emoji: "📐" },
  { name: "Cultural Arts Society", abbr: "CAS", members: 110, events: 21, color: "from-rose-500 to-pink-600", emoji: "🎭" },
  { name: "Science & Technology Club", abbr: "STC", members: 89, events: 16, color: "from-cyan-500 to-blue-600", emoji: "🔬" },
];

const OrgPreviewCard = ({ org }) => (
  <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 overflow-hidden hover:shadow-xl hover:-translate-y-1.5 transition-all duration-300 group">
    <div className={`h-24 bg-gradient-to-br ${org.color} flex items-center justify-center relative`}>
      <span className="text-4xl">{org.emoji}</span>
      <div className="absolute top-2 right-2 bg-white/20 backdrop-blur-sm text-white text-[10px] font-bold px-2 py-0.5 rounded-full">{org.abbr}</div>
    </div>
    <div className="p-4">
      <h3 className="font-bold text-slate-800 dark:text-white text-sm truncate">{org.name}</h3>
      <div className="flex items-center justify-between mt-2">
        <div className="flex gap-3 text-xs text-slate-500 dark:text-slate-400">
          <span className="flex items-center gap-1"><Users size={11} /> {org.members}</span>
          <span className="flex items-center gap-1"><CalendarDays size={11} /> {org.events} events</span>
        </div>
        <span className="text-xs font-bold text-blue-600 dark:text-blue-400 group-hover:underline">View →</span>
      </div>
    </div>
  </div>
);

const LandingNav = () => {
  const { dark, toggle } = useTheme();
  const { currentUser } = useAuth();
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    const fn = () => setScrolled(window.scrollY > 30);
    window.addEventListener("scroll", fn);
    return () => window.removeEventListener("scroll", fn);
  }, []);

  const links = [
    { href: "#organizations", label: "Organizations" },
    { href: "#features", label: "Features" },
    { href: "#how-it-works", label: "How It Works" },
    { href: "#roles", label: "For Students" },
  ];

  return (
    <>
      <nav className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${scrolled ? "bg-white/95 dark:bg-slate-900/95 backdrop-blur-md shadow-md border-b border-slate-200/60 dark:border-slate-700/60" : "bg-transparent"}`}>
        <div className="max-w-6xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2.5">
            <div className="w-9 h-9 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-xl flex items-center justify-center shadow-md">
              <Shield size={18} className="text-white" />
            </div>
            <div>
              <p className="font-extrabold text-slate-800 dark:text-white text-sm leading-tight">SSG Club Hub</p>
              <p className="text-[10px] text-slate-500 dark:text-slate-400 hidden sm:block">Organizations 2.0</p>
            </div>
          </Link>
          <div className="hidden md:flex items-center gap-1">
            {links.map(l => (
              <a key={l.href} href={l.href} className="px-3 py-2 text-sm font-medium text-slate-600 dark:text-slate-400 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg transition-colors">{l.label}</a>
            ))}
          </div>
          <div className="flex items-center gap-2">
            <button onClick={toggle} className="p-2 rounded-lg text-slate-500 hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-slate-800 transition-colors">
              {dark ? <Sun size={17} /> : <Moon size={17} />}
            </button>
            {currentUser ? (
              <Link to="/dashboard" className="flex items-center gap-1.5 px-4 py-2 bg-blue-600 text-white rounded-xl text-sm font-bold hover:bg-blue-700 transition-colors shadow-sm">Dashboard <ArrowRight size={14} /></Link>
            ) : (
              <>
                <Link to="/login" className="hidden sm:block px-4 py-2 text-sm font-semibold text-slate-700 dark:text-slate-300 hover:text-blue-600 transition-colors">Sign In</Link>
                <Link to="/register" className="px-4 py-2 bg-blue-600 text-white rounded-xl text-sm font-bold hover:bg-blue-700 transition-colors shadow-sm">Join Now</Link>
              </>
            )}
            <button onClick={() => setMobileOpen(o => !o)} className="md:hidden p-2 rounded-lg text-slate-500 hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-slate-800 transition-colors">
              {mobileOpen ? <X size={20} /> : <Menu size={20} />}
            </button>
          </div>
        </div>
      </nav>
      {mobileOpen && (
        <div className="fixed inset-0 z-40 pt-16 bg-white dark:bg-slate-900 md:hidden fade-in">
          <div className="p-6 space-y-2">
            {links.map(l => (
              <a key={l.href} href={l.href} onClick={() => setMobileOpen(false)} className="block px-4 py-3 text-base font-semibold text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-colors">{l.label}</a>
            ))}
            <div className="pt-4 border-t border-slate-200 dark:border-slate-700 space-y-2">
              <Link to="/login" onClick={() => setMobileOpen(false)} className="block w-full text-center px-4 py-3 border border-slate-300 dark:border-slate-600 text-slate-700 dark:text-slate-300 rounded-xl font-semibold text-sm">Sign In</Link>
              <Link to="/register" onClick={() => setMobileOpen(false)} className="block w-full text-center px-4 py-3 bg-blue-600 text-white rounded-xl font-bold text-sm">Join Now — Free</Link>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

const Landing = () => {
  const { currentUser } = useAuth();
  return (
    <div className="min-h-screen bg-white dark:bg-slate-950 overflow-x-hidden">
      <LandingNav />

      {/* HERO */}
      <section className="relative min-h-screen flex flex-col items-center justify-center px-4 pt-20 pb-16 overflow-hidden">
        <div className="absolute inset-0 pointer-events-none overflow-hidden">
          <div className="absolute -top-40 -right-40 w-[500px] h-[500px] bg-blue-400/15 dark:bg-blue-600/10 rounded-full blur-3xl" />
          <div className="absolute -bottom-40 -left-40 w-[500px] h-[500px] bg-indigo-400/15 dark:bg-indigo-600/10 rounded-full blur-3xl" />
        </div>
        <div className="absolute inset-0 bg-[radial-gradient(circle,rgba(99,102,241,0.06)_1px,transparent_1px)] bg-[size:28px_28px]" />
        <div className="relative max-w-4xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-blue-50 dark:bg-blue-900/40 border border-blue-200 dark:border-blue-700 rounded-full text-xs font-bold text-blue-700 dark:text-blue-300 mb-6">
            <Shield size={11} /> Supreme Student Government · Official Platform
          </div>
          <h1 className="text-4xl sm:text-5xl md:text-6xl font-extrabold text-slate-900 dark:text-white leading-[1.1] tracking-tight mb-6">
            Your School&apos;s{" "}
            <span className="bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 bg-clip-text text-transparent">Organizations,</span>
            <br />All in One Place
          </h1>
          <p className="text-lg sm:text-xl text-slate-600 dark:text-slate-400 max-w-2xl mx-auto mb-4 leading-relaxed">
            SSG Club Hub is the official platform for managing all student organizations under the Supreme Student Government. Join clubs, attend events, and stay connected with your school community.
          </p>
          <p className="text-sm text-slate-500 dark:text-slate-500 mb-10">
            🏫 Designed for Filipino students · 🏢 {SAMPLE_ORGS.length}+ active organizations · 📅 Real-time events
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 mb-4">
            {currentUser ? (
              <Link to="/dashboard" className="flex items-center gap-2 px-8 py-4 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-2xl font-bold text-sm hover:from-blue-700 hover:to-indigo-700 transition-all shadow-xl shadow-blue-500/30 hover:-translate-y-0.5">
                Go to Dashboard <ArrowRight size={16} />
              </Link>
            ) : (
              <>
                <Link to="/register" className="flex items-center gap-2 px-8 py-4 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-2xl font-bold text-sm hover:from-blue-700 hover:to-indigo-700 transition-all shadow-xl shadow-blue-500/30 hover:-translate-y-0.5">
                  <UserPlus size={16} /> Join as Student
                </Link>
                <Link to="/login" className="flex items-center gap-2 px-8 py-4 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 rounded-2xl font-bold text-sm border border-slate-200 dark:border-slate-600 hover:border-blue-400 hover:shadow-md transition-all hover:-translate-y-0.5">
                  Sign In
                </Link>
              </>
            )}
          </div>
          <p className="text-xs text-slate-400">Free for all students · No credit card needed</p>
          <div className="mt-12 flex flex-col items-center gap-1 text-slate-400 dark:text-slate-600 animate-bounce">
            <span className="text-xs">Explore organizations</span>
            <ChevronDown size={16} />
          </div>
        </div>
      </section>

      {/* ORGANIZATIONS SHOWCASE */}
      <section id="organizations" className="py-20 px-4 bg-slate-50 dark:bg-slate-900">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12">
            <span className="inline-block text-xs font-bold text-blue-600 dark:text-blue-400 uppercase tracking-widest bg-blue-50 dark:bg-blue-900/30 px-3 py-1 rounded-full mb-3">Organizations</span>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-800 dark:text-white">Find Your Organization</h2>
            <p className="text-slate-500 dark:text-slate-400 mt-3 max-w-xl mx-auto">Browse all student organizations registered under the SSG. From academic clubs to cultural groups — there is a place for everyone.</p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 mb-10">
            {SAMPLE_ORGS.map(org => <OrgPreviewCard key={org.name} org={org} />)}
          </div>
          <div className="text-center">
            <Link to="/register" className="inline-flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-xl font-bold text-sm hover:bg-blue-700 transition-colors shadow-md">
              <Building2 size={16} /> Browse All Organizations
            </Link>
          </div>
        </div>
      </section>

      {/* FEATURES */}
      <section id="features" className="py-20 px-4 bg-white dark:bg-slate-950">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-12">
            <span className="inline-block text-xs font-bold text-indigo-600 dark:text-indigo-400 uppercase tracking-widest bg-indigo-50 dark:bg-indigo-900/30 px-3 py-1 rounded-full mb-3">Features</span>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-800 dark:text-white">Everything for Your Org Life</h2>
            <p className="text-slate-500 dark:text-slate-400 mt-3">All the tools students and officers need, in one platform.</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {[
              { icon: Building2, color: "from-blue-500 to-indigo-600", title: "Join Organizations", desc: "Browse all SSG-registered organizations, send join requests, and become an official member. Your membership is tracked and managed in real-time.", tags: ["Browse orgs", "Send join request", "Track membership status"] },
              { icon: CalendarDays, color: "from-purple-500 to-indigo-600", title: "Attend Events", desc: "View all upcoming events from your organizations. RSVP with one click so officers can plan accordingly.", tags: ["View upcoming events", "RSVP going / not going", "Event reminders"] },
              { icon: Megaphone, color: "from-orange-500 to-amber-500", title: "Stay Updated", desc: "Receive real-time announcements from your organizations. Never miss an important update, deadline, or activity.", tags: ["Real-time announcements", "Organization-specific updates", "Global SSG notices"] },
              { icon: Sparkles, color: "from-emerald-500 to-teal-600", title: "AI-Powered Tools", desc: "Officers get AI writing assistance for announcements and event descriptions. Smart suggestions keep members engaged.", tags: ["AI announcement writer", "Smart event descriptions", "Engagement insights"] },
            ].map(({ icon: Icon, color, title, desc, tags }) => (
              <div key={title} className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 p-6 hover:shadow-lg hover:-translate-y-1 transition-all duration-300">
                <div className={`w-12 h-12 bg-gradient-to-br ${color} rounded-2xl flex items-center justify-center mb-4 shadow-md`}>
                  <Icon size={22} className="text-white" />
                </div>
                <h3 className="font-bold text-slate-800 dark:text-white text-base mb-2">{title}</h3>
                <p className="text-sm text-slate-500 dark:text-slate-400 leading-relaxed mb-4">{desc}</p>
                <div className="flex flex-wrap gap-1.5">
                  {tags.map(tag => (
                    <span key={tag} className="text-[11px] font-semibold px-2.5 py-1 bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-400 rounded-full">{tag}</span>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* HOW IT WORKS */}
      <section id="how-it-works" className="py-20 px-4 bg-slate-50 dark:bg-slate-900">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-14">
            <span className="inline-block text-xs font-bold text-green-600 dark:text-green-400 uppercase tracking-widest bg-green-50 dark:bg-green-900/30 px-3 py-1 rounded-full mb-3">How It Works</span>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-800 dark:text-white">Get Started in 3 Steps</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              { step: 1, icon: UserPlus, title: "Create Your Account", desc: "Register as a student using your school email. Choose your role — student member or organization officer.", color: "from-blue-500 to-indigo-600" },
              { step: 2, icon: Building2, title: "Find and Join an Org", desc: "Browse all SSG-registered organizations. Send a join request and wait for officer approval to become an official member.", color: "from-purple-500 to-pink-600" },
              { step: 3, icon: CalendarDays, title: "Participate and Engage", desc: "View events, RSVP, read announcements, and stay connected with your organization and the whole school community.", color: "from-emerald-500 to-teal-600" },
            ].map(({ step, icon: Icon, title, desc, color }) => (
              <div key={step} className="text-center group">
                <div className="relative w-16 h-16 mx-auto mb-5">
                  <div className={`w-16 h-16 bg-gradient-to-br ${color} rounded-2xl flex items-center justify-center shadow-lg group-hover:scale-105 transition-transform duration-300`}>
                    <Icon size={26} className="text-white" />
                  </div>
                  <div className="absolute -top-2 -right-2 w-6 h-6 bg-white dark:bg-slate-950 border-2 border-blue-500 rounded-full flex items-center justify-center text-[10px] font-extrabold text-blue-600">{step}</div>
                </div>
                <h3 className="font-bold text-slate-800 dark:text-white mb-2">{title}</h3>
                <p className="text-sm text-slate-500 dark:text-slate-400 leading-relaxed">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ROLES */}
      <section id="roles" className="py-20 px-4 bg-white dark:bg-slate-950">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-12">
            <span className="inline-block text-xs font-bold text-purple-600 dark:text-purple-400 uppercase tracking-widest bg-purple-50 dark:bg-purple-900/30 px-3 py-1 rounded-full mb-3">For Everyone</span>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-800 dark:text-white">Built for Every Student</h2>
            <p className="text-slate-500 dark:text-slate-400 mt-3">Whether you are a student, officer, or SSG admin — the platform works for you.</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
              { icon: Globe, gradient: "from-emerald-500 to-teal-600", role: "Student Member", desc: "The everyday student who wants to be part of school organizations.", perks: ["Browse all organizations", "Send join requests", "View events and RSVP", "Read announcements", "Update your profile"], featured: false },
              { icon: Users, gradient: "from-blue-500 to-indigo-600", role: "Organization Officer", desc: "Elected or appointed officers who manage their organization.", perks: ["Manage your organization", "Create and edit events", "Post announcements with AI", "Approve join requests", "View member roster"], featured: true },
              { icon: Shield, gradient: "from-red-500 to-rose-600", role: "SSG Admin", desc: "SSG officers with full oversight of all organizations.", perks: ["Manage all organizations", "View reports and analytics", "Approve or reject members", "Seed demo data", "Full system access"], featured: false },
            ].map(({ icon: Icon, gradient, role, desc, perks, featured }) => (
              <div key={role} className={`bg-white dark:bg-slate-800 rounded-2xl border overflow-hidden hover:shadow-2xl hover:-translate-y-1.5 transition-all duration-300 ${featured ? "border-blue-400 dark:border-blue-500 shadow-lg shadow-blue-500/10" : "border-slate-200 dark:border-slate-700"}`}>
                {featured && (
                  <div className="bg-blue-600 text-white text-[10px] font-bold text-center py-1.5 flex items-center justify-center gap-1">
                    <Star size={9} fill="white" /> Most Common Role
                  </div>
                )}
                <div className={`bg-gradient-to-br ${gradient} p-6 text-white`}>
                  <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center mb-3"><Icon size={24} /></div>
                  <h3 className="text-lg font-extrabold">{role}</h3>
                  <p className="text-white/70 text-xs mt-1">{desc}</p>
                </div>
                <div className="p-5 space-y-2.5">
                  {perks.map((p, i) => (
                    <div key={i} className="flex items-center gap-2.5">
                      <CheckCircle2 size={14} className="text-emerald-500 flex-shrink-0" />
                      <span className="text-sm text-slate-600 dark:text-slate-400">{p}</span>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* STATS */}
      <section className="py-16 bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-700 relative overflow-hidden">
        <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.04)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.04)_1px,transparent_1px)] bg-[size:32px_32px]" />
        <div className="relative max-w-5xl mx-auto px-4 grid grid-cols-2 md:grid-cols-4 gap-8 text-center text-white">
          {[
            { value: "6+", label: "Active Organizations", icon: Building2 },
            { value: "500+", label: "Student Members", icon: Users },
            { value: "50+", label: "Events This Year", icon: CalendarDays },
            { value: "100%", label: "Free for Students", icon: Shield },
          ].map(({ value, label, icon: Icon }) => (
            <div key={label} className="group">
              <div className="w-10 h-10 bg-white/15 rounded-xl flex items-center justify-center mx-auto mb-3 group-hover:bg-white/25 transition-colors"><Icon size={18} /></div>
              <p className="text-3xl font-extrabold mb-1">{value}</p>
              <p className="text-blue-100 text-sm font-medium">{label}</p>
            </div>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="py-24 px-4 bg-slate-50 dark:bg-slate-900">
        <div className="max-w-2xl mx-auto text-center">
          <div className="w-16 h-16 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-2xl flex items-center justify-center mx-auto mb-5 shadow-xl shadow-blue-500/20">
            <Building2 size={28} className="text-white" />
          </div>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-800 dark:text-white mb-4">Ready to Join Your Organization?</h2>
          <p className="text-slate-500 dark:text-slate-400 mb-8 leading-relaxed">Create your free account today and become part of the SSG Club Hub community. Find your organization, attend events, and make the most of your school life.</p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
            <Link to="/register" className="flex items-center gap-2 px-8 py-4 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-2xl font-bold text-sm hover:from-blue-700 hover:to-indigo-700 transition-all shadow-xl shadow-blue-500/25 hover:-translate-y-0.5">
              <UserPlus size={16} /> Create Free Account
            </Link>
            <Link to="/login" className="flex items-center gap-2 px-8 py-4 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 rounded-2xl font-bold text-sm border border-slate-200 dark:border-slate-700 hover:border-blue-400 transition-all hover:-translate-y-0.5">
              Already have an account? Sign In
            </Link>
          </div>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="py-10 px-4 bg-slate-900 dark:bg-black border-t border-slate-800">
        <div className="max-w-6xl mx-auto">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6 mb-6">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-lg flex items-center justify-center">
                <Shield size={15} className="text-white" />
              </div>
              <div>
                <p className="text-sm font-bold text-white">SSG Club Hub</p>
                <p className="text-[10px] text-slate-500">Organizations 2.0</p>
              </div>
            </div>
            <div className="flex flex-wrap justify-center gap-x-6 gap-y-2 text-xs text-slate-500">
              <a href="#organizations" className="hover:text-white transition-colors">Organizations</a>
              <a href="#features" className="hover:text-white transition-colors">Features</a>
              <a href="#how-it-works" className="hover:text-white transition-colors">How It Works</a>
              <a href="#roles" className="hover:text-white transition-colors">For Students</a>
              <Link to="/login" className="hover:text-white transition-colors">Sign In</Link>
              <Link to="/register" className="hover:text-white transition-colors">Register</Link>
            </div>
          </div>
          <div className="border-t border-slate-800 pt-6 text-center">
            <p className="text-xs text-slate-600">© {new Date().getFullYear()} Supreme Student Government · SSG Club Hub Organizations 2.0. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Landing;
