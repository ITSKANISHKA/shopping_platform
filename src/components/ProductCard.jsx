import React from 'react'

export default function ProductCard({ product, onView, onAdd }) {
  return (
    <article className='bg-white rounded-2xl shadow-lg overflow-hidden flex flex-col border border-brand-light'>
      <div className='aspect-w-3 aspect-h-2 bg-brand-light flex items-center justify-center p-4'>
        <img src={product.image} alt={product.title} className='max-h-40 object-contain' />
      </div>
      <div className='p-4 flex-1 flex flex-col'>
        <h3 className='font-medium text-sm mb-1 line-clamp-2 text-brand-dark'>{product.title}</h3>
        <p className='text-xs text-brand-dark/70 mb-3 line-clamp-3'>{product.category}</p>
        <div className='mt-auto flex items-center justify-between'>
          <div>
            <div className='font-semibold text-brand-dark'>₹{(product.price*83).toFixed(2)}</div>
            <div className='text-xs text-brand-dark/70'>${product.price.toFixed(2)}</div>
          </div>
          <div className='flex gap-2'>
            <button onClick={onView} className='px-3 py-1 border rounded-lg text-sm text-brand-dark'>View</button>
            <button onClick={onAdd} className='px-3 py-1 bg-brand text-white rounded-lg text-sm hover:bg-brand-dark transition'>Add</button>
          </div>
        </div>
      </div>
    </article>
  )
}
