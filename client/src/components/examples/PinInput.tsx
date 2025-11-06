import { useState } from 'react'
import PinInput from '../PinInput'

export default function PinInputExample() {
  const [pin, setPin] = useState('ABC123');
  
  return (
    <div className="space-y-4">
      <PinInput value={pin} onChange={setPin} />
      <p className="text-center text-sm text-muted-foreground">Current PIN: {pin || 'Empty'}</p>
    </div>
  )
}
