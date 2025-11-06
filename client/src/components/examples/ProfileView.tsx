import ProfileView from '../ProfileView'

export default function ProfileViewExample() {
  const mockUser = {
    name: 'Alex Johnson',
    email: 'alex@example.com',
    pin: 'XYZ789',
    bio: 'Love connecting with people through NexText! 🚀',
  };
  
  return (
    <ProfileView 
      user={mockUser}
      onLogout={() => console.log('Logout clicked')}
      onUpdate={(data) => console.log('Profile updated:', data)}
    />
  )
}
