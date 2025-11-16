import { useState } from 'react';
import { ArrowLeft, RefreshCcw, AlertCircle, User } from 'lucide-react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import type { Contact } from '../App';

interface StandingOrderScreenProps {
  onStandingOrder: (amount: number, recipient: string, frequency: string) => void;
  contacts: Contact[];
  onAddContact: (name: string, accountNumber: string) => void;
  onBack: () => void;
  currentBalance: number;
}

export function StandingOrderScreen({
  onStandingOrder,
  contacts,
  onAddContact,
  onBack,
  currentBalance
}: StandingOrderScreenProps) {
  const [recipient, setRecipient] = useState('');
  const [amount, setAmount] = useState('');
  const [frequency, setFrequency] = useState('Monthly');
  const [contactName, setContactName] = useState('');
  const [error, setError] = useState('');

  const validateAndGetAmount = () => {
    const value = parseFloat(amount);

    if (!recipient.trim()) {
      setError('Please enter recipient account number');
      return null;
    }
    if (isNaN(value) || value <= 0) {
      setError('Please enter a valid amount');
      return null;
    }
    if (value > currentBalance) {
      setError('Amount exceeds current balance. Remember, standing orders are scheduled.');
      return null;
    }

    setError('');
    return value;
  };

  const handleCreateStandingOrder = () => {
    const value = validateAndGetAmount();
    if (value === null) return;

    if (contactName.trim()) {
      onAddContact(contactName, recipient);
    }

    onStandingOrder(value, recipient, frequency);
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
          <p className="text-slate-600 text-sm">Current Balance</p>
          <p className="text-2xl text-green-600">${currentBalance.toFixed(2)}</p>
        </div>
      </div>

      <div className="text-center mb-8">
        <RefreshCcw className="w-16 h-16 text-orange-500 mx-auto mb-4" />
        <h2 className="text-3xl text-slate-800 mb-2">Standing Orders</h2>
        <p className="text-slate-600">
          Schedule automatic recurring payments to your regular recipients
        </p>
        {error && (
          <div className="mt-4 flex items-center justify-center gap-2 text-red-600">
            <AlertCircle className="w-5 h-5" />
            <span>{error}</span>
          </div>
        )}
      </div>

      <div className="space-y-6 max-w-2xl mx-auto w-full">
        {/* Recipient */}
        <div className="bg-white rounded-xl p-6 shadow-lg border-2 border-slate-200">
          <label className="block text-slate-700 mb-3">Recipient Account Number</label>
          <Input
            type="text"
            value={recipient}
            onChange={(e) => {
              setRecipient(e.target.value);
              setError('');
            }}
            placeholder="Enter account number"
            className="h-14 text-xl"
            maxLength={16}
          />
          <label className="block text-slate-700 mt-4 mb-2 text-sm">
            Save as contact (name)
          </label>
          <Input
            type="text"
            value={contactName}
            onChange={(e) => setContactName(e.target.value)}
            placeholder="e.g. Landlord, Electricity Company"
            className="h-12 text-base"
            maxLength={40}
          />
        </div>

        {/* Amount */}
        <div className="bg-white rounded-xl p-6 shadow-lg border-2 border-slate-200">
          <label className="block text-slate-700 mb-3">Standing order amount</label>
          <div className="relative">
            <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-600 text-xl">
              $
            </span>
            <Input
              type="number"
              value={amount}
              onChange={(e) => {
                setAmount(e.target.value);
                setError('');
              }}
              placeholder="0.00"
              className="pl-8 h-14 text-xl"
            />
          </div>
        </div>

        {/* Frequency */}
        <div className="bg-white rounded-xl p-6 shadow-lg border-2 border-slate-200">
          <label className="block text-slate-700 mb-3">Standing order frequency</label>
          <select
            className="w-full h-12 border-2 border-slate-300 rounded-lg px-3 text-slate-800 bg-white"
            value={frequency}
            onChange={(e) => setFrequency(e.target.value)}
          >
            <option>Weekly</option>
            <option>Bi-weekly</option>
            <option>Monthly</option>
            <option>Quarterly</option>
          </select>
          <p className="mt-2 text-xs text-slate-500">
            The payment will be taken automatically on each due date.
          </p>
        </div>

        {/* Action Button */}
        <div className="grid grid-cols-1 gap-3">
          <Button
            onClick={handleCreateStandingOrder}
            className="w-full bg-orange-500 hover:bg-orange-600 text-white h-14 rounded-xl text-lg shadow-lg"
          >
            Create Standing Order
          </Button>
        </div>
      </div>

      {/* Contacts book */}
      <div className="mt-6 max-w-2xl mx-auto w-full">
        <div className="bg-white rounded-xl p-6 shadow-lg border-2 border-slate-200">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <User className="w-5 h-5 text-slate-700" />
              <span className="text-slate-700 text-sm font-medium">Saved contacts</span>
            </div>
          </div>
          {contacts.length === 0 ? (
            <p className="text-slate-500 text-sm">
              No contacts saved yet. Enter an account number and name above, then create a standing
              order to save it here.
            </p>
          ) : (
            <ul className="space-y-2">
              {contacts.map((contact) => (
                <li key={contact.id}>
                  <Button
                    type="button"
                    onClick={() => {
                      setRecipient(contact.accountNumber);
                      setContactName(contact.name);
                      setError('');
                    }}
                    className="w-full justify-between bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-lg px-4 py-3"
                  >
                    <span className="font-medium">{contact.name}</span>
                    <span className="text-xs text-slate-600">
                      {contact.accountNumber}
                    </span>
                  </Button>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </div>
  );
}


