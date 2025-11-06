import AuthForm from "@/components/AuthForm";
import { useLocation } from "wouter";

export default function Auth() {
  const [, setLocation] = useLocation();

  const handleAuth = (email: string, password: string, isSignUp: boolean) => {
    console.log("Auth:", { email, isSignUp });
    setLocation("/");
  };

  return <AuthForm onSubmit={handleAuth} />;
}
