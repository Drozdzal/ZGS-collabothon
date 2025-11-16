import React, { useState } from 'react';
import { ArrowLeft, FileText, AlertCircle } from 'lucide-react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { scanPaymentDocument, PaymentScanResult } from '../api/paymentScanClient';

interface DocumentScanScreenProps {
  onBack: () => void;
  onSubmitPayment: (data: {
    paymentType: 'instant' | 'standard' | 'standing_order';
    recipientName: string;
    recipientAccount: string;
    amount: number;
    reference: string;
    dueDate: string | null;
  }) => void;
}

export function DocumentScanScreen({ onBack, onSubmitPayment }: DocumentScanScreenProps) {
  const DEFAULT_IMAGE_PATH = '/tmp/sample_invoice.jpg';
  const [scanResult, setScanResult] = useState<PaymentScanResult | null>(null);
  const [amount, setAmount] = useState('');
  const [recipientName, setRecipientName] = useState('');
  const [recipientAccount, setRecipientAccount] = useState('');
  const [reference, setReference] = useState('');
  const [paymentType, setPaymentType] =
    useState<'instant' | 'standard' | 'standing_order'>('instant');
  const [isScanning, setIsScanning] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleScan = async () => {
    setError(null);
    setIsScanning(true);

    try {
      const result = await scanPaymentDocument(DEFAULT_IMAGE_PATH);
      setScanResult(result);

      if (result.status === 'ok') {
        if (result.amount != null) setAmount(result.amount.toString());
        if (result.recipient_name) setRecipientName(result.recipient_name);
        if (result.recipient_account) setRecipientAccount(result.recipient_account);
        if (result.reference) setReference(result.reference);
        setPaymentType(result.payment_type);
      } else {
        setError(result.message || 'Scan failed.');
      }
    } catch (e) {
      setError('Unexpected error while scanning document.');
    } finally {
      setIsScanning(false);
    }
  };

  const handleSendPayment = () => {
    const parsedAmount = parseFloat(amount);
    if (!recipientAccount.trim() || isNaN(parsedAmount) || parsedAmount <= 0) {
      setError('Please provide a valid recipient and amount before sending payment.');
      return;
    }
    setError(null);
    onSubmitPayment({
      paymentType,
      recipientName: recipientName.trim() || 'Scanned Recipient',
      recipientAccount: recipientAccount.trim(),
      amount: parsedAmount,
      reference: reference.trim() || 'Scanned payment',
      dueDate: scanResult?.due_date ?? null,
    });
  };

  return (
    <div className="h-full flex flex-col p-12">
      <div className="flex items-center justify-between mb-8">
        <Button
          onClick={onBack}
          className="bg-slate-200 hover:bg-slate-300 text-slate-800 rounded-lg px-4 py-2"
        >
          <ArrowLeft className="w-5 h-5 mr-2" />
          Back
        </Button>
      </div>

      <div className="text-center mb-8">
        <FileText className="w-16 h-16 text-slate-700 mx-auto mb-4" />
        <h2 className="text-3xl text-slate-800 mb-2">Document Payment Scan</h2>
        <p className="text-slate-600">
          The ATM will scan a preconfigured image of a bill or payment slip and read the payment
          details for you.
        </p>
        {error && (
          <div className="mt-4 flex items-center justify-center gap-2 text-red-600">
            <AlertCircle className="w-5 h-5" />
            <span>{error}</span>
          </div>
        )}
      </div>

      <div className="space-y-6 max-w-2xl mx-auto w-full">
        {/* Scan trigger */}
        <div className="bg-white rounded-xl p-6 shadow-lg border-2 border-slate-200">
          <p className="text-slate-700 text-sm mb-3">
            When you press scan, the ATM uses its configured document reader to analyse a stored
            image of your bill. In a real machine this would come from the document feeder or
            camera.
          </p>
          <Button
            onClick={handleScan}
            disabled={isScanning}
            className="mt-4 bg-slate-200 hover:bg-green-600 text-white rounded-lg px-6 py-2"
          >
            {isScanning ? 'Scanning...' : 'Scan document'}
          </Button>
          {scanResult && (
            <p className="mt-3 text-xs text-slate-500">
              {scanResult.message}
            </p>
          )}
        </div>

        {/* Payment details */}
        <div className="bg-white rounded-xl p-6 shadow-lg border-2 border-slate-200 space-y-4">
          <h3 className="text-slate-800 text-lg mb-2">Payment details</h3>

          <div>
            <label className="block text-slate-700 mb-1">Recipient name</label>
            <Input
              type="text"
              value={recipientName}
              onChange={(e) => setRecipientName(e.target.value)}
              className="h-10"
            />
          </div>

          <div>
            <label className="block text-slate-700 mb-1">Recipient account (IBAN)</label>
            <Input
              type="text"
              value={recipientAccount}
              onChange={(e) => setRecipientAccount(e.target.value)}
              className="h-10"
            />
          </div>

          <div>
            <label className="block text-slate-700 mb-1">Amount</label>
            <Input
              type="number"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              className="h-10"
            />
          </div>

          <div>
            <label className="block text-slate-700 mb-1">Reference / message</label>
            <Input
              type="text"
              value={reference}
              onChange={(e) => setReference(e.target.value)}
              className="h-10"
            />
          </div>

          <div>
            <label className="block text-slate-700 mb-1">Detected payment type</label>
            <select
              className="w-full h-10 border-2 border-slate-300 rounded-lg px-3 text-slate-800 bg-white"
              value={paymentType}
              onChange={(e) =>
                setPaymentType(e.target.value as 'instant' | 'standard' | 'standing_order')
              }
            >
              <option value="instant">Instant payment</option>
              <option value="standard">Standard transfer</option>
              <option value="standing_order">Standing order</option>
            </select>
          </div>

          <Button
            onClick={handleSendPayment}
            className="mt-4 w-full bg-slate-200 hover:bg-green-600 text-white h-12 rounded-xl text-lg shadow-lg"
          >
            Send payment
          </Button>
        </div>
      </div>
    </div>
  );
}


