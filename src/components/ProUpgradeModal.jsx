import { useState } from 'react';
import { CreditCard, Lock, Loader2, Sparkles, Building, CheckCircle2, ShieldCheck } from 'lucide-react';
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
      // Determine PIN to send based on card number or bank transfer selection
      // If card ends in 0000 or if bank transfer is selected, send 0000 (success), else 9999 (failure)
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
      onSuccess(); // Close modal and maybe show a success state
    } catch (error) {
      toast.error(error.message || "Card declined. Please check your details and try again.");
    } finally {
      setLoading(false);
    }
  };

  // Auto-format card number with spaces
  const handleCardNumberChange = (e) => {
    let value = e.target.value.replace(/\D/g, '');
    let formatted = '';
    for (let i = 0; i < value.length; i++) {
      if (i > 0 && i % 4 === 0) formatted += ' ';
      formatted += value[i];
    }
    setCardNumber(formatted.slice(0, 19)); // Max 16 digits + 3 spaces
  };

  // Auto-format expiry MM/YY
  const handleExpiryChange = (e) => {
    let value = e.target.value.replace(/\D/g, '');
    if (value.length >= 2) {
      value = value.slice(0, 2) + '/' + value.slice(2, 4);
    }
    setExpiry(value);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-md p-4">
      <div className="bg-background rounded-3xl shadow-[0_20px_50px_-12px_rgba(0,0,0,0.5)] w-full max-w-[480px] overflow-hidden animate-in fade-in zoom-in-95 duration-300 border border-border">
        
        {/* Header - Premium Look */}
        <div className="bg-gradient-to-br from-zinc-900 to-zinc-800 dark:from-zinc-100 dark:to-zinc-300 p-8 text-white dark:text-zinc-900 text-center relative overflow-hidden">
          <div className="absolute inset-0 opacity-20 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] mix-blend-overlay"></div>
          
          <div className="relative z-10">
            <div className="mx-auto w-16 h-16 bg-white/10 dark:bg-black/10 backdrop-blur-md rounded-2xl flex items-center justify-center mb-4 shadow-lg border border-white/20 dark:border-black/20">
              <Sparkles className="w-8 h-8 text-yellow-400 animate-pulse" />
            </div>
            <h2 className="text-3xl font-extrabold tracking-tight mb-1">Pro Plan</h2>
            <p className="text-zinc-300 dark:text-zinc-600 font-medium text-sm">
              Unlock unlimited Personal Timetable generation
            </p>
          </div>
        </div>

        {/* Content */}
        <div className="p-6 sm:p-8">
          
          {/* Payment Method Selector */}
          <div className="flex gap-2 p-1 bg-muted rounded-xl mb-8">
            <button
              type="button"
              onClick={() => setPaymentMethod('card')}
              className={`flex-1 flex items-center justify-center gap-2 py-2.5 px-4 rounded-lg text-sm font-semibold transition-all duration-200 ${
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
              className={`flex-1 flex items-center justify-center gap-2 py-2.5 px-4 rounded-lg text-sm font-semibold transition-all duration-200 ${
                paymentMethod === 'bank' 
                  ? 'bg-background text-foreground shadow-sm' 
                  : 'text-muted-foreground hover:text-foreground hover:bg-muted-foreground/5'
              }`}
            >
              <Building className="w-4 h-4" /> Bank Transfer
            </button>
          </div>

          <form onSubmit={handleSubmit}>
            {paymentMethod === 'card' ? (
              <div className="space-y-5 animate-in fade-in slide-in-from-right-4 duration-300">
                <div className="bg-blue-500/10 text-blue-600 dark:text-blue-400 p-3 rounded-lg text-xs flex gap-2 items-start">
                  <ShieldCheck className="w-4 h-4 shrink-0 mt-0.5" />
                  <p>This is a secure testing environment. Use any card number ending in <strong>0000</strong> to simulate a successful payment.</p>
                </div>

                <div className="space-y-4">
                  <div className="space-y-1.5">
                    <label className="text-sm font-medium text-foreground">Card Number</label>
                    <div className="relative">
                      <CreditCard className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                      <Input
                        type="text"
                        placeholder="0000 0000 0000 0000"
                        value={cardNumber}
                        onChange={handleCardNumberChange}
                        className="pl-10 font-mono text-base h-11"
                        required
                      />
                    </div>
                  </div>

                  <div className="flex gap-4">
                    <div className="space-y-1.5 flex-1">
                      <label className="text-sm font-medium text-foreground">Expiry</label>
                      <Input
                        type="text"
                        placeholder="MM/YY"
                        value={expiry}
                        onChange={handleExpiryChange}
                        className="font-mono text-base h-11"
                        maxLength={5}
                        required
                      />
                    </div>
                    <div className="space-y-1.5 flex-1">
                      <label className="text-sm font-medium text-foreground">CVC</label>
                      <Input
                        type="text"
                        placeholder="123"
                        value={cvc}
                        onChange={(e) => setCvc(e.target.value.replace(/\D/g, '').slice(0, 4))}
                        className="font-mono text-base h-11"
                        maxLength={4}
                        required
                      />
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-sm font-medium text-foreground">Name on Card</label>
                    <Input
                      type="text"
                      placeholder="John Doe"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      className="h-11"
                      required
                    />
                  </div>
                </div>
              </div>
            ) : (
              <div className="space-y-5 animate-in fade-in slide-in-from-left-4 duration-300">
                <div className="p-5 border border-border rounded-xl bg-accent/30 text-center space-y-3">
                  <Building className="w-8 h-8 mx-auto text-muted-foreground" />
                  <div>
                    <h3 className="font-semibold text-foreground">Direct Bank Transfer</h3>
                    <p className="text-xs text-muted-foreground mt-1">
                      Proceed with checkout to simulate a successful bank transfer request.
                    </p>
                  </div>
                </div>
              </div>
            )}

            <div className="mt-8 flex gap-3">
              <Button
                type="button"
                variant="ghost"
                className="w-1/3 h-12 rounded-xl"
                onClick={onClose}
                disabled={loading}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                className="w-2/3 h-12 rounded-xl text-base font-bold shadow-lg hover:shadow-xl transition-all flex items-center justify-center gap-2 bg-zinc-900 hover:bg-zinc-800 text-white dark:bg-zinc-100 dark:hover:bg-white dark:text-zinc-900"
                disabled={loading || (paymentMethod === 'card' && cardNumber.length < 19)}
              >
                {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Lock className="w-4 h-4" />}
                {loading ? "Processing..." : "Pay $10.00"}
              </Button>
            </div>
          </form>
          
          <div className="mt-6 flex items-center justify-center gap-2 text-xs text-muted-foreground">
            <Lock className="w-3 h-3" />
            Payments are securely processed (Simulation)
          </div>
        </div>
      </div>
    </div>
  );
}
