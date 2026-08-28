const API = import.meta.env.VITE_API_URL || ''

export function digitsOnly(value = '') {
  return String(value).replace(/\D/g, '')
}

/** WhatsApp needs country code. Indian 10-digit numbers become 91XXXXXXXXXX. */
export function toWhatsAppNumber(phone) {
  let n = digitsOnly(phone)
  if (!n) return ''
  if (n.startsWith('0')) n = n.replace(/^0+/, '')
  if (n.length === 10) n = '91' + n
  return n
}

export function money(n) {
  return '₹' + Number(n || 0).toLocaleString('en-IN')
}

export function formatDocumentMessage(shop, doc, kind) {
  const title = kind === 'bill' ? 'BILL' : 'QUOTE / TENDER'
  const lines = [
    shop?.name || 'UpGear24',
    shop?.slogan || '',
    '',
    `${title}  ${doc.id || doc.number}`,
    `Date: ${doc.date || ''} ${doc.time || ''}`.trim(),
    '',
    `Customer: ${doc.customer || '-'}`,
    `Phone: ${doc.phone || '-'}`,
    `Vehicle: ${doc.vehicle || '-'} ${doc.plate ? '(' + doc.plate + ')' : ''}`.trim(),
    '',
    'Items:',
  ]

  const items = Array.isArray(doc.items) ? doc.items : []
  if (items.length === 0) {
    lines.push('(see shop for details)')
  } else {
    items.forEach((item, i) => {
      const qty = item.qty || 1
      const lineTotal = (item.price || 0) * qty
      lines.push(`${i + 1}. ${item.name} x${qty} = ${money(lineTotal)}`)
    })
  }

  lines.push('', `TOTAL: ${money(doc.amount)}`)
  if (shop?.invoiceNotes) {
    lines.push('', shop.invoiceNotes)
  }
  lines.push('', 'Thank you!')
  return lines.filter((line, i, arr) => !(line === '' && arr[i - 1] === '')).join('\n')
}

export function openWhatsAppChat(phone, text) {
  const number = toWhatsAppNumber(phone)
  if (!number) {
    throw new Error('Customer WhatsApp number is required')
  }
  const url = `https://wa.me/${number}?text=${encodeURIComponent(text)}`
  window.open(url, '_blank', 'noopener,noreferrer')
  return url
}

/**
 * Optional: when VITE_API_URL is set, tell the Java backend to send the message
 * via WhatsApp Cloud API. The chat still opens as a fallback for the shop staff.
 */
export async function notifyBackendWhatsApp(payload) {
  if (!API) return { skipped: true }
  try {
    const res = await fetch(`${API}/api/whatsapp/send`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    })
    if (!res.ok) throw new Error('WhatsApp API failed')
    return await res.json()
  } catch (err) {
    console.warn('Backend WhatsApp send failed, using wa.me instead', err)
    return { skipped: true, error: String(err.message || err) }
  }
}
