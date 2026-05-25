import React from 'react';
import { MockChat } from '@/components/MockChat';
import { Phone } from 'lucide-react';

export function BuyerChat() {
  return (
    <div className="p-6 max-w-5xl mx-auto space-y-5">
      <div>
        <h1 className="text-2xl font-bold tracking-tight flex items-center gap-2">
          <Phone className="w-6 h-6 text-violet-500" />
          Kontakt / Wsparcie
        </h1>
        <p className="text-xs text-muted-foreground font-mono mt-0.5">
          Czat z obsługą oraz dane kontaktowe
        </p>
      </div>

      {/* Contact info bar */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {[
          { icon: '💬', label: 'Czat online', desc: 'Odpowiedź w ciągu kilku minut', badge: 'Online', badgeColor: 'bg-emerald-100 text-emerald-700' },
          { icon: '📞', label: 'Telefon', desc: '+48 22 123 45 67', badge: 'Pn–Pt 9–17', badgeColor: 'bg-blue-100 text-blue-700' },
          { icon: '📧', label: 'Email', desc: 'support@leadapp.pl', badge: '24h', badgeColor: 'bg-violet-100 text-violet-700' },
        ].map(({ icon, label, desc, badge, badgeColor }) => (
          <div key={label} className="bg-white rounded-xl border border-border p-4 flex items-center gap-4">
            <span className="text-2xl">{icon}</span>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold">{label}</p>
              <p className="text-xs text-muted-foreground font-mono truncate">{desc}</p>
            </div>
            <span className={`text-[10px] font-mono font-semibold px-2 py-0.5 rounded-full ${badgeColor}`}>{badge}</span>
          </div>
        ))}
      </div>

      <MockChat
        myName="Klient"
        myRole="user"
        singleConversationId="c1"
      />
    </div>
  );
}
