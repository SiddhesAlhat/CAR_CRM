import React from 'react';
import {Search,ShoppingCart,Plus,ChevronDown} from 'lucide-react';
import PageHeader from '../components/PageHeader';
import {getData} from '../store/data';
export default function Products(){
 const [products]=React.useState(getData('products')); const [q,setQ]=React.useState(''); const [cat,setCat]=React.useState('All Categories'); const [cart,setCart]=React.useState([]);
 const filtered=products.filter(p=>(p.name+p.sku+p.category+p.brand).toLowerCase().includes(q.toLowerCase())&&(cat==='All Categories'||p.category===cat));
 const cats=['All Categories',...new Set(products.map(p=>p.category))];
 const add=p=>setCart(c=>{const f=c.find(x=>x.id===p.id);return f?c.map(x=>x.id===p.id?{...x,qty:x.qty+1}:x):[...c,{...p,qty:1}]});
 const total=cart.reduce((s,p)=>s+p.price*p.qty,0);
 return <div><PageHeader title="Product Catalog" subtitle="Search and add items to cart" />
  <div className="search-row"><div className="search"><Search size={18}/><input value={q} onChange={e=>setQ(e.target.value)} placeholder="Search products by name, SKU, category, or combo template name..."/></div><select value={cat} onChange={e=>setCat(e.target.value)}>{cats.map(c=><option key={c}>{c}</option>)}</select><select><option>Most Popular</option><option>Name A → Z</option><option>Price Low → High</option></select><select><option>Templates (Select to Load Combo)</option></select></div>
  <div className="product-grid">{filtered.map(p=><div className="product-card" key={p.id}><div className="product-image"><span>{p.sku}</span><div className="product-art">◉</div></div><div className="product-body"><strong>{p.name}</strong><small>{p.category}</small><div className="product-foot"><span>₹{p.price.toLocaleString('en-IN')}</span><button className="dark-btn" onClick={()=>add(p)}><Plus size={15}/>Add</button></div></div></div>)}</div>
  <div className="result-count">Showing {filtered.length} of {products.length} products</div>
  <button className="floating-cart"><ShoppingCart size={18}/> Cart · ₹{total.toLocaleString('en-IN')}</button>
 </div>
}
