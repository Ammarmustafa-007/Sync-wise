import { useState } from 'react';
import { createPortal } from 'react-dom';
import { CreditCard, Lock, Loader2, Building, ShieldCheck, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { toast } from 'sonner';
import { api } from '@/lib/api';

export default function ProUpgradeModal({ isOpen, onClose, onSuccess }) {
  const [loading, setLoading] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState('card');
  
  const [cardNumber, setCardNumber] = useState('');
  const [expiry, setExpiry] = useState('');
  const [cvc, setCvc] = useState('');
  const [name, setName] = useState('');

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      let pinToSend = '9999'; 
      if (paymentMethod === 'bank') {
        pinToSend = '0000';
      } else {
        const cleanCard = cardNumber.replace(/\D/g, '');
        if (cleanCard.endsWith('0000')) {
          pinToSend = '0000';
        }
      }

      await api.requestProUpgrade({ pin: pinToSend });
      toast.success("Payment processed successfully. Request sent to admin for review.");
      onSuccess(); 
    } catch (error) {
      toast.error(error.message || "Card declined. Please check your details and try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleCardNumberChange = (e) => {
    let value = e.target.value.replace(/\D/g, '');
    let formatted = '';
    for (let i = 0; i < value.length; i++) {
      if (i > 0 && i % 4 === 0) formatted += ' ';
      formatted += value[i];
    }
    setCardNumber(formatted.slice(0, 19)); 
  };

  const handleExpiryChange = (e) => {
    let value = e.target.value.replace(/\D/g, '');
    if (value.length >= 2) {
      value = value.slice(0, 2) + '/' + value.slice(2, 4);
    }
    setExpiry(value);
  };

  const modalContent = (
    <div className="fixed inset-0 z-[9999] bg-black/40 backdrop-blur-sm overflow-y-auto">
      {/* Container to center the modal and allow scrolling if screen is too small */}
      <div className="min-h-full flex items-center justify-center p-4 py-8">
        <div className="bg-background rounded-2xl shadow-xl w-full max-w-[420px] animate-in fade-in zoom-in-95 duration-200 border border-border relative">
          
          {/* Close Button */}
          <button 
            onClick={onClose}
            className="absolute top-4 right-4 p-1 rounded-md text-muted-foreground hover:bg-muted transition-colors"
          >
            <X className="w-5 h-5" />
          </button>

          {/* Clean Header */}
          <div className="px-6 pt-8 pb-4">
            <h2 className="text-xl font-bold text-foreground">Upgrade to Pro</h2>
            <p className="text-sm text-muted-foreground mt-1">
              Get 500 semester tokens and regenerate your timetable up to five times.
            </p>
          </div>

          <div className="px-6 pb-6">
            <div className="mb-6 rounded-xl border border-amber-600 bg-amber-400 p-4 text-sm text-slate-950 shadow-sm">
              <div className="font-bold">Built for live enrollment pressure</div>
              <p className="mt-1 leading-relaxed">
                If a seat gets booked or a section changes, Pro lets you regenerate quickly with different selections instead of being stuck with one free attempt.
              </p>
            </div>
            
            {/* Tabs */}
            <div className="flex p-1 bg-muted rounded-lg mb-6">
              <button
                type="button"
                onClick={() => setPaymentMethod('card')}
                className={`flex-1 flex items-center justify-center gap-2 py-1.5 px-3 rounded-md text-sm font-medium transition-all ${
                  paymentMethod === 'card' 
                    ? 'bg-background text-foreground shadow-sm' 
                    : 'text-muted-foreground hover:text-foreground'
                }`}
              >
                <CreditCard className="w-4 h-4" /> Card
              </button>
              <button
                type="button"
                onClick={() => setPaymentMethod('bank')}
                className={`flex-1 flex items-center justify-center gap-2 py-1.5 px-3 rounded-md text-sm font-medium transition-all ${
                  paymentMethod === 'bank' 
                    ? 'bg-background text-foreground shadow-sm' 
                    : 'text-muted-foreground hover:text-foreground'
                }`}
              >
                <Building className="w-4 h-4" /> Bank
              </button>
            </div>

            <form onSubmit={handleSubmit}>
              {paymentMethod === 'card' ? (
                <div className="space-y-4 animate-in fade-in">
                  
                  <div className="bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-400 p-2.5 rounded-md text-[13px] flex gap-2 items-start leading-tight">
                    <ShieldCheck className="w-4 h-4 shrink-0 mt-0.5" />
                    <p>Testing environment. Use card ending in <strong>0000</strong> to approve.</p>
                  </div>

                  <div className="space-y-3">
                    {/* Card Number */}
                    <div>
                      <label className="block text-[13px] font-medium text-foreground mb-1">Card number</label>
                      <div className="relative">
                        <CreditCard className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                        <Input
                          type="text"
                          placeholder="0000 0000 0000 0000"
                          value={cardNumber}
                          onChange={handleCardNumberChange}
                          className="pl-9 h-10 font-mono text-sm"
                          required
                        />
                      </div>
                    </div>

                    <div className="flex gap-3">
                      <div className="flex-1">
                        <label className="block text-[13px] font-medium text-foreground mb-1">Expiration</label>
                        <Input
                          type="text"
                          placeholder="MM/YY"
                          value={expiry}
                          onChange={handleExpiryChange}
                          className="h-10 font-mono text-sm"
                          maxLength={5}
                          required
                        />
                      </div>
                      <div className="flex-1">
                        <label className="block text-[13px] font-medium text-foreground mb-1">CVC</label>
                        <Input
                          type="text"
                          placeholder="123"
                          value={cvc}
                          onChange={(e) => setCvc(e.target.value.replace(/\D/g, '').slice(0, 4))}
                          className="h-10 font-mono text-sm"
                          maxLength={4}
                          required
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-[13px] font-medium text-foreground mb-1">Name on card</label>
                      <Input
                        type="text"
                        placeholder="John Doe"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        className="h-10 text-sm"
                        required
                      />
                    </div>
                  </div>
                </div>
              ) : (
                <div className="space-y-4 animate-in fade-in text-center p-6 bg-muted/50 rounded-lg border border-border/50">
                  <Building className="w-8 h-8 mx-auto text-muted-foreground mb-2" />
                  <h3 className="font-medium text-foreground text-sm">Direct Bank Transfer</h3>
                  <p className="text-[13px] text-muted-foreground">
                    Click pay to simulate a successful bank transfer.
                  </p>
                </div>
              )}

              <Button
                type="submit"
                className="w-full mt-6 h-11 bg-zinc-900 hover:bg-zinc-800 text-white font-medium flex items-center justify-center gap-2 transition-all"
                disabled={loading || (paymentMethod === 'card' && cardNumber.length < 19)}
              >
                {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Lock className="w-3.5 h-3.5" />}
                {loading ? "Processing..." : "Pay $10.00 and request Pro"}
              </Button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );

  return typeof document !== 'undefined' ? createPortal(modalContent, document.body) : modalContent;
}
