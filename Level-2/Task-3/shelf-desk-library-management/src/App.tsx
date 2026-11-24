import { useEffect, useMemo, useState } from 'react'

type View = 'dashboard' | 'add' | 'manage' | 'issue' | 'return' | 'available' | 'history'
type IconName = 'grid' | 'plus' | 'books' | 'issue' | 'return' | 'search' | 'history' | 'settings' | 'bell' | 'arrow' | 'trend' | 'check' | 'clock' | 'more' | 'edit' | 'trash' | 'close' | 'filter' | 'chevron' | 'spark'

type Book = {
  id: string
  title: string
  author: string
  category: string
  isbn: string
  total: number
  available: number
  updated: string
}

type Issue = {
  id: string
  bookId: string
  borrower: string
  studentId: string
  issueDate: string
  returnDate?: string
  status: 'Issued' | 'Returned'
  numericId?: number
}

const API_BASE_URL = (import.meta.env.VITE_API_BASE_URL || '/library-management').replace(/\/$/, '')

async function apiRequest<T>(path: string, options: RequestInit = {}): Promise<T> {
  const response = await fetch(`${API_BASE_URL}${path}`, { ...options, headers: { ...(options.body ? { 'Content-Type': 'application/x-www-form-urlencoded;charset=UTF-8' } : {}), ...(options.headers || {}) } })
  const payload = await response.json().catch(() => ({}))
  if (!response.ok) throw new Error(payload.message || `Request failed (${response.status})`)
  return payload as T
}

function formatDate(value?: string) {
  if (!value) return undefined
  const date = new Date(`${value}T00:00:00`)
  return Number.isNaN(date.getTime()) ? value : date.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })
}

function normalizeBook(raw: any): Book {
  return { id: raw.bookId, title: raw.title, author: raw.author, category: raw.category, isbn: raw.isbn, total: Number(raw.totalQuantity), available: Number(raw.availableQuantity), updated: formatDate(raw.updatedAt) || 'From database' }
}

function normalizeIssue(raw: any): Issue {
  const numericId = Number(raw.issueId)
  return { id: `TX-${String(numericId).padStart(4, '0')}`, numericId, bookId: raw.bookId, borrower: raw.borrowerName, studentId: raw.studentId, issueDate: formatDate(raw.issueDate) || raw.issueDate, returnDate: formatDate(raw.returnDate), status: raw.status }
}

const navGroups = [
  { label: 'Workspace', items: [
    { id: 'dashboard' as View, label: 'Dashboard', icon: 'grid' as IconName },
    { id: 'add' as View, label: 'Add book', icon: 'plus' as IconName },
    { id: 'manage' as View, label: 'Manage books', icon: 'books' as IconName },
  ] },
  { label: 'Circulation', items: [
    { id: 'issue' as View, label: 'Issue book', icon: 'issue' as IconName },
    { id: 'return' as View, label: 'Return book', icon: 'return' as IconName },
    { id: 'available' as View, label: 'Available books', icon: 'search' as IconName },
    { id: 'history' as View, label: 'Issue history', icon: 'history' as IconName },
  ] },
]

