import { useState } from 'react';
import { DollarSign, ArrowLeft, AlertCircle } from 'lucide-react';
import { Button } from './ui/button';
import { Input } from './ui/input';

interface WithdrawalScreenProps {
  onWithdraw: (amount: number) => void;
  onBack: () => void;
  currentBalance: number;
}

export function WithdrawalScreen({ onWithdraw, onBack, currentBalance }: WithdrawalScreenProps) {
  const [customAmount, setCustomAmount] = useState('');
  const [error, setError] = useState('');

  const quickAmounts = [20, 40, 60, 80, 100, 200, 500, 1000];

  const handleWithdraw = (amount: number) => {
    if (amount > currentBalance) {
      setError('Insufficient funds');
      return;
    }
    if (amount <= 0) {
      setError('Invalid amount');
      return;
    }
    setError('');
    onWithdraw(amount);
  };

  const handleCustomWithdraw = () => {
    const amount = parseFloat(customAmount);
    if (isNaN(amount)) {
      setError('Please enter a valid amount');
      return;
    }
    handleWithdraw(amount);
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
        <div className="text-right">
          <p className="text-slate-600 text-sm">Available Balance</p>
          <p className="text-2xl text-green-600">${currentBalance.toFixed(2)}</p>
        </div>
      </div>

      <div className="text-center mb-8">
        <h2 className="text-3xl text-slate-800 mb-2">Select Amount</h2>
        <p className="text-slate-600">Choose a quick amount or enter custom</p>
        {error && (
          <div className="mt-4 flex items-center justify-center gap-2 text-red-600">
            <AlertCircle className="w-5 h-5" />
            <span>{error}</span>
          </div>
        )}
      </div>

      {/* Quick Amount Buttons */}
      <div className="grid grid-cols-4 gap-4 mb-8">
        {quickAmounts.map((amount) => (
          <Button
            key={amount}
            onClick={() => handleWithdraw(amount)}
            className="bg-blue-500 hover:bg-blue-600 text-white rounded-xl h-24 flex flex-col items-center justify-center shadow-lg transition-transform hover:scale-105"
          >
            <DollarSign className="w-8 h-8 mb-1" />
            <span className="text-2xl">{amount}</span>
          </Button>
        ))}
      </div>

      {/* Custom Amount */}
      <div className="bg-white rounded-xl p-6 shadow-lg border-2 border-slate-200">
        <label className="block text-slate-700 mb-2">Custom Amount</label>
        <div className="flex gap-3">
          <div className="flex-1 relative">
            <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-600 text-xl">$</span>
            <Input
              type="number"
              value={customAmount}
              onChange={(e) => {
                setCustomAmount(e.target.value);
                setError('');
              }}
              placeholder="0.00"
              className="pl-8 h-12 text-xl"
            />
          </div>
          <Button
            onClick={handleCustomWithdraw}
            className="bg-green-500 hover:bg-green-600 text-white px-8 rounded-lg"
          >
            Withdraw
          </Button>
        </div>
      </div>

      <div className="mt-6 text-center text-slate-500 text-sm">
        <p>Maximum withdrawal: $5,000 per transaction</p>
        <p>Daily limit: $10,000</p>
      </div>
    </div>
  );
}
