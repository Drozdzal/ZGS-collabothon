import React, { useEffect, useState } from 'react';
import { useVoiceAssistant } from './context/VoiceAssistantContext';
import type { VoiceCommand } from './api/voiceClient';
import { Button } from './components/ui/button';
import { Mic } from 'lucide-react';
import { WelcomeScreen } from './components/WelcomeScreen';
import { PinScreen } from './components/PinScreen';
import { MainMenuScreen } from './components/MainMenuScreen';
import { WithdrawalScreen } from './components/WithdrawalScreen';
import { BalanceScreen } from './components/BalanceScreen';
import { TransferScreen } from './components/TransferScreen';
import { StandingOrderScreen } from './components/StandingOrderScreen';
import { DocumentScanScreen } from './components/DocumentScanScreen';
import { ReceiptScreen } from './components/ReceiptScreen';
import { ContactsScreen } from './components/ContactsScreen';
import { MiniStatementScreen } from './components/MiniStatementScreen';

export type Screen = 
  | 'welcome' 
  | 'pin' 
  | 'menu' 
  | 'withdrawal' 
  | 'balance' 
  | 'transfer' 
  | 'miniStatement'
  | 'standingOrders'
  | 'documentScan'
  | 'contacts'
  | 'receipt';

export type Transaction = {
  type: string;
  amount?: number;
  recipient?: string;
  timestamp: Date;
  frequency?: string;
};

export type Contact = {
  id: number;
  name: string;
  accountNumber: string;
};

