import { CreditCard, Shield, Clock } from 'lucide-react';
import { Button } from './ui/button';

interface WelcomeScreenProps {
  onCardInserted: () => void;
}

export function WelcomeScreen({ onCardInserted }: WelcomeScreenProps) {
  return (
    <div className="h-full flex flex-col items-center justify-center p-12 text-center">
      <div className="mb-8">
        <div className="bg-gradient-to-r from-blue-600 to-blue-800 text-white px-8 py-4 rounded-2xl shadow-lg inline-block">
          <h1 className="text-4xl mb-1">Bank</h1>
          <p className="text-blue-200 text-sm">Your Trusted Banking Partner</p>
        </div>
      </div>

      <div className="mb-12 animate-pulse">
        <CreditCard className="w-24 h-24 text-blue-600 mx-auto mb-4" />
        <p className="text-slate-700 text-xl">Please insert your card</p>
      </div>

      <div className="grid grid-cols-3 gap-6 w-full max-w-2xl mb-8">
        <div className="flex flex-col items-center p-4">
          <Shield className="w-12 h-12 text-green-600 mb-2" />
          <p className="text-slate-600 text-sm">Secure Transactions</p>
        </div>
        <div className="flex flex-col items-center p-4">
          <Clock className="w-12 h-12 text-blue-600 mb-2" />
          <p className="text-slate-600 text-sm">24/7 Available</p>
        </div>
        <div className="flex flex-col items-center p-4">
          <CreditCard className="w-12 h-12 text-purple-600 mb-2" />
          <p className="text-slate-600 text-sm">Fast Service</p>
        </div>
      </div>

      {/* Simulate card insertion */}
      <Button 
        onClick={onCardInserted}
        className="bg-blue-600 hover:bg-blue-700 text-white px-12 py-6 rounded-xl text-lg shadow-lg"
      >
        Simulate Card Insert
      </Button>

      <div className="mt-8 text-slate-500 text-xs">
        <p>This ATM accepts all major cards</p>
        <p>Visa • Mastercard • Maestro • Plus</p>
      </div>
    </div>
  );
}
