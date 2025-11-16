import { ArrowLeft, User } from 'lucide-react';
import { Button } from './ui/button';
import type { Contact } from '../App';

interface ContactsScreenProps {
  contacts: Contact[];
  onBack: () => void;
}

export function ContactsScreen({ contacts, onBack }: ContactsScreenProps) {
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
        <User className="w-16 h-16 text-slate-700 mx-auto mb-4" />
        <h2 className="text-3xl text-slate-800 mb-2">Contacts</h2>
        <p className="text-slate-600">
          Saved recipients for quick transfers and payments
        </p>
      </div>

      <div className="flex-1 max-w-2xl mx-auto w-full">
        <div className="bg-white rounded-xl p-6 shadow-lg border-2 border-slate-200">
          {contacts.length === 0 ? (
            <p className="text-slate-500 text-sm text-center">
              You don&apos;t have any contacts yet. Add one from the Transfer screen after
              entering a recipient name and account number.
            </p>
          ) : (
            <ul className="space-y-3">
              {contacts.map((contact) => (
                <li key={contact.id}>
                  <div className="flex items-center justify-between bg-slate-50 rounded-lg px-4 py-3 border border-slate-200">
                    <div>
                      <p className="text-slate-800 font-medium">{contact.name}</p>
                      <p className="text-slate-500 text-xs">
                        {contact.accountNumber}
                      </p>
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>

      <div className="mt-6 text-center text-slate-500 text-sm">
        <p>Tip: Use contacts to avoid typing long account numbers every time.</p>
      </div>
    </div>
  );
}


