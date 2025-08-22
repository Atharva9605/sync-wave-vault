import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useTransactionStore } from '@/store/transactionStore';
import { useToast } from '@/hooks/use-toast';
import { QRCodeSVG } from 'qrcode.react';
import { ArrowLeft, QrCode, Scan, Download } from 'lucide-react';

interface QRViewProps {
  onBack: () => void;
}

interface TransactionIntent {
  amount: number;
  payeeUpi: string;
  timestamp: number;
}

export const QRView = ({ onBack }: QRViewProps) => {
  const [amount, setAmount] = useState('');
  const [payeeUpi, setPayeeUpi] = useState('');
  const [qrData, setQrData] = useState<string>('');
  const [scanInput, setScanInput] = useState('');
  const { addTransaction } = useTransactionStore();
  const { toast } = useToast();

  const generateQR = () => {
    if (!amount || !payeeUpi) {
      toast({
        title: "Error",
        description: "Please fill in all fields",
        variant: "destructive"
      });
      return;
    }

    const intent: TransactionIntent = {
      amount: parseFloat(amount),
      payeeUpi,
      timestamp: Date.now()
    };

    // Encode transaction intent as base64
    const encoded = btoa(JSON.stringify(intent));
    setQrData(encoded);
    
    toast({
      title: "QR Code Generated",
      description: "Share this QR code to receive payment"
    });
  };

  const processScannedData = () => {
    if (!scanInput) {
      toast({
        title: "Error",
        description: "Please enter scanned data",
        variant: "destructive"
      });
      return;
    }

    try {
      const decoded = JSON.parse(atob(scanInput));
      const intent: TransactionIntent = decoded;
      
      if (!intent.amount || !intent.payeeUpi) {
        throw new Error('Invalid transaction data');
      }

      // Add transaction to queue
      addTransaction(intent.amount, intent.payeeUpi);
      
      toast({
        title: "Transaction Added",
        description: `Payment of ₹${intent.amount} to ${intent.payeeUpi} added to queue`
      });
      
      setScanInput('');
    } catch (error) {
      toast({
        title: "Error",
        description: "Invalid QR code data",
        variant: "destructive"
      });
    }
  };

  const downloadQR = () => {
    const svg = document.querySelector('#qr-code svg');
    if (!svg) return;

    const svgData = new XMLSerializer().serializeToString(svg);
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    const img = new Image();

    img.onload = () => {
      canvas.width = img.width;
      canvas.height = img.height;
      ctx?.drawImage(img, 0, 0);
      
      const pngFile = canvas.toDataURL('image/png');
      const downloadLink = document.createElement('a');
      downloadLink.download = 'payment-qr.png';
      downloadLink.href = pngFile;
      downloadLink.click();
    };

    img.src = 'data:image/svg+xml;base64,' + btoa(svgData);
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
            <h1 className="text-xl font-bold">QR Code</h1>
          </div>
        </div>
      </div>

      <div className="max-w-md mx-auto p-4">
        <Tabs defaultValue="generate" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="generate">Generate</TabsTrigger>
            <TabsTrigger value="scan">Scan</TabsTrigger>
          </TabsList>
          
          <TabsContent value="generate" className="space-y-4 mt-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <QrCode className="h-5 w-5" />
                  Generate QR Code
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="qr-amount">Amount (₹)</Label>
                  <Input
                    id="qr-amount"
                    type="number"
                    step="0.01"
                    min="0.01"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    placeholder="0.00"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="qr-upi">Your UPI ID</Label>
                  <Input
                    id="qr-upi"
                    type="text"
                    value={payeeUpi}
                    onChange={(e) => setPayeeUpi(e.target.value)}
                    placeholder="your-upi@paytm"
                  />
                </div>

                <Button onClick={generateQR} className="w-full">
                  Generate QR Code
                </Button>

                {qrData && (
                  <div className="text-center space-y-4">
                    <div id="qr-code" className="bg-white p-4 rounded-lg inline-block">
                      <QRCodeSVG
                        value={qrData}
                        size={200}
                        level="H"
                        includeMargin={true}
                      />
                    </div>
                    <Button
                      onClick={downloadQR}
                      variant="outline"
                      className="w-full"
                    >
                      <Download className="h-4 w-4 mr-2" />
                      Download QR Code
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="scan" className="space-y-4 mt-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Scan className="h-5 w-5" />
                  Process Scanned QR
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="scan-data">Scanned Data</Label>
                  <Input
                    id="scan-data"
                    type="text"
                    value={scanInput}
                    onChange={(e) => setScanInput(e.target.value)}
                    placeholder="Paste scanned QR code data here"
                  />
                </div>

                <Button onClick={processScannedData} className="w-full">
                  Process Transaction
                </Button>

                <div className="bg-muted/50 p-4 rounded-lg">
                  <p className="text-sm text-muted-foreground">
                    <strong>Note:</strong> In a real app, this would use the device camera 
                    to scan QR codes automatically. For this demo, you can paste the 
                    base64-encoded transaction data.
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