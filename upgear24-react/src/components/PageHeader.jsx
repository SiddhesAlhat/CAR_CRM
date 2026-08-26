import React from 'react';
export default function PageHeader({icon:Icon,title,subtitle,children}){return <div className="page-head"><div><div className="title-row">{Icon&&<Icon size={24} className="title-icon"/>}<h1>{title}</h1></div>{subtitle&&<p>{subtitle}</p>}</div><div className="page-actions">{children}</div></div>}
