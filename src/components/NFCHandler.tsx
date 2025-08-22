import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { useTransactionStore } from '@/store/transactionStore';
import { useToast } from '@/hooks/use-toast';
import { ArrowLeft, Nfc, Smartphone, Zap, AlertCircle } from 'lucide-react';

interface NFCHandlerProps {
  onBack: () => void;
}

interface TransactionIntent {
  amount: number;
  payeeUpi: string;
  timestamp: number;
}

export const NFCHandler = ({ onBack }: NFCHandlerProps) => {
  const [isNFCSupported, setIsNFCSupported] = useState(false);
  const [isWriting, setIsWriting] = useState(false);
  const [isReading, setIsReading] = useState(false);
  const [lastTransaction, setLastTransaction] = useState<TransactionIntent | null>(null);
  const { addTransaction, transactions } = useTransactionStore();
  const { toast } = useToast();

  useEffect(() => {
    // Enhanced NFC support detection
    const checkNFCSupport = async () => {
      // Check for Web NFC API
      const hasWebNFC = 'NDEFWriter' in window && 'NDEFReader' in window;
      
      if (hasWebNFC) {
        try {
          // Try to create instances to verify actual support
          // @ts-ignore
          const reader = new NDEFReader();
          // @ts-ignore
          const writer = new NDEFWriter();
          
          // Check permissions (optional, won't block on permission denial)
          if ('permissions' in navigator) {
            try {
              // @ts-ignore
              const permission = await navigator.permissions.query({ name: 'nfc' });
              console.log('NFC permission:', permission.state);
            } catch (e) {
              console.log('NFC permission check not available');
            }
          }
          
          setIsNFCSupported(true);
          toast({
            title: "NFC Ready",
            description: "Your device supports NFC transfers"
          });
        } catch (error) {
          console.error('NFC instantiation failed:', error);
          setIsNFCSupported(false);
        }
      } else {
        setIsNFCSupported(false);
      }
    };

    checkNFCSupport();
  }, []);

  const writeNFC = async () => {
    if (!isNFCSupported) {
      toast({
        title: "NFC Not Supported",
        description: "Your device doesn't support Web NFC",
        variant: "destructive"
      });
      return;
    }

    const latestTransaction = transactions[0];
    if (!latestTransaction) {
      toast({
        title: "No Transaction",
        description: "Create a transaction first to broadcast via NFC",
        variant: "destructive"
      });
      return;
    }

    setIsWriting(true);

    try {
      // @ts-ignore - Web NFC API types may not be available
      const ndef = new NDEFWriter();
      
      const intent: TransactionIntent = {
        amount: latestTransaction.amount,
        payeeUpi: latestTransaction.payeeUpi,
        timestamp: Date.now()
      };

      const message = {
        records: [{
          recordType: "text",
          data: btoa(JSON.stringify(intent))
        }]
      };

      await ndef.write(message);
      
      toast({
        title: "NFC Transfer Ready",
        description: "Hold your device close to another NFC device to transfer"
      });
    } catch (error) {
      console.error('NFC write error:', error);
      toast({
        title: "NFC Write Failed",
        description: "Failed to write to NFC tag. Make sure to tap the tag.",
        variant: "destructive"
      });
    } finally {
      setIsWriting(false);
    }
  };

  const readNFC = async () => {
    if (!isNFCSupported) {
      toast({
        title: "NFC Not Supported",
        description: "Your device doesn't support Web NFC",
        variant: "destructive"
      });
      return;
    }

    setIsReading(true);

    try {
      // @ts-ignore - Web NFC API types may not be available
      const ndef = new NDEFReader();
      
      await ndef.scan();
      
      ndef.addEventListener("reading", ({ message }: any) => {
        try {
          const record = message.records[0];
          const decoder = new TextDecoder();
          const data = decoder.decode(record.data);
          const intent: TransactionIntent = JSON.parse(atob(data));
          
          // Add transaction to queue
          addTransaction(intent.amount, intent.payeeUpi);
          setLastTransaction(intent);
          
          toast({
            title: "NFC Transaction Received",
            description: `Payment of ₹${intent.amount} to ${intent.payeeUpi} added to queue`
          });
        } catch (error) {
          toast({
            title: "Invalid NFC Data",
            description: "The NFC tag doesn't contain valid transaction data",
            variant: "destructive"
          });
        }
        setIsReading(false);
      });

      toast({
        title: "NFC Scanner Active",
        description: "Hold your device close to another device to receive transfer"
      });
    } catch (error) {
      console.error('NFC read error:', error);
      toast({
        title: "NFC Read Failed",
        description: "Failed to start NFC scanner",
        variant: "destructive"
      });
      setIsReading(false);
    }
  };

  const stopReading = () => {
    setIsReading(false);
    toast({
      title: "NFC Scanner Stopped",
      description: "Stopped scanning for NFC tags"
    });
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
            <h1 className="text-xl font-bold">NFC Transfer</h1>
            <Badge variant={isNFCSupported ? "default" : "destructive"}>
              {isNFCSupported ? "Supported" : "Not Supported"}
            </Badge>
          </div>
        </div>
      </div>

      <div className="max-w-md mx-auto p-4">
        {!isNFCSupported && (
          <Card className="mb-4 border-yellow-200 bg-yellow-50 dark:border-yellow-800 dark:bg-yellow-950">
             <CardContent className="pt-6">
               <div className="flex items-center gap-2 text-yellow-800 dark:text-yellow-200">
                 <AlertCircle className="h-4 w-4" />
                 <div className="text-sm">
                   <p className="font-medium mb-2">NFC Requirements:</p>
                   <ul className="list-disc list-inside space-y-1">
                     <li>Android device with NFC enabled</li>
                     <li>Chrome browser (latest version)</li>
                     <li>HTTPS connection (secure context)</li>
                     <li>NFC permission granted</li>
                   </ul>
                   <p className="mt-2">
                     Check your device settings and ensure NFC is turned on.
                   </p>
                 </div>
               </div>
             </CardContent>
          </Card>
        )}

        <Tabs defaultValue="write" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="write">Broadcast</TabsTrigger>
            <TabsTrigger value="read">Receive</TabsTrigger>
          </TabsList>
          
          <TabsContent value="write" className="space-y-4 mt-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Zap className="h-5 w-5" />
                  Broadcast Transaction
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {transactions.length > 0 ? (
                  <div className="bg-muted/50 p-4 rounded-lg">
                    <h3 className="font-medium mb-2">Latest Transaction</h3>
                    <p className="text-sm">
                      Amount: ₹{transactions[0].amount}<br />
                      To: {transactions[0].payeeUpi}<br />
                      Status: {transactions[0].status}
                    </p>
                  </div>
                ) : (
                  <div className="bg-muted/50 p-4 rounded-lg">
                    <p className="text-sm text-muted-foreground">
                      No transactions available. Create a transaction first to broadcast via NFC.
                    </p>
                  </div>
                )}

                <Button
                  onClick={writeNFC}
                  disabled={!isNFCSupported || isWriting || transactions.length === 0}
                  className="w-full"
                >
                  <Nfc className="h-4 w-4 mr-2" />
                  {isWriting ? "Writing to NFC..." : "Write to NFC Tag"}
                </Button>

                 <div className="bg-muted/50 p-4 rounded-lg">
                   <p className="text-sm text-muted-foreground">
                     <strong>Device-to-Device Transfer:</strong> Tap "Write to NFC Tag", 
                     then hold your device close (back-to-back) with another NFC device 
                     running this app to transfer transaction data instantly.
                   </p>
                 </div>
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="read" className="space-y-4 mt-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Smartphone className="h-5 w-5" />
                  Receive Transaction
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {lastTransaction && (
                  <div className="bg-green-50 dark:bg-green-950 p-4 rounded-lg border border-green-200 dark:border-green-800">
                    <h3 className="font-medium text-green-800 dark:text-green-200 mb-2">
                      Last Received Transaction
                    </h3>
                    <p className="text-sm text-green-700 dark:text-green-300">
                      Amount: ₹{lastTransaction.amount}<br />
                      To: {lastTransaction.payeeUpi}<br />
                      Received: {new Date(lastTransaction.timestamp).toLocaleTimeString()}
                    </p>
                  </div>
                )}

                <div className="flex gap-2">
                  <Button
                    onClick={readNFC}
                    disabled={!isNFCSupported || isReading}
                    className="flex-1"
                  >
                    <Nfc className="h-4 w-4 mr-2" />
                    {isReading ? "Scanning..." : "Start NFC Scanner"}
                  </Button>
                  
                  {isReading && (
                    <Button
                      onClick={stopReading}
                      variant="outline"
                      className="flex-1"
                    >
                      Stop Scanning
                    </Button>
                  )}
                </div>

                 <div className="bg-muted/50 p-4 rounded-lg">
                   <p className="text-sm text-muted-foreground">
                     <strong>Receive Transfer:</strong> Start the scanner, then hold your 
                     device close to another device that's broadcasting a transaction. 
                     Make sure NFC is enabled in your device settings.
                   </p>
                 </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};