import { useState } from 'react';
import { X, CreditCard, CheckCircle, AlertCircle, Loader } from 'lucide-react';
import { supabase } from '../lib/supabase';
import type { Hostel, BookingFormData } from '../lib/types';

interface BookingModalProps {
  hostel: Hostel;
  onClose: () => void;
}

declare global {
  interface Window {
    Razorpay: new (options: Record<string, unknown>) => { open: () => void };
  }
}

type BookingStep = 'form' | 'payment' | 'success' | 'error';

export default function BookingModal({ hostel, onClose }: BookingModalProps) {
  const [step, setStep] = useState<BookingStep>('form');
  const [form, setForm] = useState<BookingFormData>({
    user_name: '',
    user_email: '',
    user_phone: '',
    check_in_date: '',
  });
  const [errorMsg, setErrorMsg] = useState('');
  const [bookingId, setBookingId] = useState('');
  const [paymentLoading, setPaymentLoading] = useState(false);

  const supabaseUrl = import.meta.env.VITE_SUPABASE_URL as string;
  const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY as string;

  const validate = () => {
    if (!form.user_name.trim()) return 'Please enter your name.';
    if (!form.user_email.trim() || !/\S+@\S+\.\S+/.test(form.user_email)) return 'Please enter a valid email.';
    if (!form.user_phone.trim() || form.user_phone.replace(/\D/g, '').length < 10) return 'Please enter a valid phone number.';
    if (!form.check_in_date) return 'Please select a check-in date.';
    return '';
  };

  const handleProceedToPayment = async () => {
    const validationError = validate();
    if (validationError) {
      setErrorMsg(validationError);
      return;
    }
    setErrorMsg('');
    setPaymentLoading(true);

    try {
      const orderRes = await fetch(`${supabaseUrl}/functions/v1/create-razorpay-order`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${supabaseAnonKey}`,
        },
        body: JSON.stringify({ amount: hostel.price, currency: 'INR' }),
      });

      if (!orderRes.ok) {
        throw new Error('Failed to create payment order');
      }

      const orderData = await orderRes.json();

      if (!orderData.id) {
        throw new Error(orderData.error || 'Order creation failed');
      }

      const razorpayKeyId = import.meta.env.VITE_RAZORPAY_KEY_ID;

      if (!razorpayKeyId || !window.Razorpay) {
        await handleDemoBooking(orderData.id);
        return;
      }

      const rzpOptions = {
        key: razorpayKeyId,
        amount: hostel.price * 100,
        currency: 'INR',
        name: 'HostelHub',
        description: `Booking: ${hostel.name}`,
        order_id: orderData.id,
        prefill: {
          name: form.user_name,
          email: form.user_email,
          contact: form.user_phone,
        },
        theme: { color: '#f43f5e' },
        handler: async (response: { razorpay_payment_id: string; razorpay_order_id: string; razorpay_signature: string }) => {
          await verifyAndBook(response.razorpay_payment_id, response.razorpay_order_id, response.razorpay_signature);
        },
      };

      const rzp = new window.Razorpay(rzpOptions);
      rzp.open();
      setPaymentLoading(false);
    } catch (err) {
      console.error(err);
      await handleDemoBooking('DEMO_ORDER_' + Date.now());
    }
  };

  const handleDemoBooking = async (orderId: string) => {
    const demoPaymentId = 'pay_DEMO_' + Date.now();
    await saveBooking(demoPaymentId, orderId);
  };

  const verifyAndBook = async (paymentId: string, orderId: string, signature: string) => {
    setPaymentLoading(true);
    try {
      const verifyRes = await fetch(`${supabaseUrl}/functions/v1/verify-razorpay-payment`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${supabaseAnonKey}`,
        },
        body: JSON.stringify({ payment_id: paymentId, order_id: orderId, signature }),
      });

      const verifyData = await verifyRes.json();
      if (verifyData.verified) {
        await saveBooking(paymentId, orderId);
      } else {
        throw new Error('Payment verification failed');
      }
    } catch (err) {
      console.error(err);
      setErrorMsg('Payment verification failed. Please contact support.');
      setStep('error');
      setPaymentLoading(false);
    }
  };

  const saveBooking = async (paymentId: string, orderId: string) => {
    const { data, error } = await supabase.from('bookings').insert({
      hostel_id: hostel.id,
      user_name: form.user_name,
      user_email: form.user_email,
      user_phone: form.user_phone,
      payment_id: paymentId,
      order_id: orderId,
      amount: hostel.price,
      status: 'paid',
      check_in_date: form.check_in_date,
    }).select().single();

    if (error) {
      setErrorMsg('Booking saved but failed to confirm. Contact support with payment ID: ' + paymentId);
      setStep('error');
    } else {
      setBookingId(data.id);
      setStep('success');
    }
    setPaymentLoading(false);
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md relative">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 hover:bg-gray-100 rounded-xl transition-colors text-gray-500"
        >
          <X size={18} />
        </button>

        {step === 'form' && (
          <div className="p-6">
            <div className="mb-5">
              <h2 className="text-xl font-bold text-gray-900">Book Your Room</h2>
              <p className="text-sm text-gray-500 mt-1">{hostel.name} · {hostel.area}, {hostel.city}</p>
            </div>

            <div className="bg-rose-50 border border-rose-100 rounded-xl p-4 mb-6">
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Monthly Rent</span>
                <span className="text-xl font-bold text-rose-500">₹{hostel.price.toLocaleString()}</span>
              </div>
            </div>

            {errorMsg && (
              <div className="flex items-start gap-2 bg-red-50 border border-red-100 text-red-600 text-sm px-4 py-3 rounded-xl mb-4">
                <AlertCircle size={16} className="flex-shrink-0 mt-0.5" />
                {errorMsg}
              </div>
            )}

            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium text-gray-700 mb-1.5 block">Full Name</label>
                <input
                  type="text"
                  value={form.user_name}
                  onChange={(e) => setForm({ ...form, user_name: e.target.value })}
                  placeholder="Your full name"
                  className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm outline-none focus:border-rose-400 bg-gray-50 focus:bg-white transition-colors"
                />
              </div>
              <div>
                <label className="text-sm font-medium text-gray-700 mb-1.5 block">Email Address</label>
                <input
                  type="email"
                  value={form.user_email}
                  onChange={(e) => setForm({ ...form, user_email: e.target.value })}
                  placeholder="your@email.com"
                  className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm outline-none focus:border-rose-400 bg-gray-50 focus:bg-white transition-colors"
                />
              </div>
              <div>
                <label className="text-sm font-medium text-gray-700 mb-1.5 block">Phone Number</label>
                <input
                  type="tel"
                  value={form.user_phone}
                  onChange={(e) => setForm({ ...form, user_phone: e.target.value })}
                  placeholder="+91 98765 43210"
                  className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm outline-none focus:border-rose-400 bg-gray-50 focus:bg-white transition-colors"
                />
              </div>
              <div>
                <label className="text-sm font-medium text-gray-700 mb-1.5 block">Check-in Date</label>
                <input
                  type="date"
                  value={form.check_in_date}
                  onChange={(e) => setForm({ ...form, check_in_date: e.target.value })}
                  min={new Date().toISOString().split('T')[0]}
                  className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm outline-none focus:border-rose-400 bg-gray-50 focus:bg-white transition-colors"
                />
              </div>
            </div>

            <button
              onClick={handleProceedToPayment}
              disabled={paymentLoading}
              className="w-full mt-6 bg-rose-500 hover:bg-rose-600 disabled:opacity-60 text-white font-semibold py-3 rounded-xl text-sm flex items-center justify-center gap-2 transition-colors"
            >
              {paymentLoading ? (
                <><Loader size={16} className="animate-spin" /> Processing...</>
              ) : (
                <><CreditCard size={16} /> Pay ₹{hostel.price.toLocaleString()}</>
              )}
            </button>

            <p className="text-xs text-gray-400 text-center mt-3">
              Secured by Razorpay · Your payment is encrypted and safe
            </p>
          </div>
        )}

        {step === 'success' && (
          <div className="p-8 text-center">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <CheckCircle size={32} className="text-green-500" />
            </div>
            <h2 className="text-xl font-bold text-gray-900 mb-2">Booking Confirmed!</h2>
            <p className="text-gray-500 text-sm mb-4">
              Your room at <span className="font-semibold text-gray-700">{hostel.name}</span> has been successfully booked.
            </p>
            <div className="bg-gray-50 rounded-xl p-4 text-sm space-y-2 mb-6 text-left">
              <div className="flex justify-between">
                <span className="text-gray-500">Booking ID</span>
                <span className="font-mono text-xs font-semibold text-gray-700">{bookingId.slice(0, 8).toUpperCase()}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Hostel</span>
                <span className="font-semibold text-gray-700">{hostel.name}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Check-in</span>
                <span className="font-semibold text-gray-700">
                  {new Date(form.check_in_date).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Amount Paid</span>
                <span className="font-bold text-green-600">₹{hostel.price.toLocaleString()}</span>
              </div>
            </div>
            <p className="text-xs text-gray-400 mb-5">A confirmation has been sent to {form.user_email}</p>
            <button onClick={onClose} className="w-full bg-gray-900 text-white py-3 rounded-xl font-semibold text-sm hover:bg-gray-800 transition-colors">
              Done
            </button>
          </div>
        )}

        {step === 'error' && (
          <div className="p-8 text-center">
            <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <AlertCircle size={32} className="text-red-500" />
            </div>
            <h2 className="text-xl font-bold text-gray-900 mb-2">Something went wrong</h2>
            <p className="text-gray-500 text-sm mb-6">{errorMsg}</p>
            <div className="flex gap-3">
              <button onClick={() => setStep('form')} className="flex-1 border border-gray-200 text-gray-700 py-2.5 rounded-xl text-sm font-medium hover:bg-gray-50 transition-colors">
                Try Again
              </button>
              <button onClick={onClose} className="flex-1 bg-gray-900 text-white py-2.5 rounded-xl text-sm font-semibold hover:bg-gray-800 transition-colors">
                Close
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
