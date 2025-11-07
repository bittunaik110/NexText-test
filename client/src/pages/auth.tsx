import AuthForm from "@/components/AuthForm";
import { useLocation } from "wouter";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { usersApi } from "@/lib/api";

export default function Auth() {
  const [, setLocation] = useLocation();
  const { signUp, signIn, user } = useAuth();
  const { toast } = useToast();

  if (user) {
    setLocation("/");
    return null;
  }

  const handleAuth = async (email: string, password: string, isSignUp: boolean) => {
    try {
      if (isSignUp) {
        await signUp(email, password);
        
        await usersApi.createProfile({
          displayName: email.split("@")[0],
        });

        toast({
          title: "Welcome to NexText!",
          description: "Your account has been created successfully.",
        });
      } else {
        await signIn(email, password);
        toast({
          title: "Welcome back!",
          description: "You've been signed in successfully.",
        });
      }

      setLocation("/");
    } catch (error: any) {
      toast({
        title: "Authentication Error",
        description: error.message || "Failed to authenticate. Please try again.",
        variant: "destructive",
      });
    }
  };

  return <AuthForm onSubmit={handleAuth} />;
}
