import AuthForm from '../AuthForm'

export default function AuthFormExample() {
  return (
    <AuthForm onSubmit={(email, password, isSignUp) => {
      console.log('Auth submitted:', { email, isSignUp });
    }} />
  )
}
