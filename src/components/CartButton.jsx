import React from 'react'

export default function CartButton({ count = 0, onClick, total = 0 }) {
  return (
    <button onClick={onClick} className='relative px-3 py-2 border rounded flex items-center gap-2 bg-white shadow-sm'>
      <svg xmlns='http://www.w3.org/2000/svg' className='h-5 w-5 text-brand-dark' viewBox='0 0 20 20' fill='currentColor'>
        <path d='M16 11V3H4v8H2v2h2a3 3 0 106 0h4a3 3 0 106 0h2v-2h-2z' />
      </svg>
      <span className='text-sm text-brand-dark'>Cart</span>
      {count > 0 && <span className='absolute -top-2 -right-2 bg-brand-dark text-white rounded-full text-xs px-2'>{count}</span>}
    </button>
  )
}
