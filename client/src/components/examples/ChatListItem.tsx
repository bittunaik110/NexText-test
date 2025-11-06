import ChatListItem from '../ChatListItem'

export default function ChatListItemExample() {
  const now = new Date();
  
  return (
    <div className="space-y-2 max-w-md">
      <ChatListItem 
        name="Sarah Chen" 
        lastMessage="See you tomorrow!" 
        timestamp={new Date(now.getTime() - 300000)} 
        unreadCount={3}
        online
      />
      <ChatListItem 
        name="Mike Wilson" 
        lastMessage="Thanks for your help 👍" 
        timestamp={new Date(now.getTime() - 3600000)} 
        active
      />
      <ChatListItem 
        name="Emily Rodriguez" 
        lastMessage="Let's catch up soon" 
        timestamp={new Date(now.getTime() - 86400000)} 
        online
      />
    </div>
  )
}
