'use client'

import { useEffect, useState, useCallback } from 'react'
import { FiEdit2, FiTrash2, FiPlus, FiSearch, FiX } from 'react-icons/fi'
import {
  adminGetProducts, adminCreateProduct, adminUpdateProduct,
  adminDeleteProduct, getCategories, getBrands, getApiError,
} from '@/lib/api'
import toast from 'react-hot-toast'
import ConfirmDialog from '@/components/admin/ConfirmDialog'

const EMPTY_FORM = {
  name: '', description: '', price: '', mrp: '', stock: '',
  categoryId: '', brandId: '', images: '', isFeatured: false, isBestSeller: false,
}

export default function AdminProducts() {
  const [products, setProducts] = useState([])
  const [total, setTotal] = useState(0)
  const [page, setPage] = useState(1)
  const [search, setSearch] = useState('')
  const [loading, setLoading] = useState(true)
  const [categories, setCategories] = useState([])
  const [brands, setBrands] = useState([])
  const [showModal, setShowModal] = useState(false)
  const [editing, setEditing] = useState(null)
  const [form, setForm] = useState(EMPTY_FORM)
  const [saving, setSaving] = useState(false)
  const [confirmDelete, setConfirmDelete] = useState(null) // { id, name }
  const PAGE_SIZE = 10

  const load = useCallback(() => {
    setLoading(true)
    adminGetProducts({ page, limit: PAGE_SIZE, search })
      .then((r) => { setProducts(r.data.products); setTotal(r.data.total) })
      .catch((e) => toast.error(getApiError(e)))
      .finally(() => setLoading(false))
  }, [page, search])

  useEffect(() => { load() }, [load])
  useEffect(() => {
    getCategories().then((r) => setCategories(r.data.categories || r.data))
    getBrands().then((r) => setBrands(r.data.brands || r.data))
  }, [])

  const openCreate = () => { setEditing(null); setForm(EMPTY_FORM); setShowModal(true) }
  const openEdit = (p) => {
    setEditing(p)
    setForm({
      name: p.name, description: p.description || '', price: p.price, mrp: p.mrp || '',
      stock: p.stock, categoryId: p.categoryId || '', brandId: p.brandId || '',
      images: (p.images || []).join(', '), isFeatured: p.isFeatured, isBestSeller: p.isBestSeller,
    })
    setShowModal(true)
  }

  const handleSave = async () => {
    if (!form.name.trim() || !form.price || !form.stock) {
      toast.error('Name, price and stock are required'); return
    }
    setSaving(true)
    const payload = {
      ...form,
      price: parseFloat(form.price),
      mrp: form.mrp ? parseFloat(form.mrp) : undefined,
      stock: parseInt(form.stock, 10),
      categoryId: form.categoryId ? parseInt(form.categoryId, 10) : undefined,
      brandId: form.brandId ? parseInt(form.brandId, 10) : undefined,
      images: form.images.split(',').map((s) => s.trim()).filter(Boolean),
    }
    try {
      if (editing) { await adminUpdateProduct(editing.id, payload); toast.success('Product updated') }
      else { await adminCreateProduct(payload); toast.success('Product created') }
      setShowModal(false); load()
    } catch (e) { toast.error(getApiError(e)) }
    finally { setSaving(false) }
  }

  const handleDelete = async () => {
    if (!confirmDelete) return
    try { await adminDeleteProduct(confirmDelete.id); toast.success('Product removed'); load() }
    catch (e) { toast.error(getApiError(e)) }
    finally { setConfirmDelete(null) }
  }

  const totalPages = Math.ceil(total / PAGE_SIZE)

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Products</h1>
          <p className="text-sm text-gray-400 mt-0.5">{total} total products</p>
        </div>
        <button onClick={openCreate} className="flex items-center gap-2 bg-nykaa-pink text-white px-4 py-2.5 rounded-xl text-sm font-semibold hover:bg-nykaa-pink-dark transition-colors shadow-sm">
          <FiPlus size={16} /> Add Product
        </button>
      </div>

      {/* Search */}
      <div className="relative max-w-sm">
        <FiSearch size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
        <input
          className="w-full border border-gray-200 rounded-xl pl-9 pr-9 py-2.5 text-sm focus:outline-none focus:border-nykaa-pink bg-white shadow-sm"
          placeholder="Search products..."
          value={search}
          onChange={(e) => { setSearch(e.target.value); setPage(1) }}
        />
        {search && (
          <button onClick={() => { setSearch(''); setPage(1) }}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
            <FiX size={15} />
          </button>
        )}
      </div>

      {/* Table */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        {loading ? (
          <div className="divide-y divide-gray-50 p-4 space-y-2">
            {[...Array(5)].map((_, i) => <div key={i} className="h-12 bg-gray-50 rounded-xl animate-pulse" />)}
          </div>
        ) : (
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-gray-50 text-xs text-gray-400 uppercase tracking-wide border-b border-gray-100">
                <th className="px-5 py-3.5 text-left">Product</th>
                <th className="px-5 py-3.5 text-left">Category</th>
                <th className="px-5 py-3.5 text-right">Price</th>
                <th className="px-5 py-3.5 text-right">Stock</th>
                <th className="px-5 py-3.5 text-center">Status</th>
                <th className="px-5 py-3.5 text-center">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {products.length === 0 && (
                <tr><td colSpan={6} className="text-center py-14 text-gray-400 text-sm">No products found</td></tr>
              )}
              {products.map((p) => (
                <tr key={p.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-5 py-3.5">
                    <div className="font-semibold text-gray-800 line-clamp-1">{p.name}</div>
                    <div className="text-xs text-gray-400 mt-0.5">{p.brand?.name}</div>
                  </td>
                  <td className="px-5 py-3.5 text-gray-500 text-xs">{p.category?.name || '—'}</td>
                  <td className="px-5 py-3.5 text-right font-semibold text-gray-700">
                    ₹{Number(p.price).toLocaleString('en-IN')}
                  </td>
                  <td className="px-5 py-3.5 text-right">
                    <span className={`font-semibold text-sm ${p.stock < 10 ? 'text-red-500' : 'text-gray-600'}`}>
                      {p.stock}
                    </span>
                  </td>
                  <td className="px-5 py-3.5 text-center">
                    <span className={`px-2.5 py-1 rounded-full text-xs font-semibold ${p.isActive ? 'bg-green-100 text-green-600' : 'bg-red-100 text-red-500'}`}>
                      {p.isActive ? 'Active' : 'Inactive'}
                    </span>
                  </td>
                  <td className="px-5 py-3.5">
                    <div className="flex items-center justify-center gap-2">
                      <button onClick={() => openEdit(p)}
                        className="w-8 h-8 flex items-center justify-center rounded-lg bg-blue-50 text-blue-500 hover:bg-blue-100 transition-colors"
                        title="Edit">
                        <FiEdit2 size={14} />
                      </button>
                      <button onClick={() => setConfirmDelete({ id: p.id, name: p.name })}
                        className="w-8 h-8 flex items-center justify-center rounded-lg bg-red-50 text-red-400 hover:bg-red-100 transition-colors"
                        title="Delete">
                        <FiTrash2 size={14} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex justify-center gap-2">
          <button disabled={page === 1} onClick={() => setPage(page - 1)}
            className="px-4 py-2 rounded-xl border border-gray-200 text-sm font-medium disabled:opacity-40 hover:border-nykaa-pink transition-colors">
            ← Prev
          </button>
          <span className="px-4 py-2 text-sm text-gray-500">{page} / {totalPages}</span>
          <button disabled={page === totalPages} onClick={() => setPage(page + 1)}
            className="px-4 py-2 rounded-xl border border-gray-200 text-sm font-medium disabled:opacity-40 hover:border-nykaa-pink transition-colors">
            Next →
          </button>
        </div>
      )}

      {/* Modal */}
      <ConfirmDialog
        open={!!confirmDelete}
        title="Delete Product"
        message={`Are you sure you want to delete "${confirmDelete?.name}"? It will be marked inactive.`}
        confirmLabel="Delete"
        onConfirm={handleDelete}
        onCancel={() => setConfirmDelete(null)}
      />

      {showModal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto shadow-xl">
            <div className="flex justify-between items-center px-6 py-5 border-b border-gray-100">
              <h2 className="text-lg font-bold text-gray-800">{editing ? 'Edit Product' : 'Add Product'}</h2>
              <button onClick={() => setShowModal(false)} className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-gray-100 text-gray-400 text-xl transition-colors">×</button>
            </div>
            <div className="p-6 space-y-4">
              <input className="input-field" placeholder="Product name *" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
              <textarea className="input-field resize-none" rows={3} placeholder="Description" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} />
              <div className="grid grid-cols-2 gap-3">
                <input className="input-field" placeholder="Price (₹) *" type="number" value={form.price} onChange={(e) => setForm({ ...form, price: e.target.value })} />
                <input className="input-field" placeholder="MRP (₹)" type="number" value={form.mrp} onChange={(e) => setForm({ ...form, mrp: e.target.value })} />
              </div>
              <input className="input-field" placeholder="Stock *" type="number" value={form.stock} onChange={(e) => setForm({ ...form, stock: e.target.value })} />
              <div className="grid grid-cols-2 gap-3">
                <select className="input-field" value={form.categoryId} onChange={(e) => setForm({ ...form, categoryId: e.target.value })}>
                  <option value="">Select Category</option>
                  {categories.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
                </select>
                <select className="input-field" value={form.brandId} onChange={(e) => setForm({ ...form, brandId: e.target.value })}>
                  <option value="">Select Brand</option>
                  {brands.map((b) => <option key={b.id} value={b.id}>{b.name}</option>)}
                </select>
              </div>
              <input className="input-field" placeholder="Image URLs (comma-separated)" value={form.images} onChange={(e) => setForm({ ...form, images: e.target.value })} />
              <div className="flex gap-6 text-sm text-gray-600">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input type="checkbox" className="accent-nykaa-pink" checked={form.isFeatured} onChange={(e) => setForm({ ...form, isFeatured: e.target.checked })} />
                  Featured
                </label>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input type="checkbox" className="accent-nykaa-pink" checked={form.isBestSeller} onChange={(e) => setForm({ ...form, isBestSeller: e.target.checked })} />
                  Bestseller
                </label>
              </div>
            </div>
            <div className="flex gap-3 px-6 pb-6">
              <button onClick={() => setShowModal(false)} className="flex-1 border-2 border-gray-200 text-gray-600 py-2.5 rounded-xl text-sm font-semibold hover:border-gray-300 transition-colors">Cancel</button>
              <button onClick={handleSave} disabled={saving} className="flex-1 bg-nykaa-pink text-white py-2.5 rounded-xl text-sm font-semibold hover:bg-nykaa-pink-dark transition-colors disabled:opacity-50">
                {saving ? 'Saving...' : editing ? 'Update Product' : 'Create Product'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
