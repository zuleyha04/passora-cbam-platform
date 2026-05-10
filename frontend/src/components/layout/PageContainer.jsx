import RoleBasedSidebar from './RoleBasedSidebar'

export default function PageContainer({ title, subtitle, children }) {
  return (
    <div className="app-shell">
      <RoleBasedSidebar />

      <main className="app-main">
        <header className="app-header">
          <div>
            <h1>{title}</h1>
            {subtitle && <p>{subtitle}</p>}
          </div>

          <div className="header-user-badge">P</div>
        </header>

        <section className="app-content">
          {children}
        </section>
      </main>
    </div>
  )
}