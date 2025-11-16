import { useState } from 'react';
import { Delete, AlertCircle } from 'lucide-react';
import { Button } from './ui/button';

interface PinScreenProps {
  onSuccess: () => void;
  onCancel: () => void;
}

export function PinScreen({ onSuccess, onCancel }: PinScreenProps) {
  const [pin, setPin] = useState('');
  const [error, setError] = useState(false);

  const handleNumberClick = (num: string) => {
    if (pin.length < 4) {
      const newPin = pin + num;
      setPin(newPin);
      setError(false);
      
      if (newPin.length === 4) {
        // Simulate PIN verification
        setTimeout(() => {
          if (newPin === '1234') {
            onSuccess();
          } else {
            setError(true);
            setPin('');
          }
        }, 500);
      }
    }
  };

  const handleClear = () => {
    setPin('');
    setError(false);
  };

  const handleDelete = () => {
    setPin(pin.slice(0, -1));
    setError(false);
  };

  return (
    <div className="h-full flex flex-col items-center justify-center p-12">
      <div className="mb-8 text-center">
        <h2 className="text-3xl text-slate-800 mb-2">Enter Your PIN</h2>
        <p className="text-slate-600">Please enter your 4-digit PIN number</p>
        {error && (
          <div className="mt-4 flex items-center justify-center gap-2 text-red-600">
            <AlertCircle className="w-5 h-5" />
            <span>Incorrect PIN. Please try again.</span>
          </div>
        )}
      </div>

      {/* PIN Display */}
      <div className="flex gap-4 mb-12">
        {[0, 1, 2, 3].map((index) => (
          <div
            key={index}
            className={`w-16 h-16 rounded-lg border-2 flex items-center justify-center ${
              pin.length > index
                ? 'bg-blue-600 border-blue-700'
                : 'bg-white border-slate-300'
            }`}
          >
            {pin.length > index && (
              <div className="w-4 h-4 bg-white rounded-full"></div>
            )}
          </div>
        ))}
      </div>

      {/* Number Pad */}
      <div className="grid grid-cols-3 gap-4 mb-6">
        {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((num) => (
          <Button
            key={num}
            onClick={() => handleNumberClick(num.toString())}
            className="w-20 h-20 bg-white hover:bg-slate-100 text-slate-800 border-2 border-slate-300 rounded-xl text-2xl shadow-md"
            disabled={pin.length === 4}
          >
            {num}
          </Button>
        ))}
      </div>

      <div className="grid grid-cols-3 gap-4 w-full max-w-xs">
        <Button
          onClick={handleClear}
          className="w-20 h-20 bg-red-500 hover:bg-red-600 text-white border-2 border-red-600 rounded-xl shadow-md"
        >
          Clear
        </Button>
        <Button
          onClick={() => handleNumberClick('0')}
          className="w-20 h-20 bg-white hover:bg-slate-100 text-slate-800 border-2 border-slate-300 rounded-xl text-2xl shadow-md"
          disabled={pin.length === 4}
        >
          0
        </Button>
        <Button
          onClick={handleDelete}
          className="w-20 h-20 bg-orange-500 hover:bg-orange-600 text-white border-2 border-orange-600 rounded-xl shadow-md"
        >
          <Delete className="w-6 h-6" />
        </Button>
      </div>

      <div className="mt-8">
        <Button
          onClick={onCancel}
          className="bg-slate-300 hover:bg-slate-400 text-slate-800 px-8 py-3 rounded-lg"
        >
          Cancel
        </Button>
      </div>

      <div className="mt-6 text-slate-500 text-sm text-center">
        <p>Demo PIN: 1234</p>
      </div>
    </div>
  );
}
