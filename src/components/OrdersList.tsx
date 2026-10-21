import React from 'react';
import { 
  Package, 
  Clock, 
  CheckCircle2, 
  Truck, 
  Store, 
  ChevronRight, 
  ShoppingBag,
  ArrowRight
} from 'lucide-react';
import { Order, Profile, OrderStatus } from '../types/pharmacy.ts';
import { pharmacyStore } from '../services/store.ts';

interface OrdersListProps {
  orders: Order[];
  currentUser: Profile | null;
}

export const OrdersList: React.FC<OrdersListProps> = ({ orders, currentUser }) => {
  const isStaff = currentUser?.role === 'pharmacist' || currentUser?.role === 'admin';

  const handleStatusChange = (orderId: string, nextStatus: OrderStatus) => {
    pharmacyStore.updateOrderStatus(orderId, nextStatus);
  };

  const getStatusBadge = (status: OrderStatus) => {
    switch (status) {
      case 'ready_for_pickup':
        return <span className="bg-emerald-100 text-emerald-800 text-xs px-2.5 py-0.5 rounded-full font-bold">Ready for Pickup</span>;
      case 'dispatched':
      case 'delivered':
        return <span className="bg-sky-100 text-sky-800 text-xs px-2.5 py-0.5 rounded-full font-bold">Delivered</span>;
      case 'preparing':
        return <span className="bg-amber-100 text-amber-800 text-xs px-2.5 py-0.5 rounded-full font-bold">Preparing in Pharmacy</span>;
      case 'approved':
        return <span className="bg-teal-100 text-teal-800 text-xs px-2.5 py-0.5 rounded-full font-bold">Approved</span>;
      default:
        return <span className="bg-slate-100 text-slate-700 text-xs px-2.5 py-0.5 rounded-full font-bold">Pending Review</span>;
    }
  };

  return (
    <div className="space-y-6">
      {/* Header Bar */}
      <div className="flex items-center justify-between bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-xl font-bold text-slate-900">Pharmacy Orders & Fulfillment</h2>
            <span className="text-xs bg-teal-100 text-teal-800 font-bold px-2 py-0.5 rounded-full">
              {orders.length} Orders
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Real-time dispensing status, package tracking, and order history.
          </p>
        </div>
      </div>

      {orders.length === 0 ? (
        <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center space-y-3">
          <ShoppingBag className="w-12 h-12 text-slate-300 mx-auto" />
          <h3 className="text-sm font-bold text-slate-800">No Pharmacy Orders Placed</h3>
          <p className="text-xs text-slate-500 max-w-sm mx-auto">
            Add medications to your pharmacy cart to place a pickup or home delivery order.
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {orders.map((ord) => (
            <div
              key={ord.id}
              className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm space-y-4"
            >
              {/* Order Header */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-3 border-b border-slate-100 gap-2">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-xl bg-teal-50 border border-teal-200 flex items-center justify-center text-teal-700">
                    <Package className="w-4 h-4" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-sm font-bold text-slate-900">Order #{ord.id}</span>
                      {getStatusBadge(ord.status)}
                    </div>
                    <p className="text-[11px] text-slate-500">
                      Placed on {new Date(ord.created_at).toLocaleDateString()} • {ord.patient_name || 'Patient'}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2 text-xs font-semibold text-slate-700">
                  {ord.delivery_method === 'home_delivery' ? (
                    <span className="flex items-center gap-1.5 bg-sky-50 text-sky-800 px-2.5 py-1 rounded-lg border border-sky-100">
                      <Truck className="w-3.5 h-3.5 text-sky-600" />
                      Home Delivery
                    </span>
                  ) : (
                    <span className="flex items-center gap-1.5 bg-emerald-50 text-emerald-800 px-2.5 py-1 rounded-lg border border-emerald-100">
                      <Store className="w-3.5 h-3.5 text-emerald-600" />
                      In-Store Pharmacy Pickup
                    </span>
                  )}
                  <span className="text-base font-extrabold text-teal-800 ml-2">
                    ${ord.total_amount.toFixed(2)}
                  </span>
                </div>
              </div>

              {/* Items Table */}
              <div className="bg-slate-50 rounded-xl p-3 border border-slate-100">
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-2">
                  Prescription & Pharmaceutical Items
                </span>
                <div className="divide-y divide-slate-200/60">
                  {ord.items.map((item, idx) => (
                    <div key={idx} className="py-2 flex items-center justify-between text-xs">
                      <div>
                        <span className="font-semibold text-slate-900">{item.medication_name}</span>
                        <span className="text-[11px] text-slate-500 ml-2">
                          ({item.dosage_form} • {item.strength}) x {item.quantity}
                        </span>
                      </div>
                      <span className="font-bold text-slate-800">${item.subtotal.toFixed(2)}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Notes & Delivery Address */}
              {(ord.delivery_address || ord.notes) && (
                <div className="text-xs text-slate-600 space-y-1">
                  {ord.delivery_address && (
                    <p>
                      <strong className="text-slate-700">Delivery Address:</strong> {ord.delivery_address}
                    </p>
                  )}
                  {ord.notes && (
                    <p className="text-slate-500 italic">
                      <strong className="text-slate-700">Instructions:</strong> {ord.notes}
                    </p>
                  )}
                </div>
              )}

              {/* Pharmacist Status Advancement Controls */}
              {isStaff && (
                <div className="pt-3 border-t border-slate-100 flex flex-wrap items-center justify-between gap-2">
                  <span className="text-[11px] font-semibold text-purple-800 bg-purple-50 px-2 py-0.5 rounded border border-purple-200">
                    Pharmacist Action Controls
                  </span>
                  <div className="flex items-center gap-1.5">
                    {ord.status === 'pending' && (
                      <button
                        onClick={() => handleStatusChange(ord.id, 'preparing')}
                        className="px-3 py-1 bg-teal-600 hover:bg-teal-700 text-white rounded-lg text-xs font-semibold"
                      >
                        Prepare Order
                      </button>
                    )}
                    {ord.status === 'preparing' && (
                      <button
                        onClick={() => handleStatusChange(ord.id, 'ready_for_pickup')}
                        className="px-3 py-1 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-semibold"
                      >
                        Mark Ready for Pickup
                      </button>
                    )}
                    {ord.status === 'ready_for_pickup' && (
                      <button
                        onClick={() => handleStatusChange(ord.id, 'delivered')}
                        className="px-3 py-1 bg-sky-600 hover:bg-sky-700 text-white rounded-lg text-xs font-semibold"
                      >
                        Mark Dispensed / Picked Up
                      </button>
                    )}
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
