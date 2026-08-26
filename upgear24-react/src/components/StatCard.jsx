import React from 'react';
export default function StatCard({label,value,sub,icon:Icon,accent='blue'}){return <div className="stat-card"><div className={'stat-icon '+accent}>{Icon&&<Icon size={20}/>}</div><div><span>{label}</span><strong>{value}</strong>{sub&&<small>{sub}</small>}</div></div>}
