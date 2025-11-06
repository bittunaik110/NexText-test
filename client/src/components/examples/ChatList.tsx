import ChatList from '../ChatList'

export default function ChatListExample() {
  const now = new Date();
  const mockChats = [
    {
      id: '1',
      name: 'Sarah Chen',
      lastMessage: 'See you tomorrow!',
      timestamp: new Date(now.getTime() - 300000),
      unreadCount: 3,
      online: true,
    },
    {
      id: '2',
      name: 'Mike Wilson',
      lastMessage: 'Thanks for your help 👍',
      timestamp: new Date(now.getTime() - 3600000),
      online: true,
    },
    {
      id: '3',
      name: 'Emily Rodriguez',
      lastMessage: "Let's catch up soon",
      timestamp: new Date(now.getTime() - 86400000),
    },
  ];
  
  return (
    <ChatList 
      chats={mockChats}
      activeChat="1"
      onSelectChat={(id) => console.log('Selected chat:', id)}
      onConnect={() => console.log('Connect clicked')}
      onProfile={() => console.log('Profile clicked')}
    />
  )
}
