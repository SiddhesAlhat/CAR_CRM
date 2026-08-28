import React from 'react'
import { FileText, Search, Eye, MessageCircle, Trash2, CheckCircle2, Plus } from 'lucide-react'
import PageHeader from '../components/PageHeader'
import { useNavigate } from 'react-router-dom'
import { getData, setData, getShop } from '../store/data'
import { formatDocumentMessage, openWhatsAppChat, notifyBackendWhatsApp, money } from '../lib/whatsapp'

export default function Quotes() {
  const navigate = useNavigate()
  const [quotes, setQuotes] = React.useState(getData('quotes'))
  const [q, setQ] = React.useState('')
  const [range, setRange] = React.useState('ALL')
  const [error, setError] = React.useState('')
  const [view, setView] = React.useState(null)

  const filtered = quotes.filter(row => {
    const hay = `${row.id} ${row.customer} ${row.phone} ${row.vehicle} ${row.plate}`.toLowerCase()
    return hay.includes(q.toLowerCase())
  })
  const active = quotes.filter(x => x.status === 'Active').length
  const transferred = quotes.filter(x => x.status === 'Transferred').length
  const value = quotes.reduce((s, x) => s + Number(x.amount || 0), 0)

  function persist(next) {
    setQuotes(next)
    setData('quotes', next)
  }

  async function sendWhatsApp(row) {
    setError('')
    try {
      const text = formatDocumentMessage(getShop(), row, 'quote')
      await notifyBackendWhatsApp({ kind: 'quote', phone: row.phone, text, document: row })
      openWhatsAppChat(row.phone, text)
    } catch (err) {
      setError(err.message || 'Could not open WhatsApp')
    }
  }

  function remove(id) {
    persist(quotes.filter(x => x.id !== id))
  }

  function transfer(row) {
    const jobs = getData('jobs')
    jobs.push({
      id: Number(String(row.id).replace(/\D/g, '').slice(-4)) || Date.now(),
      time: row.time,
      vehicle: row.vehicle,
      customer: row.customer,
      phone: row.phone,
      plate: row.plate,
      amount: row.amount,
      soldBy: row.createdBy,
      products: Array.isArray(row.items) ? row.items.reduce((s, i) => s + (i.qty || 1), 0) : 1,
      status: 'Active',
      technician: null,
    })
    setData('jobs', jobs)
    persist(quotes.map(x => x.id === row.id ? { ...x, status: 'Transferred' } : x))
  }

  return (
    <div>
      <PageHeader icon={FileText} title="Quote History" subtitle="Tenders and quotes. Send any row to the client’s WhatsApp, or create a new one from Products → Cart.">
        <button className="primary-btn" onClick={() => navigate('/products')}><Plus size={16} /> New tender</button>
      </PageHeader>
      {error && <div className="form-error">{error}</div>}
      <div className="quote-stats">
        <div><span>Total Quotes</span><strong>{quotes.length}</strong></div>
        <div><span>Active Quotes</span><strong>{active}</strong></div>
        <div><span>Transferred</span><strong>{transferred}</strong></div>
        <div><span>Total Value</span><strong>{money(value)}</strong></div>
      </div>
      <div className="table-tools">
        <div className="search"><Search size={16} /><input value={q} onChange={e => setQ(e.target.value)} placeholder="Search quotes..." /></div>
        <div className="range">
          {['7D', '15D', '1M', 'ALL'].map(r => (
            <button key={r} className={range === r ? 'selected' : ''} onClick={() => setRange(r)}>{r}</button>
          ))}
        </div>
        <select><option>All Status ({quotes.length})</option></select>
      </div>
      <div className="table-wrap">
        <table>
          <thead>
            <tr>
              <th>QUOTE ID</th><th>DATE &amp; TIME</th><th>CUSTOMER INFO</th><th>VEHICLE INFO</th>
              <th>TOTAL AMOUNT</th><th>CREATED BY</th><th>STATUS</th><th>ACTIONS</th>
            </tr>
          </thead>
          <tbody>
            {filtered.length === 0 ? (
              <tr><td colSpan="8" className="empty-row">No quotes found. Create one from Products cart.</td></tr>
            ) : filtered.map(row => (
              <tr key={row.id}>
                <td><strong>{row.id}</strong></td>
                <td>{row.date}<br /><span>{row.time}</span></td>
                <td><strong>{row.customer}</strong><br />{row.phone}</td>
                <td><strong>{row.vehicle}</strong><br /><span>{row.plate}</span></td>
                <td><strong>{money(row.amount)}</strong></td>
                <td>{row.createdBy}</td>
                <td><span className={row.status === 'Active' ? 'pill orange-pill' : 'pill green-pill'}><CheckCircle2 size={13} /> {row.status}</span></td>
                <td className="actions">
                  <Eye title="View" onClick={() => setView(row)} />
                  <MessageCircle title="WhatsApp" onClick={() => sendWhatsApp(row)} />
                  <Trash2 title="Delete" onClick={() => remove(row.id)} />
                  {row.status === 'Active' && <button className="outline-btn" onClick={() => transfer(row)}>To Live Job</button>}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {view && (
        <div className="modal-backdrop" onMouseDown={() => setView(null)}>
          <div className="modal" onMouseDown={e => e.stopPropagation()}>
            <div className="modal-head"><h3>{view.id}</h3><button type="button" onClick={() => setView(null)}>×</button></div>
            <p>{view.customer} · {view.phone}</p>
            <p>{view.vehicle} {view.plate}</p>
            <pre className="msg-preview">{formatDocumentMessage(getShop(), view, 'quote')}</pre>
            <button className="wa-btn full" onClick={() => sendWhatsApp(view)}><MessageCircle size={16} /> Send to WhatsApp</button>
          </div>
        </div>
      )}
    </div>
  )
}
