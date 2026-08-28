import React from 'react';
import { Routes, Route, Navigate, useLocation, Link } from 'react-router-dom';
import { Bell, ChevronDown, ShoppingBag, Flame, FileText, Monitor, Box, Users, Shield, Wrench, Settings as SettingsIcon, BarChart3, LogOut } from 'lucide-react';
import { initStore } from './store/data';
import Products from './pages/Products';
import LiveJobs from './pages/LiveJobs';
import Sales from './pages/Sales';
import Quotes from './pages/Quotes';
import Accounts from './pages/Accounts';
import Inventory from './pages/Inventory';
import Staff from './pages/Staff';
import Dashboard from './pages/Dashboard';
import TechnicianW from './pages/TechnicianW';
import TechnicianR from './pages/TechnicianR';
import Settings from './pages/Settings';
import JobForm from './pages/JobForm';

initStore();

const nav=[
 {to:'/products',label:'Products',icon:ShoppingBag},
 {to:'/live-jobs',label:'Live Jobs',icon:Flame},
 {to:'/sales',label:'My Sales',icon:FileText},
 {to:'/quotes',label:'Quotes / Tenders',icon:FileText},
 {to:'/accounts',label:'Accounts',icon:Monitor},
 {to:'/inventory',label:'Inventory',icon:Box},
 {to:'/staff',label:'Staff',icon:Users},
 {to:'/dashboard',label:'Dashboard',icon:Shield},
 {to:'/technician-w',label:'Technician W',icon:Wrench},
 {to:'/technician-r',label:'Technician R',icon:Wrench},
 {to:'/settings',label:'Settings',icon:SettingsIcon},
]

function Shell(){
 const location=useLocation();
 const [open,setOpen]=React.useState(false);
 return <div className="app-shell">
  <aside className={open?'sidebar open':'sidebar'}>
    <div className="logo-wrap"><div className="logo-mark">UG</div><div><div className="logo-word">UPGEAR24</div><div className="logo-sub">CAR & BIKE ACCESSORIES</div></div></div>
    <nav>{nav.map(({to,label,icon:Icon})=><Link key={to} className={location.pathname===to?'nav-item active':'nav-item'} to={to} onClick={()=>setOpen(false)}><Icon size={18}/><span>{label}</span></Link>)}</nav>
    <div className="sidebar-footer">© 2026 Upgear24 v2.0.0</div>
  </aside>
  <div className="main-area">
   <header className="topbar">
    <button className="mobile-menu" onClick={()=>setOpen(v=>!v)}>☰</button>
    <div className="topbar-spacer" />
    <Bell size={20} />
    <div className="profile"><div className="avatar">NS</div><div><strong>New Shop Testing</strong><small>System Owner</small></div><ChevronDown size={16}/></div>
   </header>
   <main className="content"><div className="watermark-car" aria-hidden="true">🚗</div><Routes>
    <Route path="/" element={<Navigate to="/products" replace/>}/>
    <Route path="/products" element={<Products/>}/>
    <Route path="/live-jobs" element={<LiveJobs/>}/>
    <Route path="/sales" element={<Sales/>}/>
    <Route path="/quotes" element={<Quotes/>}/>
    <Route path="/accounts" element={<Accounts/>}/>
    <Route path="/inventory" element={<Inventory/>}/>
    <Route path="/staff" element={<Staff/>}/>
    <Route path="/dashboard" element={<Dashboard/>}/>
    <Route path="/technician-w" element={<TechnicianW/>}/>
    <Route path="/technician-r" element={<TechnicianR/>}/>
    <Route path="/settings" element={<Settings/>}/>
    <Route path="/new-job" element={<JobForm/>}/>
   </Routes></main>
  </div>
 </div>
}
export default function App(){return <Shell/>}
