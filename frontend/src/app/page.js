'use client';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { getProducts, getCategories } from '@/lib/api';
import ProductCard from '@/components/ProductCard';
import { FiArrowRight } from 'react-icons/fi';

const HERO_SLIDES = [
  {
    title: 'Beauty Made Accessible',
    subtitle: 'Up to 40% off on top brands',
    cta: 'Shop Now',
    href: '/products',
    bg: 'from-pink-100 to-rose-50',
    img: 'https://images.unsplash.com/photo-1522335789203-aabd1fc54bc9?w=800',
  },
  {
    title: 'New Arrivals in Skincare',
    subtitle: 'Discover your perfect routine',
    cta: 'Explore',
    href: '/products?category=skincare',
    bg: 'from-purple-100 to-pink-50',
    img: 'https://images.unsplash.com/photo-1556228578-8c89e6adf883?w=800',
  },
];

const CATEGORIES = [
  { name: 'Makeup', slug: 'makeup', emoji: '💄', color: 'bg-pink-100' },
  { name: 'Skincare', slug: 'skincare', emoji: '✨', color: 'bg-purple-100' },
  { name: 'Haircare', slug: 'haircare', emoji: '💆', color: 'bg-yellow-100' },
  { name: 'Fragrance', slug: 'fragrance', emoji: '🌸', color: 'bg-rose-100' },
  { name: 'Bath & Body', slug: 'bath-body', emoji: '🛁', color: 'bg-blue-100' },
  { name: 'Wellness', slug: 'wellness', emoji: '🌿', color: 'bg-green-100' },
];

export default function HomePage() {
  const [featuredProducts, setFeaturedProducts] = useState([]);
  const [bestSellers, setBestSellers] = useState([]);
  const [heroIndex, setHeroIndex] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      getProducts({ featured: true, limit: 8 }),
      getProducts({ bestseller: true, limit: 8 }),
    ]).then(([featured, best]) => {
      setFeaturedProducts(featured.data.products);
      setBestSellers(best.data.products);
    }).finally(() => setLoading(false));

    const timer = setInterval(() => setHeroIndex((i) => (i + 1) % HERO_SLIDES.length), 5000);
    return () => clearInterval(timer);
  }, []);

  const slide = HERO_SLIDES[heroIndex];

  return (
    <div>
      {/* Hero Banner */}
      <section className={`relative bg-gradient-to-r ${slide.bg} overflow-hidden`}>
        <div className="max-w-7xl mx-auto px-4 py-12 md:py-20 flex items-center justify-between">
          <div className="max-w-lg">
            <h1 className="text-3xl md:text-5xl font-black text-nykaa-dark mb-4 leading-tight">
              {slide.title}
            </h1>
            <p className="text-lg text-nykaa-gray mb-8">{slide.subtitle}</p>
            <Link href={slide.href} className="btn-primary inline-flex items-center gap-2">
              {slide.cta} <FiArrowRight />
            </Link>
          </div>
          <div className="hidden md:block w-80 h-64 rounded-2xl overflow-hidden shadow-2xl">
            <img src={slide.img} alt="Hero" className="w-full h-full object-cover" />
          </div>
        </div>
        {/* Slide dots */}
        <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2">
          {HERO_SLIDES.map((_, i) => (
            <button
              key={i}
              onClick={() => setHeroIndex(i)}
              className={`w-2 h-2 rounded-full transition-colors ${i === heroIndex ? 'bg-nykaa-pink' : 'bg-gray-300'}`}
            />
          ))}
        </div>
      </section>

      {/* Promotional banner */}
      <div className="bg-nykaa-pink text-white text-center py-3 text-sm font-medium">
        🎉 Use code <strong>GLAMCART10</strong> for 10% off | Free delivery on orders above ₹499
      </div>

      {/* Category Grid */}
      <section className="max-w-7xl mx-auto px-4 py-12">
        <h2 className="section-title text-center">Shop by Category</h2>
        <div className="grid grid-cols-3 md:grid-cols-6 gap-4">
          {CATEGORIES.map((cat) => (
            <Link
              key={cat.slug}
              href={`/products?category=${cat.slug}`}
              className="flex flex-col items-center gap-2 group"
            >
              <div className={`w-16 h-16 md:w-20 md:h-20 ${cat.color} rounded-full flex items-center justify-center text-3xl md:text-4xl group-hover:scale-110 transition-transform duration-200 shadow-sm`}>
                {cat.emoji}
              </div>
              <span className="text-xs md:text-sm font-medium text-nykaa-dark text-center">{cat.name}</span>
            </Link>
          ))}
        </div>
      </section>

      {/* Featured Products */}
      <section className="max-w-7xl mx-auto px-4 py-8">
        <div className="flex items-center justify-between mb-6">
          <h2 className="section-title mb-0">Featured Products</h2>
          <Link href="/products?featured=true" className="text-nykaa-pink text-sm font-semibold hover:underline flex items-center gap-1">
            View All <FiArrowRight size={14} />
          </Link>
        </div>
        {loading ? (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[...Array(8)].map((_, i) => (
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
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {featuredProducts.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        )}
      </section>

      {/* Banner strip */}
      <section className="bg-gradient-to-r from-nykaa-pink to-rose-400 py-10 my-8">
        <div className="max-w-7xl mx-auto px-4 text-center text-white">
          <h2 className="text-2xl md:text-3xl font-black mb-2">Bestsellers of the Season</h2>
          <p className="text-rose-100 mb-6">Top-rated products loved by millions</p>
          <Link href="/products?bestseller=true" className="bg-white text-nykaa-pink px-8 py-3 rounded font-semibold hover:bg-rose-50 transition-colors">
            Shop Bestsellers
          </Link>
        </div>
      </section>

      {/* Bestsellers */}
      <section className="max-w-7xl mx-auto px-4 py-8">
        <div className="flex items-center justify-between mb-6">
          <h2 className="section-title mb-0">Bestsellers</h2>
          <Link href="/products?bestseller=true" className="text-nykaa-pink text-sm font-semibold hover:underline flex items-center gap-1">
            View All <FiArrowRight size={14} />
          </Link>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {bestSellers.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      </section>

      {/* Trust badges */}
      <section className="bg-nykaa-light-gray py-10 mt-8">
        <div className="max-w-7xl mx-auto px-4 grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
          {[
            { icon: '🚚', title: 'Free Delivery', sub: 'On orders above ₹499' },
            { icon: '✅', title: '100% Authentic', sub: 'Genuine products only' },
            { icon: '↩️', title: 'Easy Returns', sub: '15-day return policy' },
            { icon: '🔒', title: 'Secure Payment', sub: 'Safe & encrypted' },
          ].map((badge) => (
            <div key={badge.title} className="flex flex-col items-center gap-2">
              <span className="text-4xl">{badge.icon}</span>
              <h4 className="font-semibold text-nykaa-dark">{badge.title}</h4>
              <p className="text-xs text-nykaa-gray">{badge.sub}</p>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
