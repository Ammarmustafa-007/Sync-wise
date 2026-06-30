import { useState } from 'react';
import { CreditCard, Lock, Loader2, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { toast } from 'sonner';
import { api } from '@/lib/api';

export default function ProUpgradeModal({ isOpen, onClose, onSuccess }) {
  const [pin, setPin] = useState('');
  const [loading, setLoading] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await api.requestProUpgrade({ pin });
      toast.success("Payment is processed. Your request is sent to admin for review.", {
        duration: 5000,
      });
      onSuccess(); // Close modal and maybe show a success state
    } catch (error) {
      toast.error(error.message || "Failed to process payment");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
      <div className="bg-background rounded-2xl shadow-2xl w-full max-w-md overflow-hidden animate-in fade-in zoom-in-95 duration-200 border border-border">
        {/* Header */}
        <div className="bg-primary p-6 text-primary-foreground text-center relative overflow-hidden">
          <div className="absolute top-0 left-0 w-full h-full opacity-10 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')]"></div>
          <Sparkles className="w-12 h-12 mx-auto mb-4 text-primary-foreground animate-pulse" />
          <h2 className="text-2xl font-bold relative z-10">Upgrade to Pro</h2>
          <p className="text-primary-foreground/90 mt-2 relative z-10">
            Unlock the Personal Timetable PDF feature!
          </p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6">
          <div className="mb-6">
            <label className="block text-sm font-medium text-foreground mb-2 flex items-center gap-2">
              <CreditCard className="w-4 h-4 text-primary" />
              Secure Payment PIN
            </label>
            <p className="text-xs text-muted-foreground mb-3">
              This is a secure payment simulation. Please enter <strong>0000</strong> to test the upgrade flow.
            </p>
            <Input
              type="text"
              placeholder="Enter PIN (0000)"
              value={pin}
              onChange={(e) => setPin(e.target.value)}
              className="text-center tracking-widest text-lg font-mono"
              maxLength={4}
              required
            />
          </div>

          <div className="flex gap-3">
            <Button
              type="button"
              variant="outline"
              className="flex-1"
              onClick={onClose}
              disabled={loading}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              className="flex-1 flex items-center gap-2"
              disabled={loading || pin.length < 4}
            >
              {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Lock className="w-4 h-4" />}
              {loading ? "Processing..." : "Pay Securely"}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
