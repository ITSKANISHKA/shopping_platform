import React, { useEffect, useMemo, useState } from 'react'
import CartButton from './components/CartButton'
import ProductCard from './components/ProductCard'

const API = 'https://fakestoreapi.com/products'

export default function App() {
  const [products, setProducts] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  const [query, setQuery] = useState('')
  const [category, setCategory] = useState('all')
  const [sort, setSort] = useState('default')
  const [page, setPage] = useState(1)
  const PER_PAGE = 12

  const [selected, setSelected] = useState(null)

  const [cart, setCart] = useState(() => {
    try {
      const raw = localStorage.getItem('shopping_cart_v1')
      return raw ? JSON.parse(raw) : {}
    } catch (e) {
      return {}
    }
  })

  useEffect(() => {
    setLoading(true)
    fetch(API)
      .then((r) => {
        if (!r.ok) throw new Error('Failed to fetch products')
        return r.json()
      })
      .then((data) => {
        setProducts(data)
        setLoading(false)
      })
      .catch((e) => {
        setError(e.message)
        setLoading(false)
      })
  }, [])

  useEffect(() => {
    localStorage.setItem('shopping_cart_v1', JSON.stringify(cart))
  }, [cart])

  const categories = useMemo(() => {
    const s = new Set(products.map((p) => p.category))
    return ['all', ...Array.from(s)]
  }, [products])

  const filtered = useMemo(() => {
    let list = products.slice()
    if (category !== 'all') list = list.filter((p) => p.category === category)
    if (query.trim()) {
      const q = query.toLowerCase()
      list = list.filter((p) => p.title.toLowerCase().includes(q) || (p.description || '').toLowerCase().includes(q))
    }
    if (sort === 'price-asc') list.sort((a, b) => a.price - b.price)
    if (sort === 'price-desc') list.sort((a, b) => b.price - a.price)
    if (sort === 'rating') list.sort((a, b) => (b.rating?.rate || 0) - (a.rating?.rate || 0))
    return list
  }, [products, category, query, sort])

  const pages = Math.max(1, Math.ceil(filtered.length / PER_PAGE))
  useEffect(() => {
    if (page > pages) setPage(1)
  }, [pages])

  const pageItems = filtered.slice((page - 1) * PER_PAGE, page * PER_PAGE)

  function addToCart(product, qty = 1) {
    setCart((prev) => {
      const copy = { ...prev }
      if (copy[product.id]) copy[product.id].qty += qty
      else copy[product.id] = { product, qty }
      return copy
    })
  }

  function updateQty(id, qty) {
    setCart((prev) => {
      const copy = { ...prev }
      if (!copy[id]) return prev
      copy[id].qty = qty
      if (copy[id].qty <= 0) delete copy[id]
      return copy
    })
  }

  function clearCart() {
    setCart({})
  }

  const cartItems = Object.values(cart)
  const cartTotal = cartItems.reduce((s, it) => s + it.product.price * it.qty, 0)

  return (
    <div className='min-h-screen bg-gradient-to-br from-brand-light to-brand text-gray-900'>
      <header className='bg-white/60 backdrop-blur-sm sticky top-0 z-20'>
        <div className='max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between h-16'>

          <div className='flex items-center gap-4'>
            <h1 className='text-xl font-bold text-brand-dark'>Shopping Platform</h1>
            <span className='text-sm text-brand-dark/70'>Web3 Shopping Cart</span>
          </div>

          <div className='flex items-center gap-4'>
            <input
              value={query}
              onChange={(e) => { setQuery(e.target.value); setPage(1); }}
              className='rounded-md border p-2 w-64'
              placeholder='Search products...'
            />

            <CartButton
              count={cartItems.reduce((s, i) => s + i.qty, 0)}
              onClick={() => document.getElementById('cart-panel').classList.toggle('translate-x-0')}
              total={cartTotal}
            />
          </div>

        </div>
      </header>

      <main className='max-w-7xl mx-auto p-4 lg:p-6 grid lg:grid-cols-4 gap-6'>
        <section className='lg:col-span-1 space-y-4'>
          <div className='bg-white p-4 rounded-2xl shadow-sm border border-brand-light'>
            <label className='block text-sm font-medium mb-2 text-brand-dark'>Category</label>
            <select value={category} onChange={(e) => { setCategory(e.target.value); setPage(1); }} className='w-full rounded-md border p-2'>
              {categories.map((c) => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>
          </div>

          <div className='bg-white p-4 rounded-2xl shadow-sm border border-brand-light'>
            <label className='block text-sm font-medium mb-2 text-brand-dark'>Sort</label>
            <select value={sort} onChange={(e) => setSort(e.target.value)} className='w-full rounded-md border p-2'>
                <option value='default'>Default</option>
                <option value='price-asc'>Price: Low → High</option>
                <option value='price-desc'>Price: High → Low</option>
                <option value='rating'>Top Rated</option>
            </select>
          </div>

        <div className='bg-white p-4 rounded-2xl shadow-sm border border-brand-light'>
            <h3 className='font-semibold mb-2 text-brand-dark'>About</h3>
            <p className='text-sm text-brand-dark/70'>This starter project consumes the FakeStore API. Use it for your submission.</p>
        </div>
        </section>

        <section className='lg:col-span-3'>
            <div className='flex items-center justify-between mb-4'>
                <h2 className='text-lg font-semibold text-brand-dark'>Products</h2>
                <div className='text-sm text-brand-dark/70'>Showing <strong>{filtered.length}</strong> results</div>
            </div>

            <div className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6'>
                {loading && <div className='col-span-full p-8 bg-white rounded-xl shadow text-center'>Loading products...</div>}
                {error && <div className='col-span-full p-8 bg-red-50 rounded-xl shadow text-center'>Error: {error}</div>}

                {!loading && !error && pageItems.map((p) => (
                    <ProductCard key={p.id} product={p} onView={() => setSelected(p)} onAdd={() => addToCart(p,1)} />
                ))}
            </div>

            <nav className='mt-6 flex items-center justify-between'>
                <div className='text-sm text-brand-dark/70'>Page {page} of {pages}</div>
                <div className='flex items-center gap-2'>
                    <button onClick={() => setPage((p) => Math.max(1, p - 1))} className='px-3 py-1 border rounded'>Prev</button>
                    <button onClick={() => setPage((p) => Math.min(pages, p + 1))} className='px-3 py-1 border rounded'>Next</button>
                </div>
            </nav>
        </section>
      </main>

      {selected && (
        <div className='fixed inset-0 z-40 flex items-center justify-center bg-black/40 p-4' onClick={() => setSelected(null)}>
          <div className='bg-white rounded-2xl shadow-lg max-w-3xl w-full grid grid-cols-1 md:grid-cols-2 overflow-hidden' onClick={(e) => e.stopPropagation()}>
            <div className='p-6 flex items-center justify-center'>
              <img src={selected.image} alt={selected.title} className='max-h-96 object-contain' />
            </div>
            <div className='p-6 flex flex-col'>
              <h3 className='text-xl font-semibold mb-2 text-brand-dark'>{selected.title}</h3>
              <p className='text-sm text-brand-dark/70 mb-4'>{selected.category}</p>
              <div className='flex items-center gap-4 mb-4'>
                <div className='text-2xl font-bold'>₹{(selected.price*83).toFixed(2)}</div>
                <div className='text-sm text-brand-dark/70'>${selected.price.toFixed(2)}</div>
                <div className='ml-auto text-sm text-brand-dark'>⭐ {selected.rating?.rate ?? '—'} ({selected.rating?.count ?? 0})</div>
              </div>
              <p className='text-sm text-brand-dark/70 mb-6'>{selected.description}</p>

              <div className='mt-auto flex items-center gap-3'>
                <button onClick={() => { addToCart(selected,1); setSelected(null); }} className='px-4 py-2 bg-brand text-white rounded-lg hover:bg-brand-dark transition'>Add to cart</button>
                <button onClick={() => setSelected(null)} className='px-4 py-2 border rounded-lg'>Close</button>
              </div>
            </div>
          </div>
        </div>
      )}

        <aside id='cart-panel' className='fixed right-0 top-0 h-full w-full sm:w-96 transform translate-x-full transition-transform duration-300 z-50'>
          <div className='h-full flex flex-col bg-white shadow-xl'>
            <div className='p-4 border-b flex items-center justify-between'>
              <h3 className='font-semibold text-brand-dark'>Your Cart</h3>
              <div className='flex items-center gap-2'>
                <div className='text-sm text-brand-dark/70'>Total: ₹{cartTotal ? (cartTotal*83).toFixed(2) : '0.00'}</div>
                <button onClick={() => document.getElementById('cart-panel').classList.toggle('translate-x-0')} className='px-2 py-1 border rounded'>Close</button>
              </div>
            </div>

            <div className='p-4 flex-1 overflow-y-auto space-y-4'>
              {cartItems.length === 0 && (
                <div className='text-sm text-brand-dark/70'>Cart is empty</div>
              )}
              {cartItems.map((it) => (
                <div key={it.product.id} className='flex items-center gap-3'>
                  <img src={it.product.image} alt={it.product.title} className='h-16 w-16 object-contain bg-brand-light p-2 rounded' />
                  <div className='flex-1'>
                    <div className='font-medium text-sm text-brand-dark'>{it.product.title}</div>
                    <div className='text-xs text-brand-dark/70'>${it.product.price.toFixed(2)}</div>
                    <div className='mt-2 flex items-center gap-2'>
                      <button onClick={() => updateQty(it.product.id, it.qty-1)} className='px-2 py-1 border rounded'>-</button>
                      <div className='px-2'>{it.qty}</div>
                      <button onClick={() => updateQty(it.product.id, it.qty+1)} className='px-2 py-1 border rounded'>+</button>
                    </div>
                  </div>
                  <div className='text-sm font-semibold text-brand-dark'>₹{(it.product.price*83*it.qty).toFixed(2)}</div>
                </div>
              ))}
            </div>

            <div className='p-4 border-t'>
              <div className='flex items-center justify-between mb-3'>
                <div className='font-medium text-brand-dark'>Total</div>
                <div className='font-bold text-brand-dark'>₹{(cartTotal*83).toFixed(2)}</div>
              </div>
              <div className='flex gap-2'>
                <button onClick={() => clearCart()} className='px-4 py-2 border rounded-lg'>Clear</button>
              </div>
            </div>
          </div>
        </aside>

    </div>
  )
}
