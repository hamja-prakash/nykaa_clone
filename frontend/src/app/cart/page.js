'use client';
import { useState } from 'react';
import Link from 'next/link';
import { useCart } from '@/context/CartContext';
import { useAuth } from '@/context/AuthContext';
import { validateCoupon } from '@/lib/api';
import { FiTrash2, FiShoppingBag, FiTag } from 'react-icons/fi';
import toast from 'react-hot-toast';

export default function CartPage() {
  const { cart, cartTotal, updateItem, removeItem, loading } = useCart();
  const { user } = useAuth();
  const [coupon, setCoupon] = useState('');
  const [discount, setDiscount] = useState(0);
  const [couponApplied, setCouponApplied] = useState('');
  const [couponLoading, setCouponLoading] = useState(false);

  const deliveryCharge = cartTotal >= 499 ? 0 : 49;
  const finalTotal = cartTotal + deliveryCharge - discount;

  const handleApplyCoupon = async () => {
    if (!coupon.trim()) return;
    setCouponLoading(true);
    try {
      const res = await validateCoupon(coupon, cartTotal);
      setDiscount(res.data.discount);
      setCouponApplied(coupon.toUpperCase());
      toast.success(`Coupon applied! ₹${res.data.discount} off`);
    } catch (err) {
      toast.error(err.response?.data?.error || 'Invalid coupon');
      setDiscount(0);
      setCouponApplied('');
    } finally {
      setCouponLoading(false);
    }
  };

  if (!user) {
    return (
      <div className="max-w-lg mx-auto px-4 py-20 text-center">
        <FiShoppingBag size={64} className="mx-auto text-nykaa-border mb-4" />
        <h2 className="text-2xl font-bold mb-2">Please login to view your bag</h2>
        <p className="text-nykaa-gray mb-6">Sign in to access your saved items</p>
        <Link href="/login" className="btn-primary">Login</Link>
      </div>
    );
  }

  if (cart.length === 0) {
    return (
      <div className="max-w-lg mx-auto px-4 py-20 text-center">
        <div className="text-8xl mb-4">🛍️</div>
        <h2 className="text-2xl font-bold mb-2">Your bag is empty</h2>
        <p className="text-nykaa-gray mb-6">Add some products to get started!</p>
        <Link href="/products" className="btn-primary">Start Shopping</Link>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-6">
      <h1 className="text-2xl font-bold text-nykaa-dark mb-6">My Bag ({cart.length} items)</h1>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Cart items */}
        <div className="lg:col-span-2 space-y-4">
          {cart.map((item) => {
            const images = Array.isArray(item.product.images) ? item.product.images : [];
            const img = images[0] || `https://via.placeholder.com/100x100?text=${encodeURIComponent(item.product.name)}`;

            return (
              <div key={item.id} className="card p-4 flex gap-4">
                <Link href={`/products/${item.product.slug}`}>
                  <img src={img} alt={item.product.name} className="w-24 h-24 object-cover rounded-lg bg-nykaa-light-gray flex-shrink-0" />
                </Link>

                <div className="flex-1 min-w-0">
                  <p className="text-xs text-nykaa-gray">{item.product.brand?.name}</p>
                  <Link href={`/products/${item.product.slug}`}>
                    <h3 className="font-medium text-nykaa-dark line-clamp-2 hover:text-nykaa-pink transition-colors">
                      {item.product.name}
                    </h3>
                  </Link>

                  <div className="flex items-center justify-between mt-3">
                    {/* Quantity */}
                    <div className="flex items-center border border-nykaa-border rounded">
                      <button
                        onClick={() => updateItem(item.product.id, item.quantity - 1)}
                        disabled={loading}
                        className="px-2 py-1 hover:bg-nykaa-light-gray text-lg font-bold"
                      >−</button>
                      <span className="px-3 py-1 font-semibold">{item.quantity}</span>
                      <button
                        onClick={() => updateItem(item.product.id, item.quantity + 1)}
                        disabled={loading || item.quantity >= item.product.stock}
                        className="px-2 py-1 hover:bg-nykaa-light-gray text-lg font-bold"
                      >+</button>
                    </div>

                    {/* Price & remove */}
                    <div className="flex items-center gap-4">
                      <div className="text-right">
                        <p className="font-bold text-nykaa-pink">₹{(item.product.price * item.quantity).toLocaleString()}</p>
                        {item.quantity > 1 && (
                          <p className="text-xs text-nykaa-gray">₹{item.product.price.toLocaleString()} each</p>
                        )}
                      </div>
                      <button
                        onClick={() => removeItem(item.product.id)}
                        className="text-red-400 hover:text-red-600 transition-colors"
                      >
                        <FiTrash2 size={18} />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Order summary */}
        <div className="lg:col-span-1">
          <div className="card p-6 sticky top-24">
            <h2 className="text-lg font-bold text-nykaa-dark mb-4">Order Summary</h2>

            {/* Coupon */}
            <div className="mb-4">
              <div className="flex gap-2">
                <input
                  type="text"
                  placeholder="Enter coupon code"
                  value={coupon}
                  onChange={(e) => setCoupon(e.target.value.toUpperCase())}
                  className="input-field py-2 text-sm flex-1"
                />
                <button
                  onClick={handleApplyCoupon}
                  disabled={couponLoading}
                  className="bg-nykaa-pink text-white px-3 py-2 rounded text-sm font-semibold hover:bg-nykaa-pink-dark disabled:opacity-60"
                >
                  Apply
                </button>
              </div>
              {couponApplied && (
                <div className="mt-2 flex items-center gap-1 text-green-600 text-sm">
                  <FiTag size={14} />
                  <span>Coupon <strong>{couponApplied}</strong> applied!</span>
                </div>
              )}
            </div>

            <hr className="border-nykaa-border mb-4" />

            {/* Price breakdown */}
            <div className="space-y-3 text-sm mb-4">
              <div className="flex justify-between">
                <span className="text-nykaa-gray">Subtotal ({cart.reduce((s, i) => s + i.quantity, 0)} items)</span>
                <span className="font-medium">₹{cartTotal.toLocaleString()}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-nykaa-gray">Delivery</span>
                <span className={deliveryCharge === 0 ? 'text-green-600 font-medium' : 'font-medium'}>
                  {deliveryCharge === 0 ? 'FREE' : `₹${deliveryCharge}`}
                </span>
              </div>
              {discount > 0 && (
                <div className="flex justify-between text-green-600">
                  <span>Coupon Discount</span>
                  <span>- ₹{discount}</span>
                </div>
              )}
            </div>

            <hr className="border-nykaa-border mb-4" />

            <div className="flex justify-between font-bold text-lg mb-6">
              <span>Total</span>
              <span className="text-nykaa-pink">₹{finalTotal.toLocaleString()}</span>
            </div>

            {cartTotal < 499 && (
              <p className="text-xs text-orange-600 bg-orange-50 p-2 rounded mb-4 text-center">
                Add ₹{499 - cartTotal} more for free delivery!
              </p>
            )}

            <Link
              href={`/checkout${couponApplied ? `?coupon=${couponApplied}` : ''}`}
              className="btn-primary w-full block text-center"
            >
              Proceed to Checkout
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
