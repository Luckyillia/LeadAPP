import React from 'react';
import { MockChat } from '@/components/MockChat';
import { MessageSquare } from 'lucide-react';

export function AdminChat() {
  return (
    <MockChat
      myName="Admin"
      myRole="admin"
      title="Czat z klientami"
      subtitle="Komunikacja z kupującymi i zgłoszenia"
    />
  );
}
