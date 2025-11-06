import UserAvatar from '../UserAvatar'

export default function UserAvatarExample() {
  return (
    <div className="flex items-center gap-4">
      <UserAvatar name="John Doe" size="sm" />
      <UserAvatar name="Sarah Smith" size="md" online />
      <UserAvatar name="Mike Wilson" size="lg" online />
      <UserAvatar name="Emily Chen" size="xl" />
    </div>
  )
}
