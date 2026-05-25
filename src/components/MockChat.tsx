import React, { useState, useRef, useEffect } from 'react';
import { cn } from '@/lib/utils';
import { Send, Phone, Paperclip, Circle } from 'lucide-react';

interface Message {
  id: string;
  from: string;
  fromRole: 'admin' | 'user';
  text: string;
  time: string;
}

interface Conversation {
  id: string;
  name: string;
  role: string;
  avatar: string;
  online: boolean;
  unread: number;
  lastMessage: string;
  lastTime: string;
  messages: Message[];
}

const MOCK_CONVERSATIONS: Conversation[] = [
  {
    id: 'c1',
    name: 'Marek Dąbrowski',
    role: 'Kupujący',
    avatar: 'MD',
    online: true,
    unread: 2,
    lastMessage: 'Kiedy dostanę kolejne leady?',
    lastTime: '10:42',
    messages: [
      { id: 'm1', from: 'Marek Dąbrowski', fromRole: 'user', text: 'Dzień dobry, chciałem zapytać o status moich reklamacji.', time: '10:30' },
      { id: 'm2', from: 'Admin', fromRole: 'admin', text: 'Dzień dobry! Właśnie sprawdzam — reklamacja dla leadu lead-6 jest w trakcie rozpatrywania.', time: '10:35' },
      { id: 'm3', from: 'Marek Dąbrowski', fromRole: 'user', text: 'Rozumiem, a ile to potrwa?', time: '10:38' },
      { id: 'm4', from: 'Admin', fromRole: 'admin', text: 'Standardowo 1-2 dni robocze. Dam znać jak tylko będzie decyzja.', time: '10:40' },
      { id: 'm5', from: 'Marek Dąbrowski', fromRole: 'user', text: 'Kiedy dostanę kolejne leady?', time: '10:42' },
    ],
  },
  {
    id: 'c2',
    name: 'Jan Kowalski',
    role: 'Kupujący',
    avatar: 'JK',
    online: false,
    unread: 0,
    lastMessage: 'Dziękuję za odpowiedź',
    lastTime: 'wczoraj',
    messages: [
      { id: 'm1', from: 'Jan Kowalski', fromRole: 'user', text: 'Mam pytanie o fakturę za ostatni miesiąc.', time: '09:00' },
      { id: 'm2', from: 'Admin', fromRole: 'admin', text: 'Faktura została wysłana na Twój email w dniu 1. każdego miesiąca.', time: '09:15' },
      { id: 'm3', from: 'Jan Kowalski', fromRole: 'user', text: 'Dziękuję za odpowiedź', time: '09:20' },
    ],
  },
  {
    id: 'c3',
    name: 'Anna Wiśniewska',
    role: 'Kupujący',
    avatar: 'AW',
    online: true,
    unread: 1,
    lastMessage: 'Czy mogę zwiększyć limit leadów?',
    lastTime: '09:15',
    messages: [
      { id: 'm1', from: 'Anna Wiśniewska', fromRole: 'user', text: 'Czy mogę zwiększyć limit leadów?', time: '09:15' },
    ],
  },
];

interface MockChatProps {
  myName: string;
  myRole: 'admin' | 'user';
  title?: string;
  subtitle?: string;
  /** If set, only show this conversation (buyer view) */
  singleConversationId?: string;
}

