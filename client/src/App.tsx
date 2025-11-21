import { Switch, Route, Redirect } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AuthProvider, useAuth } from "@/contexts/AuthContext";
import NotFound from "@/pages/not-found";
import Home from "@/pages/home";
import Auth from "@/pages/auth";
import StatusPage from "@/pages/status";
import CallsPage from "@/pages/calls";
import SettingsPage from "@/pages/settings";
import ProfilePage from "@/pages/profile";
import ContactsPage from "@/pages/contacts";
import AccountPage from "@/pages/settings/account";
import PrivacyPage from "@/pages/settings/privacy";
import SecurityPage from "@/pages/settings/security";
import BlockedContactsPage from "@/pages/settings/blocked-contacts";
import NotificationsPage from "@/pages/settings/notifications";
import ThemePage from "@/pages/settings/theme";
import WallpaperPage from "@/pages/settings/wallpaper";
import HelpPage from "@/pages/settings/help";
import ContactPage from "@/pages/settings/contact";
import TermsPage from "@/pages/settings/terms";

function ProtectedRoute({ component: Component }: { component: React.ComponentType }) {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!user) {
    return <Redirect to="/auth" />;
  }

  return <Component />;
}

function Router() {
  return (
    <Switch>
      <Route path="/" component={() => <ProtectedRoute component={Home} />} />
      <Route path="/status" component={() => <ProtectedRoute component={StatusPage} />} />
      <Route path="/calls" component={() => <ProtectedRoute component={CallsPage} />} />
      <Route path="/settings" component={() => <ProtectedRoute component={SettingsPage} />} />
      <Route path="/settings/account" component={() => <ProtectedRoute component={AccountPage} />} />
      <Route path="/settings/privacy" component={() => <ProtectedRoute component={PrivacyPage} />} />
      <Route path="/settings/security" component={() => <ProtectedRoute component={SecurityPage} />} />
      <Route path="/settings/blocked-contacts" component={() => <ProtectedRoute component={BlockedContactsPage} />} />
      <Route path="/settings/notifications" component={() => <ProtectedRoute component={NotificationsPage} />} />
      <Route path="/settings/theme" component={() => <ProtectedRoute component={ThemePage} />} />
      <Route path="/settings/wallpaper" component={() => <ProtectedRoute component={WallpaperPage} />} />
      <Route path="/settings/help" component={() => <ProtectedRoute component={HelpPage} />} />
      <Route path="/settings/contact" component={() => <ProtectedRoute component={ContactPage} />} />
      <Route path="/settings/terms" component={() => <ProtectedRoute component={TermsPage} />} />
      <Route path="/profile" component={() => <ProtectedRoute component={ProfilePage} />} />
      <Route path="/contacts" component={() => <ProtectedRoute component={ContactsPage} />} />
      <Route path="/auth" component={Auth} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <TooltipProvider>
          <Toaster />
          <Router />
        </TooltipProvider>
      </AuthProvider>
    </QueryClientProvider>
  );
}

export default App;
