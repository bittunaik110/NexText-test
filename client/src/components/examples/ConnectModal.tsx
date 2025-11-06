import { useState } from 'react'
import ConnectModal from '../ConnectModal'
import { Button } from '@/components/ui/button'

export default function ConnectModalExample() {
  const [open, setOpen] = useState(false);
  
  return (
    <div>
      <Button onClick={() => setOpen(true)}>Open Connect Modal</Button>
      <ConnectModal 
        open={open} 
        onOpenChange={setOpen}
        onConnect={(pin) => console.log('Connecting with PIN:', pin)}
      />
    </div>
  )
}
