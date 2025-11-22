
import { Switch, Route, Redirect } from "wouter";
import { QueryClientProvider } from "@tanstack/react-query";
import { queryClient } from "./lib/queryClient";
import { Toaster } from "@/components/ui/toaster";
import NotFound from "@/pages/not-found";
import Home from "@/pages/home";
import Auth from "@/pages/auth";
import Settings from "@/pages/settings";
import Profile from "@/pages/profile";
import Calls from "@/pages/calls";
import Status from "@/pages/status";
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
import { AuthProvider, useAuth } from "@/contexts/AuthContext";

function ProtectedRoute({ component: Component, ...rest }: { component: React.ComponentType; path: string }) {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!user) {
    return <Redirect to="/auth" />;
  }

  return <Component />;
}

function AuthRoute({ component: Component, ...rest }: { component: React.ComponentType; path: string }) {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (user) {
    return <Redirect to="/" />;
  }

  return <Component />;
}

function AppRoutes() {
  return (
    <Switch>
      <Route path="/auth" component={() => <AuthRoute component={Auth} path="/auth" />} />
      <Route path="/" component={() => <ProtectedRoute component={Home} path="/" />} />
      <Route path="/contacts" component={() => <ProtectedRoute component={ContactsPage} path="/contacts" />} />
      <Route path="/settings" component={() => <ProtectedRoute component={Settings} path="/settings" />} />
      <Route path="/profile" component={() => <ProtectedRoute component={Profile} path="/profile" />} />
      <Route path="/calls" component={() => <ProtectedRoute component={Calls} path="/calls" />} />
      <Route path="/status" component={() => <ProtectedRoute component={Status} path="/status" />} />
      <Route path="/settings/account" component={() => <ProtectedRoute component={AccountPage} path="/settings/account" />} />
      <Route path="/settings/privacy" component={() => <ProtectedRoute component={PrivacyPage} path="/settings/privacy" />} />
      <Route path="/settings/security" component={() => <ProtectedRoute component={SecurityPage} path="/settings/security" />} />
      <Route path="/settings/blocked-contacts" component={() => <ProtectedRoute component={BlockedContactsPage} path="/settings/blocked-contacts" />} />
      <Route path="/settings/notifications" component={() => <ProtectedRoute component={NotificationsPage} path="/settings/notifications" />} />
      <Route path="/settings/theme" component={() => <ProtectedRoute component={ThemePage} path="/settings/theme" />} />
      <Route path="/settings/wallpaper" component={() => <ProtectedRoute component={WallpaperPage} path="/settings/wallpaper" />} />
      <Route path="/settings/help" component={() => <ProtectedRoute component={HelpPage} path="/settings/help" />} />
      <Route path="/settings/contact" component={() => <ProtectedRoute component={ContactPage} path="/settings/contact" />} />
      <Route path="/settings/terms" component={() => <ProtectedRoute component={TermsPage} path="/settings/terms" />} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <AppRoutes />
        <Toaster />
      </AuthProvider>
    </QueryClientProvider>
  );
}

export default App;
