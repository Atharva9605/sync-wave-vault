import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Calendar, Plus, Bell, Clock, Trash2 } from 'lucide-react';
import { toast } from '@/hooks/use-toast';
import { formatCurrency } from '@/lib/utils';

interface PaymentReminderProps {
  onBack: () => void;
}

interface Reminder {
  id: string;
  title: string;
  amount: number;
  recipientUpi: string;
  frequency: 'once' | 'daily' | 'weekly' | 'monthly';
  nextDue: Date;
  isActive: boolean;
  createdAt: Date;
}

export const PaymentReminders = ({ onBack }: PaymentReminderProps) => {
  const [reminders, setReminders] = useState<Reminder[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    amount: '',
    recipientUpi: '',
    frequency: 'monthly' as const,
    dueDate: ''
  });

  // Load reminders from localStorage
  useEffect(() => {
    const saved = localStorage.getItem('payment-reminders');
    if (saved) {
      const parsed = JSON.parse(saved);
      setReminders(parsed.map((r: any) => ({
        ...r,
        nextDue: new Date(r.nextDue),
        createdAt: new Date(r.createdAt)
      })));
    }
  }, []);

  // Save reminders to localStorage
  useEffect(() => {
    localStorage.setItem('payment-reminders', JSON.stringify(reminders));
  }, [reminders]);

  const getNextDueDate = (frequency: string, startDate: Date): Date => {
    const date = new Date(startDate);
    switch (frequency) {
      case 'daily':
        date.setDate(date.getDate() + 1);
        break;
      case 'weekly':
        date.setDate(date.getDate() + 7);
        break;
      case 'monthly':
        date.setMonth(date.getMonth() + 1);
        break;
      default:
        break;
    }
    return date;
  };

  const createReminder = () => {
    if (!formData.title || !formData.amount || !formData.recipientUpi || !formData.dueDate) {
      toast({
        title: "Missing Information",
        description: "Please fill in all fields.",
        variant: "destructive"
      });
      return;
    }

    const dueDate = new Date(formData.dueDate);
    const newReminder: Reminder = {
      id: Date.now().toString(),
      title: formData.title,
      amount: parseFloat(formData.amount),
      recipientUpi: formData.recipientUpi,
      frequency: formData.frequency,
      nextDue: dueDate,
      isActive: true,
      createdAt: new Date()
    };

    setReminders([newReminder, ...reminders]);
    setFormData({
      title: '',
      amount: '',
      recipientUpi: '',
      frequency: 'monthly',
      dueDate: ''
    });
    setShowForm(false);

    toast({
      title: "Reminder Created",
      description: `Payment reminder for ${formData.title} has been set.`
    });
  };

  const toggleReminder = (id: string) => {
    setReminders(reminders.map(reminder =>
      reminder.id === id ? { ...reminder, isActive: !reminder.isActive } : reminder
    ));
  };

  const deleteReminder = (id: string) => {
    setReminders(reminders.filter(reminder => reminder.id !== id));
    toast({
      title: "Reminder Deleted",
      description: "Payment reminder has been removed."
    });
  };

  const markAsPaid = (id: string) => {
    const reminder = reminders.find(r => r.id === id);
    if (!reminder) return;

    const nextDue = reminder.frequency === 'once' 
      ? reminder.nextDue 
      : getNextDueDate(reminder.frequency, reminder.nextDue);

    setReminders(reminders.map(r =>
      r.id === id ? { 
        ...r, 
        nextDue,
        isActive: reminder.frequency !== 'once'
      } : r
    ));

    toast({
      title: "Payment Recorded",
      description: `Payment for ${reminder.title} has been marked as completed.`
    });
  };

  const getDaysUntilDue = (dueDate: Date): number => {
    const today = new Date();
    const diffTime = dueDate.getTime() - today.getTime();
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  };

  const getStatusBadge = (reminder: Reminder) => {
    const daysUntil = getDaysUntilDue(reminder.nextDue);
    
    if (!reminder.isActive) {
      return <Badge variant="secondary">Inactive</Badge>;
    }
    
    if (daysUntil < 0) {
      return <Badge variant="destructive">Overdue</Badge>;
    } else if (daysUntil === 0) {
      return <Badge variant="destructive">Due Today</Badge>;
    } else if (daysUntil <= 3) {
      return <Badge variant="outline">Due Soon</Badge>;
    } else {
      return <Badge variant="default">Active</Badge>;
    }
  };

  return (
    <div className="container mx-auto p-4 max-w-4xl">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-4">
          <Button variant="outline" onClick={onBack}>
            ← Back
          </Button>
          <div className="flex items-center gap-2">
            <Bell className="h-5 w-5 text-primary" />
            <h1 className="text-2xl font-bold">Payment Reminders</h1>
          </div>
        </div>
        <Button onClick={() => setShowForm(!showForm)}>
          <Plus className="h-4 w-4 mr-2" />
          Add Reminder
        </Button>
      </div>

      {showForm && (
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Create New Reminder</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="title">Title</Label>
                <Input
                  id="title"
                  placeholder="Rent, Utility Bill, etc."
                  value={formData.title}
                  onChange={(e) => setFormData({...formData, title: e.target.value})}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="amount">Amount</Label>
                <Input
                  id="amount"
                  type="number"
                  placeholder="0.00"
                  value={formData.amount}
                  onChange={(e) => setFormData({...formData, amount: e.target.value})}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="recipientUpi">Recipient UPI</Label>
                <Input
                  id="recipientUpi"
                  placeholder="recipient@upi"
                  value={formData.recipientUpi}
                  onChange={(e) => setFormData({...formData, recipientUpi: e.target.value})}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="frequency">Frequency</Label>
                <Select value={formData.frequency} onValueChange={(value: any) => setFormData({...formData, frequency: value})}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="once">One Time</SelectItem>
                    <SelectItem value="daily">Daily</SelectItem>
                    <SelectItem value="weekly">Weekly</SelectItem>
                    <SelectItem value="monthly">Monthly</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2 md:col-span-2">
                <Label htmlFor="dueDate">First Due Date</Label>
                <Input
                  id="dueDate"
                  type="date"
                  value={formData.dueDate}
                  onChange={(e) => setFormData({...formData, dueDate: e.target.value})}
                />
              </div>
            </div>
            <div className="flex gap-2">
              <Button onClick={createReminder}>Create Reminder</Button>
              <Button variant="outline" onClick={() => setShowForm(false)}>Cancel</Button>
            </div>
          </CardContent>
        </Card>
      )}

      <div className="space-y-4">
        {reminders.length === 0 ? (
          <Card>
            <CardContent className="text-center py-12">
              <Bell className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">No Reminders Set</h3>
              <p className="text-muted-foreground mb-4">
                Create payment reminders to never miss a payment again.
              </p>
              <Button onClick={() => setShowForm(true)}>
                <Plus className="h-4 w-4 mr-2" />
                Add Your First Reminder
              </Button>
            </CardContent>
          </Card>
        ) : (
          reminders.map((reminder) => (
            <Card key={reminder.id}>
              <CardContent className="p-6">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="text-lg font-semibold">{reminder.title}</h3>
                      {getStatusBadge(reminder)}
                    </div>
                    <div className="space-y-1 text-sm text-muted-foreground">
                      <p>Amount: {formatCurrency(reminder.amount)}</p>
                      <p>To: {reminder.recipientUpi}</p>
                      <p>Frequency: {reminder.frequency}</p>
                      <div className="flex items-center gap-1">
                        <Calendar className="h-4 w-4" />
                        <span>Next Due: {reminder.nextDue.toLocaleDateString()}</span>
                        <span className="ml-2">
                          ({getDaysUntilDue(reminder.nextDue) === 0 
                            ? 'Today' 
                            : getDaysUntilDue(reminder.nextDue) > 0 
                              ? `${getDaysUntilDue(reminder.nextDue)} days`
                              : `${Math.abs(getDaysUntilDue(reminder.nextDue))} days overdue`})
                        </span>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 ml-4">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => toggleReminder(reminder.id)}
                    >
                      {reminder.isActive ? 'Pause' : 'Resume'}
                    </Button>
                    {reminder.isActive && (
                      <Button
                        variant="default"
                        size="sm"
                        onClick={() => markAsPaid(reminder.id)}
                      >
                        Mark Paid
                      </Button>
                    )}
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => deleteReminder(reminder.id)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  );
};