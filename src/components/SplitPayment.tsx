import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { X, Plus, Users } from 'lucide-react';
import { useTransactionStore } from '@/store/transactionStore';
import { useAuthStore } from '@/store/authStore';
import { toast } from '@/hooks/use-toast';
import { formatCurrency } from '@/lib/utils';

interface SplitPaymentProps {
  onBack: () => void;
}

interface SplitMember {
  id: string;
  upiId: string;
  amount: number;
}

export const SplitPayment = ({ onBack }: SplitPaymentProps) => {
  const [totalAmount, setTotalAmount] = useState<string>('');
  const [description, setDescription] = useState<string>('');
  const [members, setMembers] = useState<SplitMember[]>([
    { id: '1', upiId: '', amount: 0 }
  ]);
  const [splitType, setSplitType] = useState<'equal' | 'custom'>('equal');
  
  const { addTransaction } = useTransactionStore();
  const { updateBalance } = useAuthStore();

  const addMember = () => {
    const newMember: SplitMember = {
      id: Date.now().toString(),
      upiId: '',
      amount: 0
    };
    setMembers([...members, newMember]);
  };

  const removeMember = (id: string) => {
    if (members.length > 1) {
      setMembers(members.filter(member => member.id !== id));
    }
  };

  const updateMember = (id: string, field: 'upiId' | 'amount', value: string | number) => {
    setMembers(members.map(member =>
      member.id === id ? { ...member, [field]: value } : member
    ));
  };

  const calculateSplit = () => {
    const total = parseFloat(totalAmount) || 0;
    if (splitType === 'equal') {
      const perPersonAmount = total / members.length;
      setMembers(members.map(member => ({ ...member, amount: perPersonAmount })));
    }
  };

  const getTotalSplit = () => {
    return members.reduce((sum, member) => sum + member.amount, 0);
  };

  const handleSplitPayment = () => {
    const total = parseFloat(totalAmount);
    const splitTotal = getTotalSplit();

    if (!total || total <= 0) {
      toast({
        title: "Invalid Amount",
        description: "Please enter a valid total amount.",
        variant: "destructive"
      });
      return;
    }

    if (Math.abs(total - splitTotal) > 0.01) {
      toast({
        title: "Split Mismatch",
        description: "The split amounts don't match the total amount.",
        variant: "destructive"
      });
      return;
    }

    const invalidMembers = members.filter(m => !m.upiId.trim() || m.amount <= 0);
    if (invalidMembers.length > 0) {
      toast({
        title: "Invalid Members",
        description: "Please fill in all UPI IDs and amounts.",
        variant: "destructive"
      });
      return;
    }

    // Create transactions for each member
    members.forEach(member => {
      addTransaction(member.amount, member.upiId);
    });

    // Update user balance
    updateBalance(-total);

    toast({
      title: "Split Payment Created",
      description: `Split payment of ${formatCurrency(total)} created for ${members.length} members.`,
    });

    onBack();
  };

  return (
    <div className="container mx-auto p-4 max-w-2xl">
      <div className="flex items-center gap-4 mb-6">
        <Button variant="outline" onClick={onBack}>
          ← Back
        </Button>
        <div className="flex items-center gap-2">
          <Users className="h-5 w-5 text-primary" />
          <h1 className="text-2xl font-bold">Split Payment</h1>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Create Split Payment</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Total Amount */}
          <div className="space-y-2">
            <Label htmlFor="totalAmount">Total Amount</Label>
            <Input
              id="totalAmount"
              type="number"
              placeholder="0.00"
              value={totalAmount}
              onChange={(e) => setTotalAmount(e.target.value)}
              onBlur={calculateSplit}
            />
          </div>

          {/* Description */}
          <div className="space-y-2">
            <Label htmlFor="description">Description (Optional)</Label>
            <Input
              id="description"
              placeholder="Dinner, Movie tickets, etc."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            />
          </div>

          {/* Split Type */}
          <div className="space-y-3">
            <Label>Split Type</Label>
            <div className="flex gap-2">
              <Button
                variant={splitType === 'equal' ? 'default' : 'outline'}
                onClick={() => {
                  setSplitType('equal');
                  calculateSplit();
                }}
              >
                Equal Split
              </Button>
              <Button
                variant={splitType === 'custom' ? 'default' : 'outline'}
                onClick={() => setSplitType('custom')}
              >
                Custom Split
              </Button>
            </div>
          </div>

          {/* Members */}
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <Label>Split Members ({members.length})</Label>
              <Button variant="outline" size="sm" onClick={addMember}>
                <Plus className="h-4 w-4 mr-1" />
                Add Member
              </Button>
            </div>

            {members.map((member, index) => (
              <div key={member.id} className="flex gap-2 items-end p-4 border rounded-lg">
                <div className="flex-1 space-y-2">
                  <Label>UPI ID</Label>
                  <Input
                    placeholder="user@upi"
                    value={member.upiId}
                    onChange={(e) => updateMember(member.id, 'upiId', e.target.value)}
                  />
                </div>
                <div className="w-32 space-y-2">
                  <Label>Amount</Label>
                  <Input
                    type="number"
                    placeholder="0.00"
                    value={member.amount || ''}
                    onChange={(e) => updateMember(member.id, 'amount', parseFloat(e.target.value) || 0)}
                    disabled={splitType === 'equal'}
                  />
                </div>
                {members.length > 1 && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => removeMember(member.id)}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                )}
              </div>
            ))}
          </div>

          {/* Summary */}
          <div className="bg-muted p-4 rounded-lg space-y-2">
            <div className="flex justify-between">
              <span>Total Amount:</span>
              <Badge variant="secondary">{formatCurrency(parseFloat(totalAmount) || 0)}</Badge>
            </div>
            <div className="flex justify-between">
              <span>Split Total:</span>
              <Badge variant={Math.abs((parseFloat(totalAmount) || 0) - getTotalSplit()) < 0.01 ? 'default' : 'destructive'}>
                {formatCurrency(getTotalSplit())}
              </Badge>
            </div>
            <div className="flex justify-between">
              <span>Per Person (Equal):</span>
              <span className="text-sm text-muted-foreground">
                {formatCurrency((parseFloat(totalAmount) || 0) / members.length)}
              </span>
            </div>
          </div>

          {/* Create Button */}
          <Button 
            onClick={handleSplitPayment} 
            className="w-full"
            disabled={!totalAmount || Math.abs((parseFloat(totalAmount) || 0) - getTotalSplit()) > 0.01}
          >
            Create Split Payment
          </Button>
        </CardContent>
      </Card>
    </div>
  );
};