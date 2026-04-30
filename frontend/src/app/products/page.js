'use client';
import { useEffect, useState, useCallback } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { getProducts } from '@/lib/api';
import ProductCard from '@/components/ProductCard';
import { FiFilter, FiX, FiChevronDown } from 'react-icons/fi';

const CATEGORIES = ['makeup', 'skincare', 'haircare', 'fragrance', 'bath-body', 'wellness'];
const SORT_OPTIONS = [
  { value: '', label: 'Relevance' },
  { value: 'price_asc', label: 'Price: Low to High' },
  { value: 'price_desc', label: 'Price: High to Low' },
  { value: 'rating', label: 'Top Rated' },
  { value: 'newest', label: 'Newest First' },
];

export default function ProductsPage() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [products, setProducts] = useState([]);
  const [total, setTotal] = useState(0);
  const [pages, setPages] = useState(1);
  const [loading, setLoading] = useState(true);
  const [filtersOpen, setFiltersOpen] = useState(false);

  const category = searchParams.get('category') || '';
  const search = searchParams.get('search') || '';
  const sort = searchParams.get('sort') || '';
  const featured = searchParams.get('featured') || '';
  const bestseller = searchParams.get('bestseller') || '';
  const page = parseInt(searchParams.get('page') || '1');
  const [minPrice, setMinPrice] = useState('');
  const [maxPrice, setMaxPrice] = useState('');

  const fetchProducts = useCallback(async () => {
    setLoading(true);
    try {
      const params = { page, limit: 20 };
      if (category) params.category = category;
      if (search) params.search = search;
      if (sort) params.sort = sort;
      if (featured) params.featured = featured;
      if (bestseller) params.bestseller = bestseller;
      if (minPrice) params.minPrice = minPrice;
      if (maxPrice) params.maxPrice = maxPrice;

      const res = await getProducts(params);
      setProducts(res.data.products);
      setTotal(res.data.total);
      setPages(res.data.pages);
    } catch {
      setProducts([]);
    } finally {
      setLoading(false);
    }
  }, [category, search, sort, featured, bestseller, page, minPrice, maxPrice]);

  useEffect(() => { fetchProducts(); }, [fetchProducts]);

  const updateParam = (key, value) => {
    const params = new URLSearchParams(searchParams.toString());
    if (value) params.set(key, value);
    else params.delete(key);
    params.delete('page');
    router.push(`/products?${params.toString()}`);
  };

  const pageTitle = (() => {
    if (search) return `Search: "${search}"`;
    if (featured === 'true') return 'Featured Products';
    if (bestseller === 'true') return 'Bestsellers';
    if (category) return category.split('-').map((w) => w[0].toUpperCase() + w.slice(1)).join(' & ');
    return 'All Products';
  })();

  return (
    <div className="max-w-7xl mx-auto px-4 py-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-nykaa-dark">{pageTitle}</h1>
          {!loading && <p className="text-sm text-nykaa-gray mt-1">{total} products</p>}
        </div>

        <div className="flex items-center gap-3">
          {/* Sort */}
          <select
            value={sort}
            onChange={(e) => updateParam('sort', e.target.value)}
            className="input-field py-2 pr-8 w-auto text-sm"
          >
            {SORT_OPTIONS.map((o) => (
              <option key={o.value} value={o.value}>{o.label}</option>
            ))}
          </select>

          {/* Filter toggle (mobile) */}
          <button
            onClick={() => setFiltersOpen(!filtersOpen)}
            className="md:hidden flex items-center gap-2 border border-nykaa-border px-3 py-2 rounded text-sm"
          >
            <FiFilter size={14} /> Filters
          </button>
        </div>
      </div>

      <div className="flex gap-6">
        {/* Sidebar filters */}
        <aside className={`w-60 flex-shrink-0 ${filtersOpen ? 'block' : 'hidden'} md:block`}>
          <div className="card p-4 sticky top-24">
            <h3 className="font-semibold text-nykaa-dark mb-4">Filters</h3>

            {/* Category filter */}
            <div className="mb-6">
              <h4 className="text-sm font-semibold text-nykaa-gray mb-3 uppercase tracking-wide">Category</h4>
              {CATEGORIES.map((cat) => (
                <label key={cat} className="flex items-center gap-2 mb-2 cursor-pointer group">
                  <input
                    type="radio"
                    name="category"
                    checked={category === cat}
                    onChange={() => updateParam('category', cat)}
                    className="accent-nykaa-pink"
                  />
                  <span className="text-sm text-nykaa-dark group-hover:text-nykaa-pink transition-colors capitalize">
                    {cat.replace('-', ' & ')}
                  </span>
                </label>
              ))}
              {category && (
                <button onClick={() => updateParam('category', '')} className="text-xs text-nykaa-pink mt-1">
                  Clear
                </button>
              )}
            </div>

            {/* Price range */}
            <div className="mb-6">
              <h4 className="text-sm font-semibold text-nykaa-gray mb-3 uppercase tracking-wide">Price Range</h4>
              <div className="flex gap-2">
                <input
                  type="number"
                  placeholder="Min"
                  value={minPrice}
                  onChange={(e) => setMinPrice(e.target.value)}
                  className="input-field py-1.5 text-xs w-1/2"
                />
                <input
                  type="number"
                  placeholder="Max"
                  value={maxPrice}
                  onChange={(e) => setMaxPrice(e.target.value)}
                  className="input-field py-1.5 text-xs w-1/2"
                />
              </div>
              <button onClick={fetchProducts} className="btn-primary w-full mt-3 py-1.5 text-sm">Apply</button>
            </div>

            {/* Quick filters */}
            <div>
              <h4 className="text-sm font-semibold text-nykaa-gray mb-3 uppercase tracking-wide">Quick Filters</h4>
              <label className="flex items-center gap-2 mb-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={featured === 'true'}
                  onChange={(e) => updateParam('featured', e.target.checked ? 'true' : '')}
                  className="accent-nykaa-pink"
                />
                <span className="text-sm">Featured</span>
              </label>
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={bestseller === 'true'}
                  onChange={(e) => updateParam('bestseller', e.target.checked ? 'true' : '')}
                  className="accent-nykaa-pink"
                />
                <span className="text-sm">Bestsellers</span>
              </label>
            </div>
          </div>
        </aside>

        {/* Product grid */}
        <div className="flex-1">
          {loading ? (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {[...Array(12)].map((_, i) => (
                <div key={i} className="card animate-pulse">
                  <div className="aspect-[3/4] bg-gray-200 rounded-t-lg" />
                  <div className="p-3 space-y-2">
                    <div className="h-3 bg-gray-200 rounded w-1/2" />
                    <div className="h-4 bg-gray-200 rounded" />
                    <div className="h-4 bg-gray-200 rounded w-3/4" />
                  </div>
                </div>
              ))}
            </div>
          ) : products.length === 0 ? (
            <div className="text-center py-20">
              <div className="text-6xl mb-4">🔍</div>
              <h3 className="text-xl font-semibold text-nykaa-dark mb-2">No products found</h3>
              <p className="text-nykaa-gray">Try adjusting your filters or search query</p>
            </div>
          ) : (
            <>
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                {products.map((product) => (
                  <ProductCard key={product.id} product={product} />
                ))}
              </div>

              {/* Pagination */}
              {pages > 1 && (
                <div className="flex justify-center gap-2 mt-10">
                  {[...Array(pages)].map((_, i) => (
                    <button
                      key={i}
                      onClick={() => updateParam('page', String(i + 1))}
                      className={`w-9 h-9 rounded font-medium text-sm transition-colors ${
                        page === i + 1
                          ? 'bg-nykaa-pink text-white'
                          : 'border border-nykaa-border hover:border-nykaa-pink hover:text-nykaa-pink'
                      }`}
                    >
                      {i + 1}
                    </button>
                  ))}
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}