function Icon({ name, size = 18 }: { name: IconName; size?: number }) {
  const common = { width: size, height: size, viewBox: '0 0 24 24', fill: 'none', stroke: 'currentColor', strokeWidth: 1.8, strokeLinecap: 'round' as const, strokeLinejoin: 'round' as const, 'aria-hidden': true }
  const paths: Record<IconName, React.ReactNode> = {
    grid: <><rect x="3" y="3" width="7" height="7" rx="1" /><rect x="14" y="3" width="7" height="7" rx="1" /><rect x="3" y="14" width="7" height="7" rx="1" /><rect x="14" y="14" width="7" height="7" rx="1" /></>,
    plus: <><path d="M12 5v14M5 12h14" /></>,
    books: <><path d="M4 19.5V5.8a1.8 1.8 0 0 1 1.8-1.8H18" /><path d="M6 20h13a1 1 0 0 0 1-1V5.8A1.8 1.8 0 0 0 18.2 4H7.5A1.5 1.5 0 0 0 6 5.5V20Z" /><path d="M9 8h8M9 12h8M9 16h5" /></>,
    issue: <><path d="M4 19.5V5.8a1.8 1.8 0 0 1 1.8-1.8H18" /><path d="M6 20h13a1 1 0 0 0 1-1V5.8A1.8 1.8 0 0 0 18.2 4H7.5A1.5 1.5 0 0 0 6 5.5V20Z" /><path d="M12 8v8M8 12h8" /></>,
    return: <><path d="M4 19.5V5.8a1.8 1.8 0 0 1 1.8-1.8H18" /><path d="M6 20h13a1 1 0 0 0 1-1V5.8A1.8 1.8 0 0 0 18.2 4H7.5A1.5 1.5 0 0 0 6 5.5V20Z" /><path d="m9 12 3 3 5-6" /></>,
    search: <><circle cx="10.8" cy="10.8" r="6.8" /><path d="m16 16 4.5 4.5" /></>,
    history: <><path d="M3 12a9 9 0 1 0 3-6.7" /><path d="M3 4v5h5M12 7v5l3 2" /></>,
    settings: <><path d="M12 15.5a3.5 3.5 0 1 0 0-7 3.5 3.5 0 0 0 0 7Z" /><path d="m19.4 15 .1.2a2 2 0 0 1-2.7 2.7l-.2-.1a2 2 0 0 0-3.1 1.1V19a2 2 0 0 1-4 0v-.1a2 2 0 0 0-3.1-1.1l-.2.1a2 2 0 0 1-2.7-2.7l.1-.2a2 2 0 0 0-1.1-3.1H2.4a2 2 0 0 1 0-4h.1a2 2 0 0 0 1.1-3.1l-.1-.2a2 2 0 0 1 2.7-2.7l.2.1a2 2 0 0 0 3.1-1.1V.9a2 2 0 0 1 4 0V1a2 2 0 0 0 3.1 1.1l.2-.1a2 2 0 0 1 2.7 2.7l-.1.2a2 2 0 0 0 1.1 3.1h.1a2 2 0 0 1 0 4h-.1a2 2 0 0 0-1.1 3.1Z" /></>,
    bell: <><path d="M18 8a6 6 0 0 0-12 0c0 7-3 7-3 9h18c0-2-3-2-3-9M10 21h4" /></>,
    arrow: <><path d="M5 12h14M13 6l6 6-6 6" /></>,
    trend: <><path d="m4 16 5-5 4 3 7-8" /><path d="M15 6h5v5" /></>,
    check: <><path d="m5 12 4 4L19 6" /></>,
    clock: <><circle cx="12" cy="12" r="8.5" /><path d="M12 7v5l3 2" /></>,
    more: <><circle cx="5" cy="12" r="1" fill="currentColor" stroke="none" /><circle cx="12" cy="12" r="1" fill="currentColor" stroke="none" /><circle cx="19" cy="12" r="1" fill="currentColor" stroke="none" /></>,
    edit: <><path d="M4 20h4l10.5-10.5a2.1 2.1 0 0 0-3-3L5 17v3Z" /><path d="m13.5 8.5 2 2" /></>,
    trash: <><path d="M4 7h16M10 11v5M14 11v5M6 7l1 13h10l1-13M9 7V4h6v3" /></>,
    close: <><path d="m6 6 12 12M18 6 6 18" /></>,
    filter: <><path d="M4 6h16M7 12h10M10 18h4" /></>,
    chevron: <><path d="m8 10 4 4 4-4" /></>,
    spark: <><path d="m12 3-1.3 5.7L5 10l5.7 1.3L12 17l1.3-5.7L19 10l-5.7-1.3L12 3Z" /><path d="m19 16-.5 2.5L16 19l2.5.5L19 22l.5-2.5L22 19l-2.5-.5L19 16Z" /></>,
  }
  return <svg {...common}>{paths[name]}</svg>
}

