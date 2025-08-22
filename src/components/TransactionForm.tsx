import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useAuthStore } from '@/store/authStore';
import { useTransactionStore } from '@/store/transactionStore';
import { useToast } from '@/hooks/use-toast';
import { ArrowLeft, Send, Smartphone } from 'lucide-react';

interface TransactionFormProps {
  onBack: () => void;
  onComplete: () => void;
}

export const TransactionForm = ({ onBack, onComplete }: TransactionFormProps) => {
  const [amount, setAmount] = useState('');
  const [payeeUpi, setPayeeUpi] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const { user, updateBalance } = useAuthStore();
  const { addTransaction } = useTransactionStore();
  const { toast } = useToast();

  const generateAIConfirmation = (amount: number, payeeUpi: string) => {
    // Mock AI confirmation - replace with actual AI service later
    const suggestions = [
      `Payment of ₹${amount} to ${payeeUpi} looks good! Proceed with confidence.`,
      `Transaction verified: ₹${amount} to ${payeeUpi}. All details check out!`,
      `Ready to send ₹${amount} to ${payeeUpi}. Transaction appears legitimate.`,
      `Confirmed: ₹${amount} payment to ${payeeUpi}. Safe to proceed.`
    ];
    return suggestions[Math.floor(Math.random() * suggestions.length)];
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const amountValue = parseFloat(amount);
    
    if (!amountValue || amountValue <= 0) {
      toast({
        title: "Error",
        description: "Please enter a valid amount",
        variant: "destructive"
      });
      return;
    }

    if (!payeeUpi || !payeeUpi.includes('@')) {
      toast({
        title: "Error",
        description: "Please enter a valid UPI ID",
        variant: "destructive"
      });
      return;
    }

    if (!user || user.balance < amountValue) {
      toast({
        title: "Error",
        description: "Insufficient balance",
        variant: "destructive"
      });
      return;
    }

    setIsProcessing(true);

    try {
      // AI confirmation
      const aiConfirmation = generateAIConfirmation(amountValue, payeeUpi);
      
      // Add transaction to queue
      const transaction = addTransaction(amountValue, payeeUpi);
      
      // Update user balance
      updateBalance(-amountValue);
      
      // Show AI confirmation
      toast({
        title: "Transaction Created",
        description: aiConfirmation
      });

      // Simulate processing delay
      await new Promise(resolve => setTimeout(resolve, 1000));

      toast({
        title: "Success",
        description: `Payment of ₹${amountValue} queued successfully!`
      });

      onComplete();
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to process transaction",
        variant: "destructive"
      });
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/5 to-secondary/10">
      {/* Header */}
      <div className="bg-card border-b">
        <div className="max-w-md mx-auto px-4 py-4">
          <div className="flex items-center gap-3">
            <Button
              variant="ghost"
              size="sm"
              onClick={onBack}
              className="p-2"
            >
              <ArrowLeft className="h-4 w-4" />
            </Button>
            <h1 className="text-xl font-bold">New Payment</h1>
          </div>
        </div>
      </div>

      <div className="max-w-md mx-auto p-4">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Send className="h-5 w-5" />
              Send Money
            </CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="amount">Amount (₹)</Label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground">
                    ₹
                  </span>
                  <Input
                    id="amount"
                    type="number"
                    step="0.01"
                    min="0.01"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    placeholder="0.00"
                    className="pl-8 text-lg"
                    required
                  />
                </div>
                {user && (
                  <p className="text-sm text-muted-foreground">
                    Available balance: ₹{user.balance.toFixed(2)}
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="payeeUpi">UPI ID</Label>
                <div className="relative">
                  <Smartphone className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                  <Input
                    id="payeeUpi"
                    type="text"
                    value={payeeUpi}
                    onChange={(e) => setPayeeUpi(e.target.value)}
                    placeholder="username@paytm"
                    className="pl-10"
                    required
                  />
                </div>
              </div>

              <div className="bg-muted/50 p-4 rounded-lg">
                <h3 className="font-medium mb-2">AI Verification</h3>
                <p className="text-sm text-muted-foreground">
                  {amount && payeeUpi ? 
                    generateAIConfirmation(parseFloat(amount) || 0, payeeUpi) :
                    "Enter amount and UPI ID to see AI verification"
                  }
                </p>
              </div>

              <div className="flex gap-3">
                <Button
                  type="button"
                  variant="outline"
                  onClick={onBack}
                  className="flex-1"
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  disabled={isProcessing || !amount || !payeeUpi}
                  className="flex-1"
                >
                  {isProcessing ? "Processing..." : "Send Payment"}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};