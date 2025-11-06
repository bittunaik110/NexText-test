import MessageBubble from '../MessageBubble'

export default function MessageBubbleExample() {
  const now = new Date();
  
  return (
    <div className="space-y-2 max-w-md">
      <MessageBubble 
        text="Hey! How are you doing?" 
        sent={false} 
        timestamp={new Date(now.getTime() - 300000)} 
      />
      <MessageBubble 
        text="I'm great! Just finished the NexText prototype 🚀" 
        sent={true} 
        timestamp={new Date(now.getTime() - 120000)} 
        status="delivered"
      />
      <MessageBubble 
        text="That's awesome! Can't wait to see it" 
        sent={false} 
        timestamp={now} 
      />
      <MessageBubble 
        text="Check it out, it has glass-morphism design!" 
        sent={true} 
        timestamp={now} 
        status="read"
      />
    </div>
  )
}
