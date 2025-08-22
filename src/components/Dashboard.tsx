import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useAuthStore } from '@/store/authStore';
import { useTransactionStore } from '@/store/transactionStore';
import { TransactionForm } from './TransactionForm';
import { QRView } from './QRView';
import { NFCHandler } from './NFCHandler';
import { formatCurrency } from '@/lib/utils';
import { 
  Wallet, 
  Plus, 
  QrCode, 
  Nfc, 
  WifiOff, 
  Wifi, 
  LogOut, 
  Clock,
  CheckCircle,
  XCircle,
  RefreshCw
} from 'lucide-react';

export const Dashboard = () => {
  const [activeView, setActiveView] = useState<'dashboard' | 'transaction' | 'qr' | 'nfc'>('dashboard');
  const { user, logout } = useAuthStore();
  const { transactions, isOnline, syncTransactions } = useTransactionStore();

  const handleLogout = () => {
    logout();
    setActiveView('dashboard');
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'queued':
        return <Clock className="h-4 w-4 text-yellow-500" />;
      case 'synced':
      case 'completed':
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'failed':
        return <XCircle className="h-4 w-4 text-red-500" />;
      default:
        return <Clock className="h-4 w-4 text-gray-500" />;
    }
  };

  const getStatusBadge = (status: string) => {
    const variants = {
      queued: 'secondary',
      synced: 'default',
      completed: 'default',
      failed: 'destructive'
    } as const;
    
    return variants[status as keyof typeof variants] || 'secondary';
  };

  if (activeView === 'transaction') {
    return (
      <TransactionForm 
        onBack={() => setActiveView('dashboard')}
        onComplete={() => setActiveView('dashboard')}
      />
    );
  }

  if (activeView === 'qr') {
    return (
      <QRView onBack={() => setActiveView('dashboard')} />
    );
  }

  if (activeView === 'nfc') {
    return (
      <NFCHandler onBack={() => setActiveView('dashboard')} />
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/5 to-secondary/10">
      {/* Header */}
      <div className="bg-card border-b">
        <div className="max-w-md mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-xl font-bold">PaySync</h1>
              <p className="text-sm text-muted-foreground">{user?.email}</p>
            </div>
            <div className="flex items-center gap-2">
              <div className="flex items-center gap-1">
                {isOnline ? (
                  <Wifi className="h-4 w-4 text-green-500" />
                ) : (
                  <WifiOff className="h-4 w-4 text-red-500" />
                )}
                <span className="text-xs text-muted-foreground">
                  {isOnline ? 'Online' : 'Offline'}
                </span>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={handleLogout}
                className="text-muted-foreground"
              >
                <LogOut className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-md mx-auto p-4 space-y-6">
        {/* Balance Card */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Wallet className="h-5 w-5" />
              Current Balance
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-primary">
              {formatCurrency(user?.balance || 0)}
            </div>
          </CardContent>
        </Card>

        {/* Action Buttons */}
        <div className="grid grid-cols-3 gap-3">
          <Button
            onClick={() => setActiveView('transaction')}
            className="flex flex-col gap-2 h-20"
          >
            <Plus className="h-5 w-5" />
            <span className="text-xs">New Payment</span>
          </Button>
          <Button
            onClick={() => setActiveView('qr')}
            variant="outline"
            className="flex flex-col gap-2 h-20"
          >
            <QrCode className="h-5 w-5" />
            <span className="text-xs">QR Code</span>
          </Button>
          <Button
            onClick={() => setActiveView('nfc')}
            variant="outline"
            className="flex flex-col gap-2 h-20"
          >
            <Nfc className="h-5 w-5" />
            <span className="text-xs">NFC</span>
          </Button>
        </div>

        {/* Sync Button (when offline) */}
        {!isOnline && (
          <Button
            onClick={syncTransactions}
            variant="outline"
            className="w-full flex items-center gap-2"
          >
            <RefreshCw className="h-4 w-4" />
            Sync when online
          </Button>
        )}

        {/* Recent Transactions */}
        <Card>
          <CardHeader>
            <CardTitle>Recent Transactions</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {transactions.length === 0 ? (
              <p className="text-center text-muted-foreground py-8">
                No transactions yet
              </p>
            ) : (
              transactions.slice(0, 10).map((transaction) => (
                <div
                  key={transaction.id}
                  className="flex items-center justify-between p-3 rounded-lg border"
                >
                  <div className="flex items-center gap-3">
                    {getStatusIcon(transaction.status)}
                    <div>
                      <p className="font-medium">
                        {formatCurrency(transaction.amount)}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        to {transaction.payeeUpi}
                      </p>
                    </div>
                  </div>
                  <Badge variant={getStatusBadge(transaction.status)}>
                    {transaction.status}
                  </Badge>
                </div>
              ))
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};