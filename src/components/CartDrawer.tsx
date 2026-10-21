import React, { useState } from 'react';
import { 
  X, 
  ShoppingCart, 
  Trash2, 
  Plus, 
  Minus, 
  ArrowRight, 
  CheckCircle2, 
  Truck, 
  Store, 
  AlertCircle,
  FileCheck 
} from 'lucide-react';
import { pharmacyStore } from '../services/store.ts';
import { OrderItem } from '../types/pharmacy.ts';

interface CartDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  onOrderSuccess: () => void;
}

export const CartDrawer: React.FC<CartDrawerProps> = ({ isOpen, onClose, onOrderSuccess }) => {
  const cart = pharmacyStore.getCart();
  const currentUser = pharmacyStore.getCurrentUser();
  const [deliveryMethod, setDeliveryMethod] = useState<'pickup' | 'home_delivery'>('pickup');
  const [address, setAddress] = useState('742 Evergreen Terrace, Springfield, OR 97477');
  const [notes, setNotes] = useState('');
  const [placingOrder, setPlacingOrder] = useState(false);
  const [orderComplete, setOrderComplete] = useState(false);

  if (!isOpen) return null;

  const totalAmount = cart.reduce((sum, item) => sum + item.subtotal, 0);

  const handleCheckout = () => {
    if (cart.length === 0) return;
    setPlacingOrder(true);

    setTimeout(() => {
      pharmacyStore.createOrder({
        delivery_method: deliveryMethod,
        delivery_address: deliveryMethod === 'home_delivery' ? address : undefined,
        notes: notes || undefined
      });
      setPlacingOrder(false);
      setOrderComplete(true);
      setTimeout(() => {
        setOrderComplete(false);
        onOrderSuccess();
        onClose();
      }, 1800);
    }, 700);
  };

  return (
    <div className="fixed inset-0 z-50 overflow-hidden">
      <div 
        className="absolute inset-0 bg-slate-900/50 backdrop-blur-xs transition-opacity" 
        onClick={onClose} 
      />

      <div className="fixed inset-y-0 right-0 max-w-full flex pl-10">
        <div className="w-screen max-w-md bg-white shadow-2xl flex flex-col">
          {/* Header */}
          <div className="px-6 py-4 bg-slate-900 text-white flex items-center justify-between">
            <div className="flex items-center gap-2">
              <ShoppingCart className="w-5 h-5 text-teal-400" />
              <h3 className="font-bold text-base">Pharmacy Cart & Order</h3>
              <span className="text-xs bg-teal-500/20 text-teal-300 px-2 py-0.5 rounded-full border border-teal-500/30">
                {cart.length} item{cart.length === 1 ? '' : 's'}
              </span>
            </div>
            <button
              onClick={onClose}
              className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Cart Items */}
          <div className="flex-1 overflow-y-auto p-6 space-y-4">
            {orderComplete ? (
              <div className="text-center py-16 space-y-3">
                <div className="w-14 h-14 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto animate-bounce">
                  <CheckCircle2 className="w-8 h-8" />
                </div>
                <h4 className="text-lg font-bold text-slate-900">Order Placed Successfully!</h4>
                <p className="text-xs text-slate-600 max-w-xs mx-auto">
                  Your medication order has been sent to the pharmacy fulfillment system. You will receive real-time status updates.
                </p>
              </div>
            ) : cart.length === 0 ? (
              <div className="text-center py-16 space-y-3 text-slate-400">
                <ShoppingCart className="w-12 h-12 mx-auto stroke-1" />
                <p className="text-sm font-semibold text-slate-600">Your pharmacy cart is empty</p>
                <p className="text-xs">Browse our clinical catalog and add over-the-counter or prescription medications.</p>
              </div>
            ) : (
              <>
                <div className="space-y-3">
                  {cart.map((item) => (
                    <div
                      key={item.id}
                      className="flex items-center justify-between p-3 border border-slate-200 rounded-xl bg-slate-50/50"
                    >
                      <div className="space-y-0.5 max-w-[190px]">
                        <p className="text-xs font-bold text-slate-900 truncate">{item.medication_name}</p>
                        <p className="text-[11px] text-slate-500">
                          {item.dosage_form} • {item.strength}
                        </p>
                        <p className="text-xs font-bold text-teal-700">
                          ${item.unit_price.toFixed(2)} each
                        </p>
                      </div>

                      <div className="flex items-center gap-2">
                        <div className="flex items-center border border-slate-200 rounded-lg bg-white overflow-hidden">
                          <button
                            onClick={() => pharmacyStore.updateCartQuantity(item.medication_id, item.quantity - 1)}
                            className="p-1 text-slate-500 hover:bg-slate-100"
                          >
                            <Minus className="w-3 h-3" />
                          </button>
                          <span className="px-2 text-xs font-semibold text-slate-800">{item.quantity}</span>
                          <button
                            onClick={() => pharmacyStore.updateCartQuantity(item.medication_id, item.quantity + 1)}
                            className="p-1 text-slate-500 hover:bg-slate-100"
                          >
                            <Plus className="w-3 h-3" />
                          </button>
                        </div>
                        <button
                          onClick={() => pharmacyStore.updateCartQuantity(item.medication_id, 0)}
                          className="p-1 text-slate-400 hover:text-rose-600 transition-colors"
                          title="Remove item"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Fulfillment Method */}
                <div className="pt-4 border-t border-slate-200 space-y-3">
                  <span className="text-xs font-bold text-slate-700 uppercase tracking-wider block">
                    Fulfillment Method
                  </span>
                  <div className="grid grid-cols-2 gap-2 text-xs">
                    <button
                      type="button"
                      onClick={() => setDeliveryMethod('pickup')}
                      className={`p-2.5 rounded-xl border flex flex-col items-center justify-center gap-1.5 transition-all ${
                        deliveryMethod === 'pickup'
                          ? 'border-teal-600 bg-teal-50 text-teal-900 font-bold'
                          : 'border-slate-200 text-slate-600 hover:bg-slate-50'
                      }`}
                    >
                      <Store className="w-4 h-4 text-teal-600" />
                      <span>Pharmacy Pickup</span>
                      <span className="text-[10px] text-teal-700">Ready in 30 mins (Free)</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => setDeliveryMethod('home_delivery')}
                      className={`p-2.5 rounded-xl border flex flex-col items-center justify-center gap-1.5 transition-all ${
                        deliveryMethod === 'home_delivery'
                          ? 'border-teal-600 bg-teal-50 text-teal-900 font-bold'
                          : 'border-slate-200 text-slate-600 hover:bg-slate-50'
                      }`}
                    >
                      <Truck className="w-4 h-4 text-teal-600" />
                      <span>Home Delivery</span>
                      <span className="text-[10px] text-teal-700">Same-Day Express</span>
                    </button>
                  </div>

                  {deliveryMethod === 'home_delivery' && (
                    <div className="space-y-1">
                      <label className="text-[11px] font-semibold text-slate-600">Delivery Address</label>
                      <input
                        type="text"
                        value={address}
                        onChange={(e) => setAddress(e.target.value)}
                        className="w-full text-xs px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-teal-500"
                        placeholder="Street Address, City, State, ZIP"
                      />
                    </div>
                  )}

                  <div className="space-y-1">
                    <label className="text-[11px] font-semibold text-slate-600">Pharmacist Notes (Optional)</label>
                    <input
                      type="text"
                      value={notes}
                      onChange={(e) => setNotes(e.target.value)}
                      placeholder="e.g. Please include safety cap instructions"
                      className="w-full text-xs px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-teal-500"
                    />
                  </div>
                </div>
              </>
            )}
          </div>

          {/* Footer & Totals */}
          {cart.length > 0 && !orderComplete && (
            <div className="p-6 bg-slate-50 border-t border-slate-200 space-y-3">
              <div className="space-y-1 text-xs">
                <div className="flex justify-between text-slate-600">
                  <span>Subtotal</span>
                  <span>${totalAmount.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-slate-600">
                  <span>Dispensing & Service Fee</span>
                  <span className="text-emerald-700 font-medium">Free</span>
                </div>
                <div className="flex justify-between text-slate-600">
                  <span>Delivery</span>
                  <span>{deliveryMethod === 'home_delivery' ? '$4.99' : '$0.00'}</span>
                </div>
                <div className="flex justify-between text-sm font-bold text-slate-900 pt-2 border-t border-slate-200">
                  <span>Total Due</span>
                  <span className="text-teal-700">
                    ${(totalAmount + (deliveryMethod === 'home_delivery' ? 4.99 : 0)).toFixed(2)}
                  </span>
                </div>
              </div>

              <button
                onClick={handleCheckout}
                disabled={placingOrder}
                className="w-full bg-teal-600 hover:bg-teal-700 text-white font-bold text-xs py-3 rounded-xl shadow-md transition-colors flex items-center justify-center gap-2 disabled:opacity-50"
              >
                {placingOrder ? (
                  <span>Processing Pharmacy Order...</span>
                ) : (
                  <>
                    <span>Confirm & Place Order</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
