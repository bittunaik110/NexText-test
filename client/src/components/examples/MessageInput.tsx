import MessageInput from '../MessageInput'

export default function MessageInputExample() {
  return (
    <MessageInput 
      onSend={(msg) => console.log('Sending:', msg)} 
      onTyping={() => console.log('User is typing...')}
    />
  )
}
