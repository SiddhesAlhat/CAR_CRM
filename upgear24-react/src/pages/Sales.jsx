import React from 'react'
import { FileText, Search, MessageCircle, Plus, Eye } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import PageHeader from '../components/PageHeader'
import { getData, getShop } from '../store/data'
import { formatDocumentMessage, openWhatsAppChat, notifyBackendWhatsApp, money } from '../lib/whatsapp'

export default function Sales() {
  const navigate = useNavigate()
  const [bills, setBills] = React.useState(getData('bills'))
  const [q, setQ] = React.useState('')
  const [error, setError] = React.useState('')
  const [view, setView] = React.useState(null)

  React.useEffect(() => {
    setBills(getData('bills'))
  }, [])

  const filtered = bills.filter(b => `${b.number || b.id} ${b.customer} ${b.phone}`.toLowerCase().includes(q.toLowerCase()))
  const pending = bills.filter(b => b.status === 'Pending').length

  async function sendWhatsApp(row) {
    setError('')
    try {
      const text = formatDocumentMessage(getShop(), { ...row, id: row.number || row.id }, 'bill')
      await notifyBackendWhatsApp({ kind: 'bill', phone: row.phone, text, document: row })
      openWhatsAppChat(row.phone, text)
    } catch (err) {
      setError(err.message || 'Could not open WhatsApp')
    }
  }

  function itemCount(b) {
    if (Array.isArray(b.items)) return b.items.reduce((s, i) => s + (i.qty || 1), 0)
    return b.items || 0
  }

  return (
    <div>
      <PageHeader icon={FileText} title="My Sales" subtitle="Bills are saved here and can be sent again to the customer’s WhatsApp">
        <button className="primary-btn" onClick={() => navigate('/products')}><Plus size={16} /> New bill</button>
      </PageHeader>
      {error && <div className="form-error">{error}</div>}
      <div className="stats-grid">
        <div className="stat-card"><div className="stat-icon green">₹</div><div><span>Total Revenue</span><strong>{money(bills.reduce((s, b) => s + Number(b.amount || 0), 0))}</strong></div></div>
        <div className="stat-card"><div className="stat-icon blue">✓</div><div><span>Total Bills</span><strong>{bills.length}</strong></div></div>
        <div className="stat-card"><div className="stat-icon orange">◷</div><div><span>Pending</span><strong>{pending}</strong></div></div>
      </div>
      <div className="table-tools">
        <div className="search"><Search size={16} /><input value={q} onChange={e => setQ(e.target.value)} placeholder="Search bills..." /></div>
        <div className="range"><button className="selected">ALL</button></div>
      </div>
      <div className="table-wrap">
        <table>
          <thead>
            <tr><th>BILL NO</th><th>CUSTOMER</th><th>PHONE</th><th>PRODUCTS</th><th>AMOUNT</th><th>STATUS</th><th>CREATED BY</th><th>ACTIONS</th></tr>
          </thead>
          <tbody>
            {filtered.length === 0 ? (
              <tr><td colSpan="8" className="empty-row">No sales found. Create a bill from Products → Cart.</td></tr>
            ) : filtered.map(b => (
              <tr key={b.id || b.number}>
                <td>{b.number || b.id}</td>
                <td>{b.customer}</td>
                <td>{b.phone || '-'}</td>
                <td>{itemCount(b)}</td>
                <td>{money(b.amount)}</td>
                <td><span className="pill green-pill">{b.status}</span></td>
                <td>{b.createdBy}</td>
                <td className="actions">
                  <Eye onClick={() => setView(b)} />
                  <MessageCircle title="WhatsApp" onClick={() => sendWhatsApp(b)} />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {view && (
        <div className="modal-backdrop" onMouseDown={() => setView(null)}>
          <div className="modal" onMouseDown={e => e.stopPropagation()}>
            <div className="modal-head"><h3>{view.number || view.id}</h3><button type="button" onClick={() => setView(null)}>×</button></div>
            <pre className="msg-preview">{formatDocumentMessage(getShop(), { ...view, id: view.number || view.id }, 'bill')}</pre>
            <button className="wa-btn full" onClick={() => sendWhatsApp(view)}><MessageCircle size={16} /> Send to WhatsApp</button>
          </div>
        </div>
      )}
    </div>
  )
}
