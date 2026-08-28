import React from 'react'

export default function Modal({open,onClose,title,children,wide}){
  if(!open) return null
  return (
    <div className="modal-backdrop" onMouseDown={onClose}>
      <div className={wide?'modal wide':'modal'} onMouseDown={e=>e.stopPropagation()}>
        <div className="modal-head">
          <h3>{title}</h3>
          <button type="button" onClick={onClose}>×</button>
        </div>
        {children}
      </div>
    </div>
  )
}
