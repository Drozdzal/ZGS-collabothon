import { Wallet, TrendingUp, ArrowLeft, Eye } from 'lucide-react';
import { Button } from './ui/button';

interface BalanceScreenProps {
  balance: number;
  onBack: () => void;
}

export function BalanceScreen({ balance, onBack }: BalanceScreenProps) {
  const accountNumber = '****1234';
  const lastDeposit = 2500.00;
  const lastWithdrawal = 150.00;

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
        <Eye className="w-16 h-16 text-green-600 mx-auto mb-4" />
        <h2 className="text-3xl text-slate-800 mb-2">Balance Inquiry</h2>
        <p className="text-slate-600">Account: {accountNumber}</p>
      </div>

      {/* Main Balance Card */}
      <div className="bg-gradient-to-br from-green-500 to-green-700 rounded-2xl p-8 shadow-2xl mb-6 text-white">
        <div className="flex items-center justify-between mb-4">
          <div>
            <p className="text-green-100 text-sm mb-1">Current Balance</p>
            <p className="text-5xl">${balance.toFixed(2)}</p>
          </div>
          <Wallet className="w-20 h-20 opacity-30" />
        </div>
        <div className="border-t border-green-400 pt-4 mt-4">
          <p className="text-green-100 text-sm">Savings Account</p>
          <p className="text-xl">${(balance * 0.3).toFixed(2)}</p>
        </div>
      </div>

      {/* Recent Activity */}
      <div className="grid grid-cols-2 gap-4">
        <div className="bg-white rounded-xl p-6 shadow-lg border-2 border-slate-200">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
              <TrendingUp className="w-5 h-5 text-green-600" />
            </div>
            <div>
              <p className="text-slate-600 text-sm">Last Deposit</p>
              <p className="text-xl text-green-600">+${lastDeposit.toFixed(2)}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl p-6 shadow-lg border-2 border-slate-200">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 bg-red-100 rounded-full flex items-center justify-center">
              <Wallet className="w-5 h-5 text-red-600" />
            </div>
            <div>
              <p className="text-slate-600 text-sm">Last Withdrawal</p>
              <p className="text-xl text-red-600">-${lastWithdrawal.toFixed(2)}</p>
            </div>
          </div>
        </div>
      </div>

      <div className="mt-8 text-center">
        <Button
          onClick={onBack}
          className="bg-blue-600 hover:bg-blue-700 text-white px-12 py-4 rounded-xl text-lg"
        >
          Return to Main Menu
        </Button>
      </div>

      <div className="mt-6 text-center text-slate-500 text-sm">
        <p>Balance as of {new Date().toLocaleString()}</p>
      </div>
    </div>
  );
}
