import { NavLink } from 'react-router-dom';
import { useAppSelector } from '../store';
import { formatNum } from '../engine/cbam';

const NAV = [
  { to: '/',               icon: '⊞', label: 'Dashboard' },
  { to: '/calculator',     icon: '⚗', label: 'Hesaplama' },
  { to: '/simulation',     icon: '⟳', label: 'Simülasyon' },
  { to: '/recommendations',icon: '✦', label: 'AI Öneriler' },
  { to: '/history',        icon: '🕑', label: 'Geçmiş' },
  { to: '/reports',        icon: '↓', label: 'Raporlar' },
] as const;

export default function Sidebar() {
  const { company, period, etsPrice, recommendations } = useAppSelector(s => s.cbam);

  return (
    <aside className="w-60 min-h-screen bg-surface border-r border-black/[0.08] flex flex-col px-3 py-5 gap-2 flex-shrink-0 sticky top-0 h-screen overflow-y-auto">
      {/* Logo */}
      <div className="flex items-center gap-2.5 px-2 pb-4 mb-1 border-b border-black/[0.08]">
        <div className="w-9 h-9 rounded-xl flex items-center justify-center font-black text-white text-lg flex-shrink-0 shadow-primary"
          style={{ background: 'linear-gradient(135deg,#3b82f6,#1d4ed8)' }}>
          P
        </div>
        <div>
          <div className="font-extrabold text-sm tracking-widest text-slate-900">PASSORA</div>
          <div className="text-[10px] text-slate-500 uppercase tracking-wider">CBAM Platform</div>
        </div>
      </div>

      {/* Company chip */}
      <div className="flex items-center gap-2.5 bg-surface-2 border border-black/[0.08] rounded-lg px-3 py-2.5 mb-1">
        <span className="text-xl">🏭</span>
        <div className="min-w-0">
          <div className="text-xs font-semibold text-slate-800 truncate">{company.name}</div>
          <div className="text-[10px] text-slate-500">{company.city} · {period}</div>
        </div>
      </div>

      {/* Nav */}
      <nav className="flex flex-col gap-0.5 flex-1">
        {NAV.map(item => (
          <NavLink key={item.to} to={item.to} end={item.to === '/'}
            className={({ isActive }) =>
              `flex items-center gap-2.5 px-3 py-2.5 rounded-lg text-sm font-medium transition-all
               ${isActive
                ? 'bg-blue-500/12 text-primary font-semibold'
                : 'text-slate-600 hover:bg-surface-2 hover:text-slate-800'}`
            }>
            {({ isActive }) => (
              <>
                <span className={`text-base w-5 text-center flex-shrink-0 ${isActive ? 'drop-shadow-[0_0_6px_#3b82f6]' : ''}`}>
                  {item.icon}
                </span>
                <span className="flex-1">{item.label}</span>
                {item.to === '/recommendations' && recommendations.length > 0 && (
                  <span className="bg-primary text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full min-w-[18px] text-center">
                    {recommendations.length}
                  </span>
                )}
              </>
            )}
          </NavLink>
        ))}
      </nav>

      {/* ETS Price Box */}
      <div className="rounded-xl p-3 border border-blue-500/20 bg-surface-glow mt-auto">
        <div className="text-[10px] font-semibold text-slate-500 uppercase tracking-wider">ETS Fiyatı (Q1 2026)</div>
        <div className="text-2xl font-extrabold text-primary font-mono mt-1">€{formatNum(etsPrice, 2)}</div>
        <div className="text-[10px] text-slate-500">/ tCO₂e sertifika</div>
        <div className="flex items-center gap-1.5 mt-2 text-[10px] text-accent">
          <span className="w-1.5 h-1.5 rounded-full bg-accent animate-pulse-glow" />
          Canlı
        </div>
      </div>

      {/* Footer */}
      <div className="pt-2 border-t border-black/[0.08] mt-1">
        <div className="text-[10px] text-slate-600 leading-relaxed">CBAM Reg. (EU) 2023/956</div>
        <div className="text-[10px] text-slate-600">v1.0 · {new Date().getFullYear()}</div>
      </div>
    </aside>
  );
}
