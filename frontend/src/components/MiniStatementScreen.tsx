import { ArrowLeft, ListChecks, Receipt } from 'lucide-react';
import { Button } from './ui/button';
import type { Transaction } from '../App';

interface MiniStatementScreenProps {
  transactions: Transaction[];
  balance: number;
  onBack: () => void;
}

export function MiniStatementScreen({
  transactions,
  balance,
  onBack
}: MiniStatementScreenProps) {
  const hasTransactions = transactions.length > 0;

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
          <p className="text-slate-600 text-sm">Current Balance</p>
          <p className="text-2xl text-green-600">${balance.toFixed(2)}</p>
        </div>
      </div>

      <div className="text-center mb-8">
        <ListChecks className="w-16 h-16 text-orange-500 mx-auto mb-4" />
        <h2 className="text-3xl text-slate-800 mb-2">Mini Statement</h2>
        <p className="text-slate-600">
          {hasTransactions
            ? 'Last few transactions on this card'
            : 'No recent transactions found'}
        </p>
      </div>

      <div className="flex-1 max-w-2xl mx-auto w-full">
        <div className="bg-white rounded-xl shadow-lg border-2 border-slate-200 overflow-hidden">
          <div className="bg-slate-50 px-6 py-4 flex items-center justify-between border-b border-slate-200">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-orange-100 rounded-full flex items-center justify-center">
                <Receipt className="w-5 h-5 text-orange-500" />
              </div>
              <div className="text-left">
                <p className="text-slate-700 text-sm font-medium">Recent Activity</p>
                <p className="text-slate-500 text-xs">
                  Showing up to last {Math.max(1, Math.min(10, transactions.length || 5))} items
                </p>
              </div>
            </div>
            <div className="text-right text-xs text-slate-500">
              <p>{new Date().toLocaleDateString()}</p>
              <p>{new Date().toLocaleTimeString()}</p>
            </div>
          </div>

          <div className="max-h-[320px] overflow-y-auto">
            {hasTransactions ? (
              <ul>
                {transactions.map((tx, index) => {
                  const isDebit =
                    tx.type === 'Withdrawal' ||
                    tx.type === 'Transfer' ||
                    tx.type === 'Instant Payment';
                  const amountLabel =
                    typeof tx.amount === 'number'
                      ? `${isDebit ? '-' : '+'}$${tx.amount.toFixed(2)}`
                      : 'N/A';

                  return (
                    <li
                      key={index}
                      className="px-6 py-4 border-b border-slate-100 flex items-center justify-between"
                    >
                      <div>
                        <p className="text-slate-800 text-sm font-medium">{tx.type}</p>
                        {tx.recipient && (
                          <p className="text-slate-500 text-xs">
                            To: <span className="font-medium">{tx.recipient}</span>
                          </p>
                        )}
                        <p className="text-slate-400 text-xs mt-1">
                          {tx.timestamp.toLocaleString()}
                        </p>
                      </div>
                      <div className="text-right">
                        <p
                          className={`text-sm font-medium ${
                            isDebit ? 'text-red-600' : 'text-green-600'
                          }`}
                        >
                          {amountLabel}
                        </p>
                      </div>
                    </li>
                  );
                })}
              </ul>
            ) : (
              <div className="px-6 py-16 text-center text-slate-500 text-sm">
                Transactions will appear here after you perform withdrawals, transfers, instant
                payments, or standing orders.
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}


