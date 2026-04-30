'use client';
import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { getOrder } from '@/lib/api';
import { useAuth } from '@/context/AuthContext';
import { FiCheck, FiPackage, FiTruck, FiMapPin } from 'react-icons/fi';

const STATUS_STEPS = ['PENDING', 'CONFIRMED', 'PROCESSING', 'SHIPPED', 'DELIVERED'];

export default function OrderDetailPage() {
  const { id } = useParams();
  const { user } = useAuth();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;
    getOrder(id).then((res) => setOrder(res.data)).finally(() => setLoading(false));
  }, [id, user]);

  if (!user) return <div className="text-center py-20"><Link href="/login" className="btn-primary">Login</Link></div>;
  if (loading) return <div className="max-w-4xl mx-auto px-4 py-8"><div className="h-96 bg-gray-200 animate-pulse rounded-lg" /></div>;
  if (!order) return <div className="text-center py-20 text-nykaa-gray">Order not found</div>;

  const stepIdx = STATUS_STEPS.indexOf(order.status);

  return (
    <div className="max-w-4xl mx-auto px-4 py-6">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-nykaa-dark">Order #{order.id}</h1>
        <Link href="/orders" className="text-nykaa-pink text-sm hover:underline">← All Orders</Link>
      </div>

      {/* Status tracker */}
      <div className="card p-6 mb-6">
        <h2 className="font-semibold text-nykaa-dark mb-6">Order Status</h2>
        <div className="flex items-center justify-between">
          {STATUS_STEPS.map((s, i) => (
            <div key={s} className="flex flex-col items-center flex-1">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold mb-2 ${
                i <= stepIdx ? 'bg-nykaa-pink text-white' : 'bg-nykaa-border text-nykaa-gray'
              }`}>
                {i < stepIdx ? <FiCheck size={14} /> : i + 1}
              </div>
              <span className={`text-xs text-center ${i <= stepIdx ? 'text-nykaa-pink font-semibold' : 'text-nykaa-gray'}`}>
                {s.charAt(0) + s.slice(1).toLowerCase()}
              </span>
              {i < STATUS_STEPS.length - 1 && (
                <div className={`absolute w-full h-0.5 top-4 left-1/2 ${i < stepIdx ? 'bg-nykaa-pink' : 'bg-nykaa-border'}`} />
              )}
            </div>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Items */}
        <div className="md:col-span-2 card p-6">
          <h2 className="font-semibold text-nykaa-dark mb-4">Items Ordered</h2>
          <div className="space-y-4">
            {order.items.map((item) => {
              const images = Array.isArray(item.product.images) ? item.product.images : [];
              return (
                <div key={item.id} className="flex gap-4 pb-4 border-b border-nykaa-border last:border-0 last:pb-0">
                  <img src={images[0] || ''} alt="" className="w-16 h-16 object-cover rounded bg-nykaa-light-gray flex-shrink-0" />
                  <div className="flex-1">
                    <Link href={`/products/${item.product.slug}`} className="font-medium hover:text-nykaa-pink">{item.product.name}</Link>
                    <p className="text-xs text-nykaa-gray mt-1">Qty: {item.quantity} × ₹{item.price.toLocaleString()}</p>
                  </div>
                  <p className="font-semibold text-nykaa-pink">₹{(item.price * item.quantity).toLocaleString()}</p>
                </div>
              );
            })}
          </div>
        </div>

        {/* Summary */}
        <div className="space-y-4">
          {/* Price */}
          <div className="card p-5">
            <h3 className="font-semibold mb-3">Price Details</h3>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between"><span className="text-nykaa-gray">Subtotal</span><span>₹{order.subtotal.toLocaleString()}</span></div>
              <div className="flex justify-between"><span className="text-nykaa-gray">Delivery</span><span className={order.deliveryCharge === 0 ? 'text-green-600' : ''}>{order.deliveryCharge === 0 ? 'FREE' : `₹${order.deliveryCharge}`}</span></div>
              {order.discount > 0 && <div className="flex justify-between text-green-600"><span>Discount</span><span>-₹{order.discount}</span></div>}
              <hr className="border-nykaa-border" />
              <div className="flex justify-between font-bold text-base"><span>Total</span><span className="text-nykaa-pink">₹{order.total.toLocaleString()}</span></div>
            </div>
            <p className="text-xs text-nykaa-gray mt-3">Payment: {order.paymentMethod}</p>
          </div>

          {/* Address */}
          {order.address && (
            <div className="card p-5">
              <h3 className="font-semibold mb-3 flex items-center gap-2"><FiMapPin size={14} /> Delivery Address</h3>
              <div className="text-sm text-nykaa-gray">
                <p className="font-medium text-nykaa-dark">{order.address.name}</p>
                <p>{order.address.line1}{order.address.line2 ? `, ${order.address.line2}` : ''}</p>
                <p>{order.address.city}, {order.address.state} - {order.address.pincode}</p>
                <p className="mt-1">📞 {order.address.phone}</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
