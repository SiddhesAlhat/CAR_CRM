import React from 'react'
import { MessageCircle } from 'lucide-react'
import { getShop, nowStamp, nextId, setData, getData, upsertCustomer } from '../store/data'
import { formatDocumentMessage, openWhatsAppChat, notifyBackendWhatsApp, money } from '../lib/whatsapp'

export default function CheckoutModal({ open, onClose, cart, onDone }) {
  const shop = getShop()
  const [f, setF] = React.useState({ customer: '', phone: '', vehicle: '', plate: '' })
  const [busy, setBusy] = React.useState(false)
  const [error, setError] = React.useState('')

  React.useEffect(() => {
    if (open) {
      setError('')
      setBusy(false)
    }
  }, [open])

  const items = cart.map(p => ({ id: p.id, name: p.name, sku: p.sku, qty: p.qty, price: p.price }))
  const amount = items.reduce((s, p) => s + p.price * p.qty, 0)
  const update = (k, v) => setF({ ...f, [k]: v })

  async function submit(kind) {
    setError('')
    if (!f.customer.trim()) return setError('Customer name is required')
    if (!f.phone.trim()) return setError('Customer WhatsApp / phone number is required')
    if (!items.length) return setError('Add products to the cart first')
    setBusy(true)
    const stamp = nowStamp()
    const createdBy = 'New Shop Testing'
    let doc
    try {
      if (kind === 'quote') {
        doc = {
          id: nextId('quotes', 'QT'),
          ...stamp,
          customer: f.customer.trim(),
          phone: f.phone.trim(),
          vehicle: f.vehicle.trim() || '-',
          plate: f.plate.trim(),
          amount,
          createdBy,
          status: 'Active',
          items,
        }
        setData('quotes', [...getData('quotes'), doc])
      } else {
        const billId = nextId('bills', 'BL')
        doc = {
          id: billId,
          number: billId,
          ...stamp,
          customer: f.customer.trim(),
          phone: f.phone.trim(),
          vehicle: f.vehicle.trim() || '-',
          plate: f.plate.trim(),
          items,
          amount,
          status: 'Paid',
          createdBy,
        }
        setData('bills', [...getData('bills'), doc])
      }
      upsertCustomer({ name: doc.customer, phone: doc.phone, vehicle: doc.vehicle, plate: doc.plate, amount })
      const text = formatDocumentMessage(shop, doc, kind === 'bill' ? 'bill' : 'quote')
      await notifyBackendWhatsApp({ kind, phone: doc.phone, text, document: doc })
      openWhatsAppChat(doc.phone, text)
      onDone?.(kind, doc)
      onClose()
      setF({ customer: '', phone: '', vehicle: '', plate: '' })
    } catch (err) {
      setError(err.message || 'Could not open WhatsApp')
    } finally {
      setBusy(false)
    }
  }

  if (!open) return null

  return (
    <div className="modal-backdrop" onMouseDown={onClose}>
      <div className="modal wide" onMouseDown={e => e.stopPropagation()}>
        <div className="modal-head">
          <h3>Send bill / tender to customer WhatsApp</h3>
          <button type="button" onClick={onClose}>×</button>
        </div>
        <p className="modal-hint">Enter the client’s WhatsApp number. The quote (tender) or bill is saved and opened in WhatsApp so you can send it immediately.</p>
        <div className="form-grid">
          <label>Customer name *<input value={f.customer} onChange={e => update('customer', e.target.value)} placeholder="Client name" /></label>
          <label>WhatsApp number *<input value={f.phone} onChange={e => update('phone', e.target.value)} placeholder="e.g. 9876543210" /></label>
          <label>Vehicle<input value={f.vehicle} onChange={e => update('vehicle', e.target.value)} placeholder="e.g. Swift VDI" /></label>
          <label>Number plate<input value={f.plate} onChange={e => update('plate', e.target.value)} placeholder="e.g. MH12AB1234" /></label>
        </div>
        <div className="checkout-items">
          {items.map(item => (
            <div key={item.id} className="checkout-line">
              <span>{item.name} × {item.qty}</span>
              <strong>{money(item.price * item.qty)}</strong>
            </div>
          ))}
          <div className="checkout-line total"><span>Total</span><strong>{money(amount)}</strong></div>
        </div>
        {error && <div className="form-error">{error}</div>}
        <div className="checkout-actions">
          <button type="button" className="wa-btn" disabled={busy} onClick={() => submit('quote')}>
            <MessageCircle size={16} /> Send Quote / Tender on WhatsApp
          </button>
          <button type="button" className="primary-btn" disabled={busy} onClick={() => submit('bill')}>
            <MessageCircle size={16} /> Create Bill &amp; Send WhatsApp
          </button>
        </div>
      </div>
    </div>
  )
}
