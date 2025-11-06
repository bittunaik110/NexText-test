import { useState } from 'react'
import ChatWindow from '../ChatWindow'

type Message = {
  id: string;
  text: string;
  sent: boolean;
  timestamp: Date;
  status?: "sent" | "delivered" | "read";
};

export default function ChatWindowExample() {
  const now = new Date();
  const [messages, setMessages] = useState<Message[]>([
    { id: '1', text: 'Hey! How are you?', sent: false, timestamp: new Date(now.getTime() - 600000) },
    { id: '2', text: "I'm doing great! Just testing NexText", sent: true, timestamp: new Date(now.getTime() - 300000), status: 'read' },
    { id: '3', text: 'Awesome! The design looks amazing', sent: false, timestamp: new Date(now.getTime() - 60000) },
  ]);
  
  const handleSend = (text: string) => {
    const newMessage: Message = {
      id: Date.now().toString(),
      text,
      sent: true,
      timestamp: new Date(),
      status: 'sent',
    };
    setMessages([...messages, newMessage]);
  };
  
  return (
    <ChatWindow 
      contact={{ name: 'Sarah Chen', online: true }}
      messages={messages}
      onSendMessage={handleSend}
      isTyping={false}
    />
  )
}
