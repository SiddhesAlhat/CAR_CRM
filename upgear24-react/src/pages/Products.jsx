import React from 'react'
import { Search, ShoppingCart, Plus, Minus, Trash2 } from 'lucide-react'
import PageHeader from '../components/PageHeader'
import CheckoutModal from '../components/CheckoutModal'
import { getData } from '../store/data'
import { money } from '../lib/whatsapp'

export default function Products() {
  const [products] = React.useState(getData('products'))
  const [q, setQ] = React.useState('')
  const [cat, setCat] = React.useState('All Categories')
  const [sort, setSort] = React.useState('Most Popular')
  const [cart, setCart] = React.useState([])
  const [cartOpen, setCartOpen] = React.useState(false)
  const [checkout, setCheckout] = React.useState(false)
  const [notice, setNotice] = React.useState('')

  const filtered = products
    .filter(p => (p.name + p.sku + p.category + p.brand).toLowerCase().includes(q.toLowerCase()) && (cat === 'All Categories' || p.category === cat))
    .slice()
    .sort((a, b) => {
      if (sort === 'Name A → Z') return a.name.localeCompare(b.name)
      if (sort === 'Price Low → High') return a.price - b.price
      return 0
    })

  const cats = ['All Categories', ...new Set(products.map(p => p.category))]
  const add = p => {
    setCart(c => {
      const f = c.find(x => x.id === p.id)
      return f ? c.map(x => x.id === p.id ? { ...x, qty: x.qty + 1 } : x) : [...c, { ...p, qty: 1 }]
    })
    setCartOpen(true)
  }
  const setQty = (id, qty) => setCart(c => qty < 1 ? c.filter(x => x.id !== id) : c.map(x => x.id === id ? { ...x, qty } : x))
  const total = cart.reduce((s, p) => s + p.price * p.qty, 0)
  const count = cart.reduce((s, p) => s + p.qty, 0)

  return (
    <div>
      <PageHeader title="Product Catalog" subtitle="Search items, add to cart, then send a bill or tender to the client’s WhatsApp" />
      {notice && <div className="toast-ok">{notice}</div>}
      <div className="search-row">
        <div className="search"><Search size={18} /><input value={q} onChange={e => setQ(e.target.value)} placeholder="Search products by name, SKU, category..." /></div>
        <select value={cat} onChange={e => setCat(e.target.value)}>{cats.map(c => <option key={c}>{c}</option>)}</select>
        <select value={sort} onChange={e => setSort(e.target.value)}>
          <option>Most Popular</option>
          <option>Name A → Z</option>
          <option>Price Low → High</option>
        </select>
        <select disabled><option>Templates (Select to Load Combo)</option></select>
      </div>
      <div className="product-grid">
        {filtered.map(p => (
          <div className="product-card" key={p.id}>
            <div className="product-image"><span>{p.sku}</span><div className="product-art">◉</div></div>
            <div className="product-body">
              <strong>{p.name}</strong>
              <small>{p.brand} · {p.category}</small>
              <div className="product-foot">
                <span>{money(p.price)}</span>
                <button className="dark-btn" onClick={() => add(p)}><Plus size={15} />Add</button>
              </div>
            </div>
          </div>
        ))}
      </div>
      <div className="result-count">Showing {filtered.length} of {products.length} products</div>
      <button className="floating-cart" onClick={() => setCartOpen(true)}>
        <ShoppingCart size={18} /> Cart · {count} · {money(total)}
      </button>

      {cartOpen && (
        <div className="drawer-backdrop" onMouseDown={() => setCartOpen(false)}>
          <aside className="cart-drawer" onMouseDown={e => e.stopPropagation()}>
            <div className="modal-head">
              <h3>Cart</h3>
              <button type="button" onClick={() => setCartOpen(false)}>×</button>
            </div>
            {cart.length === 0 ? <p className="muted">No items yet. Add products from the catalog.</p> : (
              <div className="cart-lines">
                {cart.map(item => (
                  <div className="cart-line" key={item.id}>
                    <div>
                      <strong>{item.name}</strong>
                      <small>{money(item.price)} each</small>
                    </div>
                    <div className="qty-ctrl">
                      <button type="button" onClick={() => setQty(item.id, item.qty - 1)}><Minus size={14} /></button>
                      <span>{item.qty}</span>
                      <button type="button" onClick={() => setQty(item.id, item.qty + 1)}><Plus size={14} /></button>
                    </div>
                    <strong>{money(item.price * item.qty)}</strong>
                    <button type="button" className="icon-btn" onClick={() => setQty(item.id, 0)}><Trash2 size={16} /></button>
                  </div>
                ))}
              </div>
            )}
            <div className="cart-footer">
              <div className="checkout-line total"><span>Total</span><strong>{money(total)}</strong></div>
              <button className="wa-btn full" disabled={!cart.length} onClick={() => { setCartOpen(false); setCheckout(true) }}>
                Checkout · Send to WhatsApp
              </button>
            </div>
          </aside>
        </div>
      )}

      <CheckoutModal
        open={checkout}
        cart={cart}
        onClose={() => setCheckout(false)}
        onDone={(kind, doc) => {
          setCart([])
          setNotice(kind === 'bill'
            ? `Bill ${doc.number} saved and opened in WhatsApp`
            : `Tender ${doc.id} saved and opened in WhatsApp`)
          setTimeout(() => setNotice(''), 4000)
        }}
      />
    </div>
  )
}