export default function App() {
  const [currentScreen, setCurrentScreen] = useState<Screen>('welcome');
  const [accountBalance, setAccountBalance] = useState(12547.89);
  const [lastTransaction, setLastTransaction] = useState<Transaction | null>(null);
  const [transactions, setTransactions] = useState<Transaction[]>([
    {
      type: 'Withdrawal',
      amount: 120,
      timestamp: new Date(Date.now() - 1000 * 60 * 60 * 24 * 1)
    },
    {
      type: 'Transfer',
      amount: 250,
      recipient: 'Rent – Landlord',
      timestamp: new Date(Date.now() - 1000 * 60 * 60 * 24 * 3)
    },
    {
      type: 'Instant Payment',
      amount: 40,
      recipient: 'Coffee Shop',
      timestamp: new Date(Date.now() - 1000 * 60 * 60 * 24 * 5)
    },
    {
      type: 'Standing Order',
      amount: 60,
      recipient: 'Gym Membership',
      frequency: 'Monthly',
      timestamp: new Date(Date.now() - 1000 * 60 * 60 * 24 * 10)
    }
  ]);
  const [contacts, setContacts] = useState<Contact[]>([
    { id: 1, name: 'Electricity Company', accountNumber: '555500001234' },
    { id: 2, name: 'Landlord', accountNumber: '555500004321' }
  ]);
  const [pendingVoiceTransfer, setPendingVoiceTransfer] = useState<{
    amount: number;
    recipientAccount: string;
  } | null>(null);

  const { speak, listenAndInterpret } = useVoiceAssistant();
  const [hasGreeted, setHasGreeted] = useState(false);

  const handleWithdraw = (amount: number) => {
    const tx: Transaction = {
      type: 'Withdrawal',
      amount,
      timestamp: new Date()
    };
    setAccountBalance(prev => prev - amount);
    setLastTransaction(tx);
    setTransactions(prev => [tx, ...prev].slice(0, 10));
    setCurrentScreen('receipt');
  };

  const handleTransfer = (amount: number, recipient: string) => {
    const tx: Transaction = {
      type: 'Transfer',
      amount,
      recipient,
      timestamp: new Date()
    };
    setAccountBalance(prev => prev - amount);
    setLastTransaction(tx);
    setTransactions(prev => [tx, ...prev].slice(0, 10));
    setCurrentScreen('receipt');
  };

  const handleInstantPayment = (amount: number, recipient: string) => {
    const tx: Transaction = {
      type: 'Instant Payment',
      amount,
      recipient,
      timestamp: new Date()
    };
    setAccountBalance(prev => prev - amount);
    setLastTransaction(tx);
    setTransactions(prev => [tx, ...prev].slice(0, 10));
    setCurrentScreen('receipt');
  };

  const handleStandingOrder = (amount: number, recipient: string, frequency: string) => {
    const tx: Transaction = {
      type: 'Standing Order',
      amount,
      recipient,
      frequency,
      timestamp: new Date()
    };
    setLastTransaction(tx);
    setTransactions(prev => [tx, ...prev].slice(0, 10));
    setCurrentScreen('receipt');
  };

  const handleVoiceCommand = (cmd: VoiceCommand, transcript: string) => {
    if (cmd.intent === 'transfer' && cmd.amount && cmd.recipient_name) {
      // Find contact by name if possible
      const contact = contacts.find(
        (c) => c.name.toLowerCase() === cmd.recipient_name!.toLowerCase()
      );
      const recipientAccount = contact?.accountNumber ?? '555500004321';
      setPendingVoiceTransfer({
        amount: cmd.amount,
        recipientAccount
      });
      setCurrentScreen('transfer');
      speak('I have prepared a transfer. Say "I confirm" or press the button to complete it.');
    } else if (cmd.intent === 'show_balance') {
      setCurrentScreen('balance');
    } else if (cmd.intent === 'show_mini_statement') {
      setCurrentScreen('miniStatement');
    } else if (cmd.intent === 'show_standing_orders') {
      setCurrentScreen('standingOrders');
    } else if (cmd.intent === 'exit') {
      handleExit();
    } else if (cmd.intent === 'confirm' && pendingVoiceTransfer) {
      handleTransfer(pendingVoiceTransfer.amount, pendingVoiceTransfer.recipientAccount);
      setPendingVoiceTransfer(null);
    } else {
      speak("Sorry, I didn't understand. Please try again.");
    }
  };

  const triggerVoiceInteraction = () => {
    listenAndInterpret(handleVoiceCommand);
  };

  useEffect(() => {
    if (currentScreen === 'menu' && !hasGreeted) {
      speak('Good morning, I am ATM 2.0. Tell me, how can I help you?');
      listenAndInterpret(handleVoiceCommand);
      setHasGreeted(true);
    }
  }, [currentScreen, hasGreeted, speak, listenAndInterpret]);

  const handleScannedPayment = (data: {
    paymentType: 'instant' | 'standard' | 'standing_order';
    recipientName: string;
    recipientAccount: string;
    amount: number;
    reference: string;
    dueDate: string | null;
  }) => {
    if (data.paymentType === 'standing_order') {
      handleStandingOrder(data.amount, data.recipientAccount, 'Monthly');
    } else if (data.paymentType === 'standard') {
      handleTransfer(data.amount, data.recipientAccount);
    } else {
      handleInstantPayment(data.amount, data.recipientAccount);
    }
  };

  const handleAddContact = (name: string, accountNumber: string) => {
    const trimmedName = name.trim();
    const trimmedAccount = accountNumber.trim();
    if (!trimmedName || !trimmedAccount) return;

    setContacts((prev) => {
      const exists = prev.some(
        (c) =>
          c.accountNumber === trimmedAccount &&
          c.name.toLowerCase() === trimmedName.toLowerCase()
      );
      if (exists) return prev;
      return [
        ...prev,
        {
          id: Date.now(),
          name: trimmedName,
          accountNumber: trimmedAccount
        }
      ];
    });
  };

  const handleExit = () => {
    setCurrentScreen('welcome');
    setLastTransaction(null);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center p-4">
      <div className="w-full max-w-4xl">
        {/* ATM Machine Frame */}
        <div className="bg-gradient-to-b from-slate-700 to-slate-800 rounded-3xl shadow-2xl p-8 border-4 border-slate-600">
          {/* Screen Container */}
          <div className="bg-black rounded-2xl p-6 mb-8 shadow-inner border-4 border-slate-900">
            <div className="bg-gradient-to-br from-blue-50 to-slate-50 rounded-xl min-h-[600px] shadow-lg">
              {currentScreen === 'welcome' && (
                <WelcomeScreen onCardInserted={() => setCurrentScreen('pin')} />
              )}
              {currentScreen === 'pin' && (
                <PinScreen onSuccess={() => setCurrentScreen('menu')} onCancel={() => setCurrentScreen('welcome')} />
              )}
              {currentScreen === 'menu' && (
                <MainMenuScreen 
                  onSelectWithdrawal={() => setCurrentScreen('withdrawal')}
                  onSelectBalance={() => setCurrentScreen('balance')}
                  onSelectTransfer={() => setCurrentScreen('transfer')}
                  onSelectMiniStatement={() => setCurrentScreen('miniStatement')}
                  onSelectStandingOrders={() => setCurrentScreen('standingOrders')}
                  onSelectDocumentScan={() => setCurrentScreen('documentScan')}
                  onSelectContacts={() => setCurrentScreen('contacts')}
                  onSpeakCommand={triggerVoiceInteraction}
                  onExit={handleExit}
                />
              )}
              {currentScreen === 'withdrawal' && (
                <WithdrawalScreen 
                  onWithdraw={handleWithdraw}
                  onBack={() => setCurrentScreen('menu')}
                  currentBalance={accountBalance}
                />
              )}
              {currentScreen === 'balance' && (
                <BalanceScreen 
                  balance={accountBalance}
                  onBack={() => setCurrentScreen('menu')}
                />
              )}
              {currentScreen === 'transfer' && (
                <TransferScreen 
                  onTransfer={handleTransfer}
                  onInstantPayment={handleInstantPayment}
                  contacts={contacts}
                  onAddContact={handleAddContact}
                  onBack={() => setCurrentScreen('menu')}
                  currentBalance={accountBalance}
                  prefillAmount={pendingVoiceTransfer?.amount}
                  prefillRecipientAccount={pendingVoiceTransfer?.recipientAccount}
                />
              )}
              {currentScreen === 'standingOrders' && (
                <StandingOrderScreen
                  onStandingOrder={handleStandingOrder}
                  contacts={contacts}
                  onAddContact={handleAddContact}
                  onBack={() => setCurrentScreen('menu')}
                  currentBalance={accountBalance}
                />
              )}
              {currentScreen === 'documentScan' && (
                <DocumentScanScreen
                  onBack={() => setCurrentScreen('menu')}
                  onSubmitPayment={handleScannedPayment}
                />
              )}
              {currentScreen === 'miniStatement' && (
                <MiniStatementScreen
                  transactions={transactions}
                  balance={accountBalance}
                  onBack={() => setCurrentScreen('menu')}
                />
              )}
              {currentScreen === 'contacts' && (
                <ContactsScreen
                  contacts={contacts}
                  onBack={() => setCurrentScreen('menu')}
                />
              )}
              {currentScreen === 'receipt' && (
                <ReceiptScreen 
                  transaction={lastTransaction}
                  balance={accountBalance}
                  onNewTransaction={() => setCurrentScreen('menu')}
                  onExit={handleExit}
                />
              )}
            </div>
          </div>

          {/* Global voice command trigger, visible on all screens */}
          <div className="mb-4 flex justify-center">
            <Button
              onClick={triggerVoiceInteraction}
              className="bg-slate-200 hover:bg-slate-300 text-slate-800 rounded-full px-6 py-2 flex items-center gap-2"
            >
              <Mic className="w-4 h-4" />
              <span>Speak command</span>
            </Button>
          </div>

        </div>

        {/* Bank Branding */}
        <div className="text-center mt-6 text-slate-400 text-sm">
          Bank ATM • 24/7 Service • Emergency: 1-800-BANK-HELP
        </div>
      </div>
    </div>
  );
}