function App() {
  const [view, setView] = useState<View>('dashboard')
  const [books, setBooks] = useState<Book[]>([])
  const [issues, setIssues] = useState<Issue[]>([])
  const [loading, setLoading] = useState(true)
  const [connectionError, setConnectionError] = useState<string | null>(null)
  const [toast, setToast] = useState<string | null>(null)
  const [search, setSearch] = useState('')
  const [editingBook, setEditingBook] = useState<Book | null>(null)
  const [bookForm, setBookForm] = useState({ id: '', title: '', author: '', category: 'Fiction', isbn: '', total: '1' })
  const [issueForm, setIssueForm] = useState({ bookId: '', borrower: '', studentId: '', issueDate: '2026-11-15' })
  const [historyFilter, setHistoryFilter] = useState<'All' | 'Issued' | 'Returned'>('All')

  const refreshData = async () => {
    setLoading(true)
    try {
      const [bookRows, issueRows] = await Promise.all([
        apiRequest<any[]>('/api/books'),
        apiRequest<any[]>('/api/history'),
      ])
      setBooks(bookRows.map(normalizeBook))
      setIssues(issueRows.map(normalizeIssue))
      setConnectionError(null)
    } catch (error) {
      setConnectionError(error instanceof Error ? error.message : 'The Java backend could not be reached.')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { void refreshData() }, [])

  const activeIssues = issues.filter((issue) => issue.status === 'Issued')
  const returnedIssues = issues.filter((issue) => issue.status === 'Returned')
  const availableCopies = books.reduce((sum, book) => sum + book.available, 0)
  const filteredBooks = useMemo(() => {
    const query = search.trim().toLowerCase()
    if (!query) return books
    return books.filter((book) => [book.id, book.title, book.author, book.isbn, book.category].some((value) => value.toLowerCase().includes(query)))
  }, [books, search])
  const filteredHistory = issues.filter((issue) => historyFilter === 'All' || issue.status === historyFilter)

  const notify = (message: string) => {
    setToast(message)
    window.setTimeout(() => setToast(null), 3200)
  }

  const goTo = (next: View) => {
    setView(next)
    setSearch('')
    setEditingBook(null)
  }

  const resetBookForm = () => setBookForm({ id: '', title: '', author: '', category: 'Fiction', isbn: '', total: '1' })

  const saveBook = async () => {
    const quantity = Number(bookForm.total)
    if (!bookForm.id.trim() || !bookForm.title.trim() || !bookForm.author.trim() || !bookForm.isbn.trim() || !quantity || quantity < 1) {
      notify('Please complete every book field with a valid quantity.')
      return
    }
    try {
      await apiRequest('/api/books', { method: 'POST', body: new URLSearchParams({ bookId: bookForm.id.trim(), title: bookForm.title.trim(), author: bookForm.author.trim(), category: bookForm.category, isbn: bookForm.isbn.trim(), totalQuantity: String(quantity), action: 'create' }) })
      await refreshData()
      resetBookForm()
      notify('Book added to the catalog.')
      setView('manage')
    } catch (error) { notify(error instanceof Error ? error.message : 'Could not add the book.') }
  }

  const updateBook = async () => {
    if (!editingBook) return
    const quantity = Number(bookForm.total)
    if (!bookForm.title.trim() || !bookForm.author.trim() || !bookForm.isbn.trim() || !quantity || quantity < 1 || quantity < editingBook.total - editingBook.available) {
      notify('Check the fields. Total quantity cannot be below copies already issued.')
      return
    }
    try {
      await apiRequest('/api/books', { method: 'POST', body: new URLSearchParams({ action: 'update', bookId: editingBook.id, title: bookForm.title.trim(), author: bookForm.author.trim(), category: bookForm.category, isbn: bookForm.isbn.trim(), totalQuantity: String(quantity) }) })
      await refreshData()
      setEditingBook(null)
      notify('Book details updated.')
    } catch (error) { notify(error instanceof Error ? error.message : 'Could not update the book.') }
  }

  const removeBook = async (book: Book) => {
    if (!window.confirm(`Delete “${book.title}” from the catalog? Historical issue records are preserved, so titles with any issue history cannot be deleted.`)) return
    try {
      await apiRequest(`/api/books?bookId=${encodeURIComponent(book.id)}`, { method: 'DELETE' })
      await refreshData()
      notify('Book removed from the catalog.')
    } catch (error) { notify(error instanceof Error ? error.message : 'This book cannot be deleted.') }
  }

  const issueBook = async () => {
    const book = books.find((item) => item.id === issueForm.bookId)
    if (!book || !issueForm.borrower.trim() || !issueForm.studentId.trim()) {
      notify('Select an available book and complete borrower details.')
      return
    }
    if (book.available < 1) { notify('No copies are available for this title.'); return }
    try {
      await apiRequest('/api/issues', { method: 'POST', body: new URLSearchParams({ action: 'issue', bookId: book.id, borrowerName: issueForm.borrower.trim(), studentId: issueForm.studentId.trim(), issueDate: issueForm.issueDate }) })
      await refreshData()
      setIssueForm({ bookId: '', borrower: '', studentId: '', issueDate: '2026-11-15' })
      notify(`${book.title} issued to ${issueForm.borrower.trim()}.`)
      setView('return')
    } catch (error) { notify(error instanceof Error ? error.message : 'Could not issue the book.') }
  }

  const returnBook = async (issue: Issue) => {
    if (!issue.numericId) { notify('This transaction has no backend issue ID.'); return }
    try {
      await apiRequest('/api/issues', { method: 'POST', body: new URLSearchParams({ action: 'return', issueId: String(issue.numericId), returnDate: '2026-11-15' }) })
      await refreshData()
      notify('Book returned and availability updated.')
    } catch (error) { notify(error instanceof Error ? error.message : 'Could not return the book.') }
  }

  const startEditing = (book: Book) => {
    setEditingBook(book)
    setBookForm({ id: book.id, title: book.title, author: book.author, category: book.category, isbn: book.isbn, total: String(book.total) })
    setView('manage')
  }

  const bookForIssue = (issue: Issue) => books.find((book) => book.id === issue.bookId)

  return (
    <div className="app-shell">
      <aside className="sidebar">
        <div className="brand-lockup" onClick={() => goTo('dashboard')} role="button" tabIndex={0}>
          <span className="brand-mark"><span></span><span></span><span></span></span>
          <span><strong>shelf</strong><em>/ desk</em></span>
        </div>
        <div className="workspace-switcher">
          <div className="workspace-avatar">ML</div>
          <div><span className="eyebrow">Workspace</span><strong>Maple Lane Library</strong></div>
          <Icon name="chevron" size={15} />
        </div>
        <nav className="side-nav" aria-label="Primary navigation">
          {navGroups.map((group) => <div className="nav-group" key={group.label}>
            <span className="nav-label">{group.label}</span>
            {group.items.map((item) => <button key={item.id} className={`nav-item ${view === item.id ? 'active' : ''}`} onClick={() => goTo(item.id)}><Icon name={item.icon} size={18} /><span>{item.label}</span>{item.id === 'return' && activeIssues.length > 0 && <b className="nav-count">{activeIssues.length}</b>}</button>)}
          </div>)}
        </nav>
        <div className="sidebar-bottom">
          <div className="system-note"><span className="status-dot"></span><div><strong>System healthy</strong><span>Last synced just now</span></div></div>
          <button className="nav-item"><Icon name="settings" size={18} /><span>Settings</span></button>
          <div className="profile-row"><div className="profile-avatar">MC</div><div><strong>Maya Chen</strong><span>Administrator</span></div><Icon name="more" size={17} /></div>
        </div>
      </aside>

      <main className="main-content">
        <header className="topbar">
          <div className="breadcrumbs"><span>Maple Lane Library</span><span className="crumb-slash">/</span><strong>{navGroups.flatMap((group) => group.items).find((item) => item.id === view)?.label ?? 'Dashboard'}</strong></div>
          <div className="topbar-actions"><button className="icon-button" aria-label="Notifications"><Icon name="bell" size={19} /><i></i></button><div className="topbar-date">Saturday, November 15, 2026</div></div>
        </header>
        <div className="content-wrap">
          {connectionError && <div className="connection-banner"><span><strong>Backend connection required.</strong> {connectionError}</span><button className="button ghost small" onClick={() => void refreshData()}>Retry</button></div>}
          {loading && <div className="loading-line"><span className="status-dot"></span> Loading live records from Java / JDBC / MySQL…</div>}
          {view === 'dashboard' && <Dashboard books={books} issues={issues} availableCopies={availableCopies} activeIssues={activeIssues} returnedIssues={returnedIssues} onNavigate={goTo} onReturn={returnBook} bookForIssue={bookForIssue} />}
          {view === 'add' && <AddBook bookForm={bookForm} setBookForm={setBookForm} onSave={saveBook} onCancel={() => goTo('dashboard')} />}
          {view === 'manage' && <ManageBooks books={filteredBooks} search={search} setSearch={setSearch} onAdd={() => goTo('add')} onEdit={startEditing} onDelete={removeBook} editingBook={editingBook} bookForm={bookForm} setBookForm={setBookForm} onUpdate={updateBook} onCancelEdit={() => { setEditingBook(null); resetBookForm() }} />}
          {view === 'issue' && <IssueBook books={books} issueForm={issueForm} setIssueForm={setIssueForm} onIssue={issueBook} onCancel={() => goTo('dashboard')} />}
          {view === 'return' && <ReturnBook issues={activeIssues} bookForIssue={bookForIssue} onReturn={returnBook} onIssue={() => goTo('issue')} />}
          {view === 'available' && <AvailableBooks books={books} search={search} setSearch={setSearch} />}
          {view === 'history' && <History issues={filteredHistory} filter={historyFilter} setFilter={setHistoryFilter} bookForIssue={bookForIssue} />}
        </div>
      </main>
      {toast && <div className="toast"><span className="toast-icon"><Icon name="check" size={16} /></span><span>{toast}</span><button onClick={() => setToast(null)} aria-label="Dismiss notification"><Icon name="close" size={15} /></button></div>}
    </div>
  )
}

function PageHeader({ eyebrow, title, description, action }: { eyebrow: string; title: string; description: string; action?: React.ReactNode }) {
  return <div className="page-header"><div><span className="eyebrow teal">{eyebrow}</span><h1>{title}</h1><p>{description}</p></div>{action}</div>
}

function Dashboard({ books, issues, availableCopies, activeIssues, returnedIssues, onNavigate, onReturn, bookForIssue }: { books: Book[]; issues: Issue[]; availableCopies: number; activeIssues: Issue[]; returnedIssues: Issue[]; onNavigate: (view: View) => void; onReturn: (issue: Issue) => void; bookForIssue: (issue: Issue) => Book | undefined }) {
  const stockRate = Math.round((availableCopies / books.reduce((sum, book) => sum + book.total, 0)) * 100)
  return <>
    <div className="dashboard-heading"><div><span className="eyebrow teal">Saturday · 15 November 2026</span><h1>Good afternoon, Maya <span className="wave">✦</span></h1><p>Here’s the circulation pulse for Maple Lane Library.</p></div><div className="header-actions"><button className="button ghost" onClick={() => onNavigate('history')}><Icon name="history" size={16} /> View activity</button><button className="button primary" onClick={() => onNavigate('add')}><Icon name="plus" size={16} /> Add new book</button></div></div>
    <section className="signal-grid" aria-label="Library summary">
      <KpiCard label="Total titles" value={String(books.length).padStart(2, '0')} detail="in your catalog" trend="+2 this month" icon="books" tone="teal" />
      <KpiCard label="Available copies" value={String(availableCopies).padStart(2, '0')} detail={`${stockRate}% of collection`} trend="Healthy stock" icon="check" tone="blue" />
      <KpiCard label="Currently issued" value={String(activeIssues.length).padStart(2, '0')} detail="across 4 borrowers" trend="2 due this week" icon="issue" tone="amber" />
      <KpiCard label="Returned this month" value={String(returnedIssues.length).padStart(2, '0')} detail="completed returns" trend="+18% vs October" icon="return" tone="purple" />
    </section>
    <div className="dashboard-grid">
      <section className="panel circulation-panel"><div className="panel-heading"><div><span className="eyebrow">Live circulation</span><h2>Keep the stacks moving.</h2></div><button className="text-button" onClick={() => onNavigate('return')}>See all <Icon name="arrow" size={15} /></button></div><div className="circulation-list">{activeIssues.slice(0, 4).map((issue) => { const book = bookForIssue(issue); return <div className="circulation-row" key={issue.id}><div className="book-spine"><span>{book?.title.charAt(0)}</span></div><div className="circulation-copy"><strong>{book?.title}</strong><span>{issue.borrower} · {issue.studentId}</span></div><div className="issue-date"><span>Issued</span><strong>{issue.issueDate.replace(' 2026', '')}</strong></div><button className="row-action" onClick={() => onReturn(issue)}>Return <Icon name="arrow" size={14} /></button></div> })}</div><div className="panel-footer"><span><span className="status-dot"></span> {activeIssues.length} active loans</span><button className="text-button" onClick={() => onNavigate('issue')}>Issue a book <Icon name="arrow" size={15} /></button></div></section>
      <section className="panel insight-panel"><div className="panel-heading"><div><span className="eyebrow">Collection insight</span><h2>What’s moving</h2></div><button className="icon-button subtle"><Icon name="more" size={18} /></button></div><div className="insight-hero"><div className="donut" style={{ '--rate': `${stockRate * 3.6}deg` } as React.CSSProperties}><div><strong>{stockRate}%</strong><span>available</span></div></div><div><strong className="insight-number">{availableCopies}<small> / {books.reduce((sum, book) => sum + book.total, 0)}</small></strong><span className="muted">copies ready to lend</span></div></div><div className="category-bars">{['Fiction', 'Technology', 'Design'].map((category, index) => <div className="bar-row" key={category}><div><span>{category}</span><strong>{[86, 48, 64][index]}%</strong></div><div className="bar-track"><span style={{ width: `${[86, 48, 64][index]}%` }}></span></div></div>)}</div><button className="insight-link" onClick={() => onNavigate('available')}>Explore availability <Icon name="arrow" size={15} /></button></section>
    </div>
    <section className="panel recent-panel"><div className="panel-heading"><div><span className="eyebrow">Recent activity</span><h2>Latest transactions</h2></div><button className="text-button" onClick={() => onNavigate('history')}>Full history <Icon name="arrow" size={15} /></button></div><TransactionTable issues={issues.slice(0, 5)} bookForIssue={bookForIssue} compact /></section>
  </>
}

function KpiCard({ label, value, detail, trend, icon, tone }: { label: string; value: string; detail: string; trend: string; icon: IconName; tone: string }) {
  return <div className={`kpi-card tone-${tone}`}><div className="kpi-top"><span className="kpi-label">{label}</span><span className="kpi-icon"><Icon name={icon} size={18} /></span></div><div className="kpi-value">{value}</div><div className="kpi-bottom"><span>{detail}</span><span className="kpi-trend"><Icon name="trend" size={13} /> {trend}</span></div></div>
}

function AddBook({ bookForm, setBookForm, onSave, onCancel }: { bookForm: { id: string; title: string; author: string; category: string; isbn: string; total: string }; setBookForm: (form: { id: string; title: string; author: string; category: string; isbn: string; total: string }) => void; onSave: () => void; onCancel: () => void }) {
  return <><PageHeader eyebrow="Catalog / New entry" title="Add a new book" description="Create a clear, searchable record for every title in your collection." action={<button className="button ghost" onClick={onCancel}><Icon name="close" size={16} /> Cancel</button>} /><div className="form-layout"><section className="panel form-panel"><div className="form-heading"><span className="form-step">01</span><div><h2>Book details</h2><p>Start with the identifiers your team uses at the desk.</p></div></div><div className="form-grid"><Field label="Book ID" placeholder="e.g. BK-1050" value={bookForm.id} onChange={(value) => setBookForm({ ...bookForm, id: value })} /><Field label="ISBN" placeholder="978-0-00-000000-0" value={bookForm.isbn} onChange={(value) => setBookForm({ ...bookForm, isbn: value })} /><Field wide label="Title" placeholder="Enter the full book title" value={bookForm.title} onChange={(value) => setBookForm({ ...bookForm, title: value })} /><Field label="Author" placeholder="Author name" value={bookForm.author} onChange={(value) => setBookForm({ ...bookForm, author: value })} /><label className="field"><span>Category</span><select value={bookForm.category} onChange={(event) => setBookForm({ ...bookForm, category: event.target.value })}><option>Fiction</option><option>Technology</option><option>Design</option><option>Literature</option><option>Psychology</option><option>History</option><option>Nature</option><option>Self development</option></select></label><Field label="Total quantity" type="number" min="1" placeholder="1" value={bookForm.total} onChange={(value) => setBookForm({ ...bookForm, total: value })} /></div><div className="form-actions"><button className="button ghost" onClick={onCancel}>Save for later</button><button className="button primary" onClick={onSave}>Add to catalog <Icon name="arrow" size={16} /></button></div></section><aside className="side-note"><div className="note-icon"><Icon name="spark" size={19} /></div><span className="eyebrow teal">Good to know</span><h3>Make it easy to find later.</h3><p>Use a consistent ID and ISBN so every librarian can locate a title in seconds.</p><div className="note-rule"></div><span className="muted">New books start with all copies available.</span></aside></div></>
}

function ManageBooks({ books, search, setSearch, onAdd, onEdit, onDelete, editingBook, bookForm, setBookForm, onUpdate, onCancelEdit }: { books: Book[]; search: string; setSearch: (value: string) => void; onAdd: () => void; onEdit: (book: Book) => void; onDelete: (book: Book) => void; editingBook: Book | null; bookForm: { id: string; title: string; author: string; category: string; isbn: string; total: string }; setBookForm: (form: { id: string; title: string; author: string; category: string; isbn: string; total: string }) => void; onUpdate: () => void; onCancelEdit: () => void }) {
  return <><PageHeader eyebrow="Catalog / Manage" title="Manage your books" description="Keep your collection accurate, searchable and ready for the next reader." action={<button className="button primary" onClick={onAdd}><Icon name="plus" size={16} /> Add book</button>} />{editingBook && <section className="panel edit-strip"><div><span className="eyebrow teal">Editing {editingBook.id}</span><strong>{editingBook.title}</strong></div><div className="edit-inline"><input value={bookForm.title} onChange={(event) => setBookForm({ ...bookForm, title: event.target.value })} aria-label="Edit title" /><input value={bookForm.author} onChange={(event) => setBookForm({ ...bookForm, author: event.target.value })} aria-label="Edit author" /><select value={bookForm.category} onChange={(event) => setBookForm({ ...bookForm, category: event.target.value })} aria-label="Edit category"><option>Fiction</option><option>Technology</option><option>Design</option><option>Literature</option><option>Psychology</option><option>History</option><option>Nature</option><option>Self development</option></select><input type="number" min="1" value={bookForm.total} onChange={(event) => setBookForm({ ...bookForm, total: event.target.value })} aria-label="Edit quantity" /><button className="button primary small" onClick={onUpdate}>Save</button><button className="icon-button subtle" onClick={onCancelEdit} aria-label="Cancel editing"><Icon name="close" size={16} /></button></div></section>}<section className="panel table-panel"><div className="table-toolbar"><div className="search-field"><Icon name="search" size={17} /><input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Search title, author or ISBN" /></div><div className="toolbar-meta"><span>{books.length} titles</span><button className="filter-button"><Icon name="filter" size={15} /> Filter</button></div></div><div className="table-scroll"><table><thead><tr><th>Book</th><th>Category</th><th>Inventory</th><th>Last updated</th><th></th></tr></thead><tbody>{books.map((book) => <tr key={book.id}><td><div className="book-cell"><div className="mini-spine"><span>{book.title.charAt(0)}</span></div><div><strong>{book.title}</strong><span>{book.author} <em>·</em> {book.id}</span></div></div></td><td><span className="category-pill">{book.category}</span></td><td><div className="inventory-cell"><strong>{book.available} <small>/ {book.total}</small></strong><span className={book.available === 0 ? 'out-text' : ''}>{book.available === 0 ? 'Out of stock' : `${book.available} available`}</span></div></td><td className="muted">{book.updated}</td><td><div className="row-menu"><button className="icon-button subtle" onClick={() => onEdit(book)} aria-label={`Edit ${book.title}`}><Icon name="edit" size={16} /></button><button className="icon-button subtle danger-hover" onClick={() => onDelete(book)} aria-label={`Delete ${book.title}`}><Icon name="trash" size={16} /></button></div></td></tr>)}</tbody></table>{books.length === 0 && <EmptyState title="No titles found" text="Try a different search term or add a new book." />}</div></section></>
}

function IssueBook({ books, issueForm, setIssueForm, onIssue, onCancel }: { books: Book[]; issueForm: { bookId: string; borrower: string; studentId: string; issueDate: string }; setIssueForm: (form: { bookId: string; borrower: string; studentId: string; issueDate: string }) => void; onIssue: () => void; onCancel: () => void }) {
  const selected = books.find((book) => book.id === issueForm.bookId)
  return <><PageHeader eyebrow="Circulation / Issue" title="Issue a book" description="Record a new loan and keep every copy count honest." action={<button className="button ghost" onClick={onCancel}><Icon name="close" size={16} /> Cancel</button>} /><div className="form-layout circulation-form-layout"><section className="panel form-panel"><div className="form-heading"><span className="form-step">01</span><div><h2>Loan details</h2><p>Choose a title, then add the reader’s details.</p></div></div><div className="stacked-fields"><label className="field"><span>Book to issue</span><select value={issueForm.bookId} onChange={(event) => setIssueForm({ ...issueForm, bookId: event.target.value })}><option value="">Select an available title</option>{books.map((book) => <option key={book.id} value={book.id} disabled={book.available === 0}>{book.title} · {book.available === 0 ? 'Out of stock' : `${book.available} available`}</option>)}</select></label>{selected && <div className={`availability-callout ${selected.available === 1 ? 'attention' : ''}`}><span className="callout-icon"><Icon name={selected.available === 1 ? 'clock' : 'check'} size={17} /></span><div><strong>{selected.available === 1 ? 'One copy left — lend with care.' : `${selected.available} copies ready to lend.`}</strong><span>{selected.title} · {selected.id}</span></div></div>}<div className="form-grid"><Field label="Borrower name" placeholder="Full name" value={issueForm.borrower} onChange={(value) => setIssueForm({ ...issueForm, borrower: value })} /><Field label="Student ID" placeholder="e.g. ST-2050" value={issueForm.studentId} onChange={(value) => setIssueForm({ ...issueForm, studentId: value })} /><Field wide label="Issue date" type="date" value={issueForm.issueDate} onChange={(value) => setIssueForm({ ...issueForm, issueDate: value })} /></div></div><div className="form-actions"><button className="button ghost" onClick={onCancel}>Cancel</button><button className="button primary" onClick={onIssue}>Confirm issue <Icon name="arrow" size={16} /></button></div></section><aside className="side-note warm"><div className="note-icon"><Icon name="issue" size={19} /></div><span className="eyebrow amber">Before you issue</span><h3>Availability is checked automatically.</h3><p>The catalog quantity will decrease as soon as you confirm this loan.</p><div className="note-rule"></div><span className="muted">Unavailable titles stay disabled in the selector.</span></aside></div></>
}

function ReturnBook({ issues, bookForIssue, onReturn, onIssue }: { issues: Issue[]; bookForIssue: (issue: Issue) => Book | undefined; onReturn: (issue: Issue) => void; onIssue: () => void }) {
  return <><PageHeader eyebrow="Circulation / Return" title="Return a book" description="Close out active loans and put copies back into circulation." action={<button className="button primary" onClick={onIssue}><Icon name="plus" size={16} /> Issue a book</button>} /><section className="panel table-panel"><div className="table-toolbar"><div><span className="eyebrow">Active loans</span><h2 className="toolbar-title">{issues.length} books currently out</h2></div><div className="toolbar-meta"><span className="status-summary"><span className="status-dot"></span> Live inventory</span></div></div><div className="loan-grid">{issues.map((issue) => { const book = bookForIssue(issue); return <article className="loan-card" key={issue.id}><div className="loan-card-top"><div className="book-cover"><span>{book?.title.charAt(0)}</span><small>{book?.category}</small></div><span className="status-badge issued"><span className="status-dot"></span> Issued</span></div><div className="loan-card-copy"><span className="eyebrow">{issue.id}</span><h3>{book?.title}</h3><p>{book?.author}</p></div><div className="loan-card-meta"><div><span>Borrower</span><strong>{issue.borrower}</strong><small>{issue.studentId}</small></div><div><span>Issued on</span><strong>{issue.issueDate.replace(' 2026', '')}</strong></div></div><button className="button dark full" onClick={() => onReturn(issue)}>Mark as returned <Icon name="check" size={15} /></button></article>})}</div>{issues.length === 0 && <EmptyState title="Nothing to return" text="All issued books are back on the shelves." />}</section></>
}

function AvailableBooks({ books, search, setSearch }: { books: Book[]; search: string; setSearch: (value: string) => void }) {
  const availableBooks = books.filter((book) => book.available > 0)
  const shown = availableBooks.filter((book) => [book.title, book.author, book.isbn, book.category].some((value) => value.toLowerCase().includes(search.toLowerCase())))
  return <><PageHeader eyebrow="Circulation / Availability" title="Available books" description="A quick, clear view of what readers can borrow right now." action={<div className="availability-total"><strong>{availableBooks.reduce((sum, book) => sum + book.available, 0)}</strong><span>copies ready</span></div>} /><section className="panel availability-panel"><div className="table-toolbar"><div className="search-field wide-search"><Icon name="search" size={17} /><input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Search title, author or ISBN" /></div><button className="filter-button"><Icon name="filter" size={15} /> All categories <Icon name="chevron" size={13} /></button></div><div className="availability-list">{shown.map((book) => <div className="availability-row" key={book.id}><div className="availability-book-mark"><span>{book.title.charAt(0)}</span></div><div className="availability-title"><strong>{book.title}</strong><span>{book.author} · {book.category}</span></div><div className="availability-isbn"><span>ISBN</span><strong>{book.isbn}</strong></div><div className="availability-stock"><span>Available</span><strong>{book.available} <small>of {book.total}</small></strong><div className="stock-track"><span style={{ width: `${(book.available / book.total) * 100}%` }}></span></div></div><span className={`status-badge ${book.available > 0 ? 'available' : 'empty'}`}><span className="status-dot"></span>{book.available > 0 ? 'In stock' : 'Out of stock'}</span></div>)}</div>{shown.length === 0 && <EmptyState title="No available titles match" text="Try searching by another title, author or ISBN." />}</section></>
}

function History({ issues, filter, setFilter, bookForIssue }: { issues: Issue[]; filter: 'All' | 'Issued' | 'Returned'; setFilter: (value: 'All' | 'Issued' | 'Returned') => void; bookForIssue: (issue: Issue) => Book | undefined }) {
  return <><PageHeader eyebrow="Circulation / History" title="Issue history" description="A complete paper trail for every issue and return." action={<div className="history-tabs">{(['All', 'Issued', 'Returned'] as const).map((item) => <button key={item} className={filter === item ? 'selected' : ''} onClick={() => setFilter(item)}>{item}</button>)}</div>} /><section className="panel table-panel"><div className="table-toolbar"><div><span className="eyebrow">Transaction log</span><h2 className="toolbar-title">{issues.length} records</h2></div><button className="filter-button"><Icon name="filter" size={15} /> Export log</button></div><TransactionTable issues={issues} bookForIssue={bookForIssue} /></section></>
}

function TransactionTable({ issues, bookForIssue, compact = false }: { issues: Issue[]; bookForIssue: (issue: Issue) => Book | undefined; compact?: boolean }) {
  return <div className="table-scroll"><table className={compact ? 'compact-table' : ''}><thead><tr><th>Transaction</th><th>Book</th><th>Borrower</th><th>Issue date</th><th>Status</th><th>{compact ? '' : 'Return date'}</th></tr></thead><tbody>{issues.map((issue) => { const book = bookForIssue(issue); return <tr key={issue.id}><td><strong className="transaction-id">{issue.id}</strong></td><td><div className="table-book"><span className="table-book-mark">{book?.title.charAt(0)}</span><div><strong>{book?.title}</strong><span>{book?.author}</span></div></div></td><td><strong>{issue.borrower}</strong><span className="table-secondary">{issue.studentId}</span></td><td className="muted">{issue.issueDate}</td><td><span className={`status-badge ${issue.status === 'Issued' ? 'issued' : 'returned'}`}><span className="status-dot"></span>{issue.status}</span></td>{!compact && <td className="muted">{issue.returnDate ?? '—'}</td>}</tr>})}</tbody></table>{issues.length === 0 && <EmptyState title="No transactions yet" text="Issue or return a book to start your history." />}</div>
}

function Field({ label, value, onChange, placeholder, wide = false, type = 'text', min }: { label: string; value: string; onChange: (value: string) => void; placeholder?: string; wide?: boolean; type?: string; min?: string }) {
  return <label className={`field ${wide ? 'wide' : ''}`}><span>{label}</span><input type={type} min={min} value={value} onChange={(event) => onChange(event.target.value)} placeholder={placeholder} /></label>
}

function EmptyState({ title, text }: { title: string; text: string }) {
  return <div className="empty-state"><span className="empty-icon"><Icon name="search" size={21} /></span><strong>{title}</strong><p>{text}</p></div>
}

export default App
