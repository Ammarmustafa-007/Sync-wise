import { useState } from 'react';
import { CreditCard, Lock, Loader2, Building, ShieldCheck } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { toast } from 'sonner';
import { api } from '@/lib/api';

export default function ProUpgradeModal({ isOpen, onClose, onSuccess }) {
  const [loading, setLoading] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState('card'); // 'card' or 'bank'
  
  // Card Form State
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
      toast.success("Payment processed successfully. Request sent to admin for review.", {
        duration: 5000,
      });
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

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
      <div className="bg-background rounded-2xl shadow-2xl w-full max-w-[440px] max-h-[90vh] flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-200 border border-border">
        
        {/* Stripe-style Header */}
        <div className="bg-indigo-600 p-6 text-white text-center shrink-0">
          <div className="mx-auto w-12 h-12 bg-white/20 rounded-full flex items-center justify-center mb-3">
            <CreditCard className="w-6 h-6 text-white" />
          </div>
          <h2 className="text-2xl font-bold tracking-tight">Upgrade to Pro</h2>
          <p className="text-indigo-100 font-medium text-sm mt-1">
            Unlock the Personal Timetable Generator
          </p>
        </div>

        {/* Scrollable Content with min-h-0 to fix flex overflow */}
        <div className="p-5 overflow-y-auto min-h-0 flex-1">
          
          {/* Payment Method Selector */}
          <div className="flex gap-2 p-1 bg-muted rounded-xl mb-5">
            <button
              type="button"
              onClick={() => setPaymentMethod('card')}
              className={`flex-1 flex items-center justify-center gap-2 py-2 px-3 rounded-lg text-sm font-semibold transition-all duration-200 ${
                paymentMethod === 'card' 
                  ? 'bg-background text-foreground shadow-sm' 
                  : 'text-muted-foreground hover:text-foreground hover:bg-muted-foreground/5'
              }`}
            >
              <CreditCard className="w-4 h-4" /> Card
            </button>
            <button
              type="button"
              onClick={() => setPaymentMethod('bank')}
              className={`flex-1 flex items-center justify-center gap-2 py-2 px-3 rounded-lg text-sm font-semibold transition-all duration-200 ${
                paymentMethod === 'bank' 
                  ? 'bg-background text-foreground shadow-sm' 
                  : 'text-muted-foreground hover:text-foreground hover:bg-muted-foreground/5'
              }`}
            >
              <Building className="w-4 h-4" /> Bank
            </button>
          </div>

          <form onSubmit={handleSubmit} className="flex flex-col h-full">
            <div className="flex-1">
              {paymentMethod === 'card' ? (
                <div className="space-y-4 animate-in fade-in slide-in-from-right-4 duration-300">
                  <div className="bg-blue-50 text-blue-700 dark:bg-blue-500/10 dark:text-blue-400 p-3 rounded-lg text-xs flex gap-2 items-start border border-blue-200 dark:border-blue-500/20">
                    <ShieldCheck className="w-4 h-4 shrink-0 mt-0.5" />
                    <p>Testing environment. Use any card ending in <strong>0000</strong> to approve.</p>
                  </div>

                  <div className="space-y-3">
                    <div className="space-y-1">
                      <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Card Number</label>
                      <div className="relative">
                        <CreditCard className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                        <Input
                          type="text"
                          placeholder="0000 0000 0000 0000"
                          value={cardNumber}
                          onChange={handleCardNumberChange}
                          className="pl-9 font-mono text-sm h-10"
                          required
                        />
                      </div>
                    </div>

                    <div className="flex gap-3">
                      <div className="space-y-1 flex-1">
                        <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Expiry</label>
                        <Input
                          type="text"
                          placeholder="MM/YY"
                          value={expiry}
                          onChange={handleExpiryChange}
                          className="font-mono text-sm h-10"
                          maxLength={5}
                          required
                        />
                      </div>
                      <div className="space-y-1 flex-1">
                        <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">CVC</label>
                        <Input
                          type="text"
                          placeholder="123"
                          value={cvc}
                          onChange={(e) => setCvc(e.target.value.replace(/\D/g, '').slice(0, 4))}
                          className="font-mono text-sm h-10"
                          maxLength={4}
                          required
                        />
                      </div>
                    </div>

                    <div className="space-y-1">
                      <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Name on Card</label>
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
                <div className="space-y-4 animate-in fade-in slide-in-from-left-4 duration-300">
                  <div className="p-6 border border-border rounded-xl bg-muted/30 text-center space-y-2">
                    <Building className="w-8 h-8 mx-auto text-indigo-500" />
                    <div>
                      <h3 className="font-semibold text-foreground">Direct Bank Transfer</h3>
                      <p className="text-sm text-muted-foreground mt-1">
                        Simulate a successful bank transfer checkout.
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </div>

            <div className="mt-6 pt-4 border-t flex gap-3 shrink-0">
              <Button
                type="button"
                variant="outline"
                className="w-1/3 h-11 rounded-lg"
                onClick={onClose}
                disabled={loading}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                className="w-2/3 h-11 rounded-lg text-sm font-bold shadow-md hover:shadow-lg transition-all flex items-center justify-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white"
                disabled={loading || (paymentMethod === 'card' && cardNumber.length < 19)}
              >
                {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Lock className="w-3.5 h-3.5" />}
                {loading ? "Processing..." : "Pay $10.00"}
              </Button>
            </div>
          </form>
          
        </div>
      </div>
    </div>
  );
}
