import { useEffect, useState } from 'react';
import { ArrowRightLeft, ArrowLeft, AlertCircle, User } from 'lucide-react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import type { Contact } from '../App';

interface TransferScreenProps {
  onTransfer: (amount: number, recipient: string) => void;
  onInstantPayment: (amount: number, recipient: string) => void;
  contacts: Contact[];
  onAddContact: (name: string, accountNumber: string) => void;
  onBack: () => void;
  currentBalance: number;
  prefillAmount?: number;
  prefillRecipientAccount?: string;
}

export function TransferScreen({
  onTransfer,
  onInstantPayment,
  contacts,
  onAddContact,
  onBack,
  currentBalance,
  prefillAmount,
  prefillRecipientAccount
}: TransferScreenProps) {
  const [recipient, setRecipient] = useState('');
  const [amount, setAmount] = useState('');
  const [error, setError] = useState('');
  const [contactName, setContactName] = useState('');

  useEffect(() => {
    if (prefillRecipientAccount) {
      setRecipient(prefillRecipientAccount);
    }
    if (typeof prefillAmount === 'number') {
      setAmount(prefillAmount.toString());
    }
  }, [prefillRecipientAccount, prefillAmount]);

  const validateAndGetAmount = () => {
    const transferAmount = parseFloat(amount);

    if (!recipient.trim()) {
      setError('Please enter recipient account number');
      return null;
    }
    if (isNaN(transferAmount) || transferAmount <= 0) {
      setError('Please enter a valid amount');
      return null;
    }
    if (transferAmount > currentBalance) {
      setError('Insufficient funds');
      return null;
    }

    setError('');
    return transferAmount;
  };

  const handleStandardTransfer = () => {
    const value = validateAndGetAmount();
    if (value === null) return;
    maybeSaveContact();
    onTransfer(value, recipient);
  };

  const handleInstantPaymentClick = () => {
    const value = validateAndGetAmount();
    if (value === null) return;
    maybeSaveContact();
    onInstantPayment(value, recipient);
  };

  const maybeSaveContact = () => {
    if (contactName.trim()) {
      onAddContact(contactName, recipient);
    }
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
        <ArrowRightLeft className="w-16 h-16 text-purple-600 mx-auto mb-4" />
        <h2 className="text-3xl text-slate-800 mb-2">Transfer Funds</h2>
        <p className="text-slate-600">Transfer money to another account</p>
        {error && (
          <div className="mt-4 flex items-center justify-center gap-2 text-red-600">
            <AlertCircle className="w-5 h-5" />
            <span>{error}</span>
          </div>
        )}
      </div>

      {/* Transfer Form */}
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
          <label className="block text-slate-700 mb-3">Transfer Amount</label>
          <div className="relative">
            <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-600 text-xl">$</span>
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

        {/* Quick Amounts */}
        <div className="grid grid-cols-4 gap-3">
          {[50, 100, 200, 500].map((quickAmount) => (
            <Button
              key={quickAmount}
              onClick={() => {
                setAmount(quickAmount.toString());
                setError('');
              }}
              className="bg-purple-100 hover:bg-purple-200 text-purple-700 rounded-lg h-12"
            >
              ${quickAmount}
            </Button>
          ))}
        </div>

        {/* Action Buttons */}
        <div className="grid grid-cols-1 gap-3">
          <Button
            onClick={handleStandardTransfer}
            className="w-full bg-purple-600 hover:bg-purple-700 text-white h-14 rounded-xl text-lg shadow-lg"
          >
            Standard Transfer
          </Button>
          <Button
            onClick={handleInstantPaymentClick}
            className="w-full bg-green-600 hover:bg-green-700 text-white h-14 rounded-xl text-lg shadow-lg"
          >
            Instant Payment
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
              No contacts saved yet. Enter an account number and name above, then make a payment to
              save it here.
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

      <div className="mt-6 text-center text-slate-500 text-sm">
        <p>Maximum transfer: $5,000 per transaction</p>
        <p>Transfers are processed immediately</p>
      </div>
    </div>
  );
}
