import { CheckCircle, Printer, ArrowLeft } from 'lucide-react';
import { Button } from './ui/button';
import { Transaction } from '../App';

interface ReceiptScreenProps {
  transaction: Transaction | null;
  balance: number;
  onNewTransaction: () => void;
  onExit: () => void;
}

export function ReceiptScreen({ transaction, balance, onNewTransaction, onExit }: ReceiptScreenProps) {
  if (!transaction) return null;

  const transactionId = `TXN${Math.random().toString(36).substr(2, 9).toUpperCase()}`;
  const formattedDate = transaction.timestamp.toLocaleString();

  return (
    <div className="h-full flex flex-col p-12">
      <div className="text-center mb-8">
        <CheckCircle className="w-20 h-20 text-green-600 mx-auto mb-4" />
        <h2 className="text-3xl text-green-600 mb-2">Transaction Successful</h2>
        <p className="text-slate-600">Your transaction has been completed</p>
      </div>

      {/* Receipt */}
      <div className="bg-white rounded-xl shadow-2xl border-2 border-slate-200 max-w-xl mx-auto w-full mb-8">
        {/* Receipt Header */}
        <div className="bg-gradient-to-r from-blue-600 to-blue-800 text-white p-6 rounded-t-xl">
          <div className="text-center">
            <h3 className="text-2xl mb-1">Bank</h3>
            <p className="text-blue-200 text-sm">Transaction Receipt</p>
          </div>
        </div>

        {/* Receipt Body */}
        <div className="p-8 space-y-4">
          <div className="flex justify-between py-3 border-b border-slate-200">
            <span className="text-slate-600">Transaction Type</span>
            <span className="text-slate-800">{transaction.type}</span>
          </div>

          {transaction.amount && (
            <div className="flex justify-between py-3 border-b border-slate-200">
              <span className="text-slate-600">Amount</span>
              <span className="text-slate-800 text-xl">
                ${transaction.amount.toFixed(2)}
              </span>
            </div>
          )}

          {transaction.recipient && (
            <div className="flex justify-between py-3 border-b border-slate-200">
              <span className="text-slate-600">Recipient</span>
              <span className="text-slate-800">{transaction.recipient}</span>
            </div>
          )}

          {transaction.frequency && (
            <div className="flex justify-between py-3 border-b border-slate-200">
              <span className="text-slate-600">Schedule</span>
              <span className="text-slate-800">{transaction.frequency}</span>
            </div>
          )}

          <div className="flex justify-between py-3 border-b border-slate-200">
            <span className="text-slate-600">New Balance</span>
            <span className="text-green-600 text-xl">
              ${balance.toFixed(2)}
            </span>
          </div>

          <div className="flex justify-between py-3 border-b border-slate-200">
            <span className="text-slate-600">Transaction ID</span>
            <span className="text-slate-800 text-sm">{transactionId}</span>
          </div>

          <div className="flex justify-between py-3">
            <span className="text-slate-600">Date & Time</span>
            <span className="text-slate-800 text-sm">{formattedDate}</span>
          </div>
        </div>

        {/* Receipt Footer */}
        <div className="bg-slate-50 p-6 rounded-b-xl text-center border-t-2 border-dashed border-slate-300">
          <p className="text-slate-600 text-sm mb-2">Thank you for banking with us</p>
          <p className="text-slate-500 text-xs">Keep this receipt for your records</p>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex gap-4 justify-center">
        <Button
          onClick={() => window.print()}
          className="bg-slate-200 hover:bg-slate-300 text-slate-800 px-8 py-4 rounded-xl flex items-center gap-2"
        >
          <Printer className="w-5 h-5" />
          Print Receipt
        </Button>
        <Button
          onClick={onNewTransaction}
          className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-4 rounded-xl flex items-center gap-2"
        >
          <ArrowLeft className="w-5 h-5" />
          New Transaction
        </Button>
        <Button
          onClick={onExit}
          className="bg-red-600 hover:bg-red-700 text-white px-8 py-4 rounded-xl"
        >
          Exit & Eject Card
        </Button>
      </div>
    </div>
  );
}
