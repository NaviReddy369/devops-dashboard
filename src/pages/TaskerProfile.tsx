import React from 'react';
import {
  BadgeCheck,
  Briefcase,
  Clock3,
  Mail,
  MapPin,
  Phone,
  Shield,
  Star,
  Zap,
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

const TaskerProfile: React.FC = () => {
  const { currentUser } = useAuth();
  const displayName =
    currentUser?.displayName || currentUser?.email?.split('@')[0] || 'Tasker';
  const email = currentUser?.email || 'tasker@example.com';
  const avatarInitial = displayName.charAt(0).toUpperCase();

  const specialties = ['Kubernetes automation', 'CI/CD hardening', 'SRE runbooks', 'Cost optimization'];
  const stats = [
    { label: 'Tasks delivered', value: '128', icon: Briefcase },
    { label: 'SLA reliability', value: '99.4%', icon: Shield },
    { label: 'Avg. turnaround', value: '3.2h', icon: Clock3 },
    { label: 'Quality score', value: '4.9/5', icon: Star },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-950 via-indigo-950 to-slate-950 text-white">
      <div className="max-w-6xl mx-auto px-4 py-12 space-y-8">
        <div className="flex items-center justify-between gap-6 flex-wrap">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-full bg-gradient-to-br from-purple-500 to-indigo-500 flex items-center justify-center text-2xl font-bold shadow-lg shadow-purple-500/30">
              {avatarInitial}
            </div>
            <div>
              <p className="text-sm text-purple-200/70">Tasker profile</p>
              <h1 className="text-2xl md:text-3xl font-bold">{displayName}</h1>
              <div className="flex flex-wrap items-center gap-3 text-sm text-purple-200/80 mt-1">
                <span className="inline-flex items-center gap-1">
                  <MapPin className="w-4 h-4" /> Remote-first
                </span>
                <span className="inline-flex items-center gap-1">
                  <Shield className="w-4 h-4" /> Verified
                </span>
                <span className="inline-flex items-center gap-1">
                  <BadgeCheck className="w-4 h-4" /> AI-enabled
                </span>
              </div>
            </div>
          </div>
          <div className="flex items-center gap-3 text-sm text-purple-200/80">
            <a
              className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-white/5 border border-white/10 hover:bg-white/10 transition"
              href={`mailto:${email}`}
            >
              <Mail className="w-4 h-4" />
              {email}
            </a>
            <button className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-purple-500/20 border border-purple-400/30 hover:bg-purple-500/30 transition">
              <Phone className="w-4 h-4" />
              Schedule call
            </button>
          </div>
        </div>

        <div className="grid gap-6 md:grid-cols-3">
          <div className="md:col-span-2 space-y-6">
            <div className="p-6 rounded-2xl bg-white/5 border border-white/10 shadow-xl shadow-purple-500/10">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-semibold">Profile overview</h2>
                <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs bg-purple-500/10 border border-purple-400/20 text-purple-100">
                  <Zap className="w-4 h-4" />
                  Available for fast-track tasks
                </span>
              </div>
              <p className="text-sm text-purple-100/80 leading-relaxed">
                I specialize in building resilient DevOps pipelines that keep releases predictable.
                Expect IaC-first approaches, automated quality gates, and actionable dashboards for
                engineering and product stakeholders. I’m comfortable pairing with teams or shipping
                independently with clear weekly milestones.
              </p>
            </div>

            <div className="p-6 rounded-2xl bg-white/5 border border-white/10 shadow-xl shadow-indigo-500/10">
              <h3 className="text-lg font-semibold mb-3">Specialties</h3>
              <div className="flex flex-wrap gap-3">
                {specialties.map((item) => (
                  <span
                    key={item}
                    className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-purple-500/10 border border-purple-400/20 text-sm"
                  >
                    <Star className="w-4 h-4 text-purple-200" />
                    {item}
                  </span>
                ))}
              </div>
            </div>

            <div className="p-6 rounded-2xl bg-white/5 border border-white/10 shadow-xl shadow-indigo-500/10">
              <h3 className="text-lg font-semibold mb-3">Recent wins</h3>
              <div className="space-y-4 text-sm text-purple-100/80">
                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-purple-500/20 to-indigo-500/20 border border-purple-400/20 flex items-center justify-center">
                    <Briefcase className="w-4 h-4" />
                  </div>
                  <div>
                    <p className="font-medium text-white">90% faster rollback readiness</p>
                    <p>Blueprinted release playbooks with automated health checks and staged deployments.</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-purple-500/20 to-indigo-500/20 border border-purple-400/20 flex items-center justify-center">
                    <Shield className="w-4 h-4" />
                  </div>
                  <div>
                    <p className="font-medium text-white">CI/CD guardrails</p>
                    <p>Introduced quality gates, signed artifacts, and pre-prod chaos drills to protect SLAs.</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-purple-500/20 to-indigo-500/20 border border-purple-400/20 flex items-center justify-center">
                    <Clock3 className="w-4 h-4" />
                  </div>
                  <div>
                    <p className="font-medium text-white">3h mean turnaround</p>
                    <p>Task triage and automation playbooks keep incidents contained with rapid updates to stakeholders.</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="space-y-6">
            <div className="p-6 rounded-2xl bg-white/5 border border-white/10 shadow-xl shadow-purple-500/10">
              <h3 className="text-lg font-semibold mb-3">Availability</h3>
              <p className="text-sm text-purple-100/80 mb-4">Flexible across PST/EU overlap. Fast-track slots kept for urgent releases.</p>
              <div className="space-y-2 text-sm text-purple-100/90">
                <div className="flex items-center justify-between">
                  <span>Mon - Thu</span>
                  <span className="text-purple-200">7am - 4pm PST</span>
                </div>
                <div className="flex items-center justify-between">
                  <span>Friday</span>
                  <span className="text-purple-200">On-call rotations</span>
                </div>
                <div className="flex items-center justify-between">
                  <span>Weekend</span>
                  <span className="text-purple-200">Critical maintenance only</span>
                </div>
              </div>
            </div>

            <div className="p-6 rounded-2xl bg-white/5 border border-white/10 shadow-xl shadow-indigo-500/10">
              <h3 className="text-lg font-semibold mb-4">Key metrics</h3>
              <div className="grid grid-cols-2 gap-3">
                {stats.map((item) => (
                  <div
                    key={item.label}
                    className="p-4 rounded-xl bg-slate-900/60 border border-white/5 flex flex-col gap-2"
                  >
                    <item.icon className="w-4 h-4 text-purple-200" />
                    <span className="text-lg font-semibold text-white">{item.value}</span>
                    <span className="text-xs text-purple-200/70">{item.label}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TaskerProfile;


