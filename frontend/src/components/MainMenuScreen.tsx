import React from 'react';
import { Wallet, Eye, ArrowRightLeft, Receipt, LogOut, User, RefreshCcw, FileText, Mic } from 'lucide-react';
import { Button } from './ui/button';
import { useVoiceAssistant } from '../context/VoiceAssistantContext';

interface MainMenuScreenProps {
  onSelectWithdrawal: () => void;
  onSelectBalance: () => void;
  onSelectTransfer: () => void;
  onSelectMiniStatement: () => void;
  onSelectStandingOrders: () => void;
  onSelectContacts: () => void;
  onSelectDocumentScan: () => void;
  onSpeakCommand: () => void;
  onExit: () => void;
}

export function MainMenuScreen({
  onSelectWithdrawal,
  onSelectBalance,
  onSelectTransfer,
  onSelectMiniStatement,
  onSelectStandingOrders,
  onSelectContacts,
  onSelectDocumentScan,
  onSpeakCommand,
  onExit
}: MainMenuScreenProps) {
  const { error } = useVoiceAssistant();
  const menuItems = [
    {
      icon: Wallet,
      label: 'Withdrawal',
      description: 'Withdraw cash',
      color: 'bg-blue-500 hover:bg-blue-600',
      onClick: onSelectWithdrawal
    },
    {
      icon: Eye,
      label: 'Balance Inquiry',
      description: 'Check your balance',
      color: 'bg-green-500 hover:bg-green-600',
      onClick: onSelectBalance
    },
    {
      icon: ArrowRightLeft,
      label: 'Transfer',
      description: 'Transfer funds',
      color: 'bg-purple-500 hover:bg-purple-600',
      onClick: onSelectTransfer
    },
    {
      icon: Receipt,
      label: 'Mini Statement',
      description: 'Last transactions',
      color: 'bg-orange-500 hover:bg-orange-600',
      onClick: onSelectMiniStatement
    },
    {
      icon: RefreshCcw,
      label: 'Standing Orders',
      description: 'Scheduled payments',
      color: 'bg-slate-900 hover:bg-slate-800',
      onClick: onSelectStandingOrders
    },
    {
      icon: FileText,
      label: 'Document Scan',
      description: 'Scan payment slip',
      color: 'bg-slate-600 hover:bg-slate-600',
      onClick: onSelectDocumentScan
    },
    {
      icon: User,
      label: 'Contacts',
      description: 'Saved recipients',
      color: 'bg-slate-500 hover:bg-slate-600',
      onClick: onSelectContacts
    },
    {
      icon: LogOut,
      label: 'Exit',
      description: 'Eject card & exit',
      color: 'bg-red-500 hover:bg-red-600',
      onClick: onExit
    }
  ];

  return (
    <div className="h-full flex flex-col p-12">
      <div className="text-center mb-8">
        <h2 className="text-3xl text-slate-800 mb-2">Main Menu</h2>
        <p className="text-slate-600">Please select a transaction</p>
      </div>

      {/* <div className="mb-4 flex justify-center">
        <Button
          onClick={onSpeakCommand}
          className="bg-slate-200 hover:bg-slate-300 text-slate-800 rounded-full px-6 py-2 flex items-center gap-2"
        >
          <Mic className="w-4 h-4" />
          <span>Speak command</span>
        </Button>
      </div> */}

      <div className="grid grid-cols-2 gap-6 flex-1">
        {menuItems.map((item, index) => (
          <Button
            key={index}
            onClick={item.onClick}
            className={`${item.color} text-white rounded-xl shadow-lg h-full flex flex-col items-center justify-center p-6 gap-3 transition-transform hover:scale-105`}
          >
            <item.icon className="w-16 h-16" />
            <div>
              <div className="text-xl mb-1">{item.label}</div>
              <div className="text-sm opacity-90">{item.description}</div>
            </div>
          </Button>
        ))}
      </div>

      <div className="mt-6 text-center text-slate-500 text-sm">
        <p>Session will timeout in 2:00 minutes</p>
      </div>
    </div>
  );
}
