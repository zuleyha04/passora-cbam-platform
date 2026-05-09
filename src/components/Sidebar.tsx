import { useApp } from '../context/AppContext';
import { formatNum } from '../engine/cbam';
import styles from './Sidebar.module.css';

const NAV = [
  { id: 'dashboard',        icon: '⊞', label: 'Dashboard' },
  { id: 'calculator',       icon: '⚗', label: 'Hesaplama' },
  { id: 'simulation',       icon: '⟳', label: 'Simülasyon' },
  { id: 'recommendations',  icon: '✦', label: 'AI Öneriler' },
  { id: 'reports',          icon: '↓', label: 'Raporlar' },
] as const;

export default function Sidebar() {
  const { state, dispatch } = useApp();

  return (
    <aside className={styles.sidebar}>
      {/* Logo */}
      <div className={styles.logo}>
        <div className={styles.logoMark}>P</div>
        <div>
          <div className={styles.logoName}>PASSORA</div>
          <div className={styles.logoSub}>CBAM Platform</div>
        </div>
      </div>

      {/* Company chip */}
      <div className={styles.companyChip}>
        <div className={styles.companyIcon}>🏭</div>
        <div className={styles.companyInfo}>
          <div className={styles.companyName}>{state.company.name}</div>
          <div className={styles.companySub}>{state.company.city} · {state.period}</div>
        </div>
      </div>

      {/* Nav */}
      <nav className={styles.nav}>
        {NAV.map(item => (
          <button
            key={item.id}
            className={`${styles.navItem} ${state.activeTab === item.id ? styles.active : ''}`}
            onClick={() => dispatch({ type: 'SET_TAB', payload: item.id })}
          >
            <span className={styles.navIcon}>{item.icon}</span>
            <span className={styles.navLabel}>{item.label}</span>
            {item.id === 'recommendations' && state.recommendations.length > 0 && (
              <span className={styles.badge}>{state.recommendations.length}</span>
            )}
          </button>
        ))}
      </nav>

      {/* ETS Price */}
      <div className={styles.etsBox}>
        <div className={styles.etsLabel}>ETS Fiyatı (Q1 2026)</div>
        <div className={styles.etsValue}>€{formatNum(state.etsPrice, 2)}</div>
        <div className={styles.etsUnit}>/ tCO₂e sertifika</div>
        <div className={styles.etsLive}><span className={styles.dot}/> Canlı</div>
      </div>

      {/* Footer */}
      <div className={styles.sidebarFooter}>
        <div className={styles.footerText}>CBAM Reg. (EU) 2023/956</div>
        <div className={styles.footerText}>Versiyon 1.0 · {new Date().getFullYear()}</div>
      </div>
    </aside>
  );
}
