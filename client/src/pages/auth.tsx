
import { useState } from "react";
import AuthForm from "@/components/AuthForm";
import { useLocation } from "wouter";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { usersApi } from "@/lib/api";

export default function Auth() {
  const [, setLocation] = useLocation();
  const { signUp, signIn, user } = useAuth();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);

  if (user) {
    setLocation("/");
    return null;
  }

  const handleAuth = async (email: string, password: string, isSignUp: boolean) => {
    setIsLoading(true);
    try {
      if (isSignUp) {
        await signUp(email, password);
        
        // Create user profile in Firestore
        await usersApi.createProfile({
          displayName: email.split("@")[0],
          bio: "",
        });

        toast({
          title: "Account Created Successfully!",
          description: "Welcome to NexText. You can now start chatting.",
        });
      } else {
        await signIn(email, password);
        toast({
          title: "Welcome Back!",
          description: "You've been signed in successfully.",
        });
      }

      setLocation("/");
    } catch (error: any) {
      console.error("Authentication error:", error);
      
      let errorMessage = "An unexpected error occurred. Please try again.";
      
      // Handle specific Firebase auth errors
      if (error.code === "auth/invalid-credential") {
        errorMessage = "Invalid email or password. Please check your credentials.";
      } else if (error.code === "auth/user-not-found") {
        errorMessage = "No account found with this email. Please sign up first.";
      } else if (error.code === "auth/wrong-password") {
        errorMessage = "Incorrect password. Please try again.";
      } else if (error.code === "auth/email-already-in-use") {
        errorMessage = "This email is already registered. Please sign in instead.";
      } else if (error.code === "auth/weak-password") {
        errorMessage = "Password should be at least 6 characters long.";
      } else if (error.code === "auth/invalid-email") {
        errorMessage = "Invalid email address format.";
      } else if (error.code === "auth/network-request-failed") {
        errorMessage = "Network error. Please check your connection.";
      } else if (error.message) {
        errorMessage = error.message;
      }

      toast({
        title: isSignUp ? "Sign Up Failed" : "Sign In Failed",
        description: errorMessage,
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return <AuthForm onSubmit={handleAuth} isLoading={isLoading} />;
}