export function MockChat({ myName, myRole, title = 'Czat', subtitle, singleConversationId }: MockChatProps) {
  const conversations = singleConversationId
    ? MOCK_CONVERSATIONS.filter(c => c.id === singleConversationId)
    : MOCK_CONVERSATIONS;

  const [activeId, setActiveId] = useState(conversations[0]?.id ?? '');
  const [allConvs, setAllConvs] = useState<Conversation[]>(MOCK_CONVERSATIONS);
  const [input, setInput] = useState('');
  const bottomRef = useRef<HTMLDivElement>(null);

  const active = allConvs.find(c => c.id === activeId);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [active?.messages.length]);

  const sendMessage = () => {
    const text = input.trim();
    if (!text || !active) return;
    const msg: Message = {
      id: `m${Date.now()}`,
      from: myName,
      fromRole: myRole,
      text,
      time: new Date().toLocaleTimeString('pl-PL', { hour: '2-digit', minute: '2-digit' }),
    };
    setAllConvs(prev => prev.map(c =>
      c.id === activeId
        ? { ...c, messages: [...c.messages, msg], lastMessage: text, lastTime: msg.time, unread: 0 }
        : c
    ));
    setInput('');
  };

  const handleKey = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); sendMessage(); }
  };

  const visibleConvs = singleConversationId
    ? allConvs.filter(c => c.id === singleConversationId)
    : allConvs;

  return (
    <div className="p-6 max-w-6xl mx-auto space-y-4">
      {title && (
        <div>
          <h1 className="text-2xl font-bold tracking-tight">{title}</h1>
          {subtitle && <p className="text-xs text-muted-foreground font-mono mt-0.5">{subtitle}</p>}
        </div>
      )}

      <div className="bg-white rounded-2xl border border-border overflow-hidden flex h-[600px]">
        {/* Sidebar — conversation list */}
        {!singleConversationId && (
          <div className="w-64 border-r border-border flex flex-col shrink-0">
            <div className="p-4 border-b border-border">
              <p className="text-xs font-mono text-muted-foreground uppercase tracking-wide">Konwersacje</p>
            </div>
            <div className="flex-1 overflow-y-auto">
              {visibleConvs.map(conv => (
                <button
                  key={conv.id}
                  onClick={() => {
                    setActiveId(conv.id);
                    setAllConvs(prev => prev.map(c => c.id === conv.id ? { ...c, unread: 0 } : c));
                  }}
                  className={cn(
                    'w-full text-left px-4 py-3 flex items-start gap-3 border-b border-border/50 transition-colors',
                    activeId === conv.id ? 'bg-primary/5 border-l-2 border-l-primary' : 'hover:bg-muted/40'
                  )}
                >
                  <div className="relative shrink-0">
                    <div className="w-9 h-9 rounded-full bg-primary/10 text-primary font-bold text-xs flex items-center justify-center">
                      {conv.avatar}
                    </div>
                    {conv.online && (
                      <span className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 bg-emerald-500 rounded-full border-2 border-white" />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <p className="text-xs font-semibold truncate">{conv.name}</p>
                      <span className="text-[10px] text-muted-foreground font-mono shrink-0 ml-1">{conv.lastTime}</span>
                    </div>
                    <p className="text-[11px] text-muted-foreground truncate mt-0.5">{conv.lastMessage}</p>
                  </div>
                  {conv.unread > 0 && (
                    <span className="bg-primary text-white text-[10px] font-bold rounded-full w-4 h-4 flex items-center justify-center shrink-0 mt-0.5">
                      {conv.unread}
                    </span>
                  )}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Main chat area */}
        <div className="flex-1 flex flex-col min-w-0">
          {active ? (
            <>
              {/* Chat header */}
              <div className="px-5 py-3.5 border-b border-border flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="relative">
                    <div className="w-8 h-8 rounded-full bg-primary/10 text-primary font-bold text-xs flex items-center justify-center">
                      {active.avatar}
                    </div>
                    {active.online && (
                      <span className="absolute -bottom-0.5 -right-0.5 w-2 h-2 bg-emerald-500 rounded-full border border-white" />
                    )}
                  </div>
                  <div>
                    <p className="text-sm font-semibold">{active.name}</p>
                    <p className="text-xs text-muted-foreground flex items-center gap-1">
                      <Circle className={cn('w-1.5 h-1.5 fill-current', active.online ? 'text-emerald-500' : 'text-muted-foreground')} />
                      {active.online ? 'Online' : 'Offline'} · {active.role}
                    </p>
                  </div>
                </div>
                <button className="flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground border border-border rounded-lg px-3 py-1.5 transition-colors">
                  <Phone className="w-3.5 h-3.5" />
                  Zadzwoń
                </button>
              </div>

              {/* Messages */}
              <div className="flex-1 overflow-y-auto px-5 py-4 space-y-3">
                {active.messages.map(msg => {
                  const isMe = msg.fromRole === myRole;
                  return (
                    <div key={msg.id} className={cn('flex gap-2', isMe ? 'justify-end' : 'justify-start')}>
                      {!isMe && (
                        <div className="w-7 h-7 rounded-full bg-muted text-muted-foreground font-bold text-xs flex items-center justify-center shrink-0 mt-0.5">
                          {active.avatar}
                        </div>
                      )}
                      <div className={cn('max-w-[70%]', isMe ? 'items-end' : 'items-start', 'flex flex-col gap-0.5')}>
                        <div className={cn(
                          'px-3.5 py-2.5 rounded-2xl text-sm leading-relaxed',
                          isMe
                            ? 'bg-primary text-primary-foreground rounded-tr-sm'
                            : 'bg-muted text-foreground rounded-tl-sm'
                        )}>
                          {msg.text}
                        </div>
                        <span className="text-[10px] text-muted-foreground font-mono px-1">{msg.time}</span>
                      </div>
                    </div>
                  );
                })}
                <div ref={bottomRef} />
              </div>

              {/* Input */}
              <div className="px-4 py-3 border-t border-border flex items-end gap-2">
                <button className="text-muted-foreground hover:text-foreground p-2 rounded-lg hover:bg-muted transition-colors">
                  <Paperclip className="w-4 h-4" />
                </button>
                <textarea
                  className="flex-1 resize-none text-sm border border-input rounded-xl px-3 py-2.5 bg-white focus:outline-none focus:ring-2 focus:ring-ring max-h-24 min-h-[40px]"
                  placeholder="Napisz wiadomość..."
                  rows={1}
                  value={input}
                  onChange={e => setInput(e.target.value)}
                  onKeyDown={handleKey}
                />
                <button
                  onClick={sendMessage}
                  disabled={!input.trim()}
                  className="bg-primary text-white p-2.5 rounded-xl hover:bg-blue-600 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
                >
                  <Send className="w-4 h-4" />
                </button>
              </div>
            </>
          ) : (
            <div className="flex-1 flex items-center justify-center text-muted-foreground text-sm">
              Wybierz konwersację
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
