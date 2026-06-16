import React, { useState } from 'react';
import { useAuth } from '@/lib/auth';
import { useLanguage } from '@/lib/i18n';
import { useTheme } from '@/lib/theme';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Moon, Sun, Globe } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';

export default function AuthPage() {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [username, setUsername] = useState('');
  const [role, setRole] = useState<'student' | 'supervisor' | 'admin'>('student');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [inviteCode, setInviteCode] = useState('');
  const [loading, setLoading] = useState(false);

  const { signIn, signUp } = useAuth();
  const { t, lang, setLang } = useLanguage();
  const { theme, toggleTheme } = useTheme();
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!isLogin && password !== confirmPassword) {
      toast({
        title: 'Error',
        description: 'Passwords do not match',
        variant: 'destructive',
      });
      return;
    }

    setLoading(true);

    try {
      if (isLogin) {
        // --- LOGIN FLOW ---
        const { data, error } = await supabase.auth.signInWithPassword({
          email,
          password,
        });

        if (error) throw error;

        // check approval status
        const { data: profile } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', data.user.id)
          .single();

        if (profile?.status === 'pending') {
          await supabase.auth.signOut();
          toast({
            title: '⏳ Pending Approval',
            description: 'Your account is waiting for admin approval',
          });
          return;
        }

        if (profile?.status === 'rejected') {
          await supabase.auth.signOut();
          toast({
            title: '❌ Rejected',
            description: 'Your account has been rejected',
            variant: 'destructive',
          });
          return;
        }

        // Session already established by signInWithPassword above;
        // AuthProvider's onAuthStateChange listener will pick it up.
      } else {
        // --- SIGNUP FLOW ---
        if (role === 'supervisor' || role === 'admin') {
          const { data, error } = await supabase
            .from('role_codes')
            .select('*')
            .eq('code', inviteCode)
            .single();

          if (error || !data) {
            toast({
              title: 'Invalid Code',
              description: 'Activation code is incorrect',
              variant: 'destructive',
            });
            return;
          }
        }

        await signUp(email, password, username, role);

        toast({
          title: 'Check your email',
          description: 'Please verify your email to complete signup',
        });
      }
    } catch (error) {
      console.error('Auth error:', error);
      const message = error instanceof Error ? error.message : 'Something went wrong';
      toast({
        title: 'Error',
        description: message,
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">

      {/* Top Controls */}
      <div className="fixed top-4 right-4 flex gap-2 z-50">
        <Button variant="outline" size="icon" onClick={toggleTheme}>
          {theme === 'dark' ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
        </Button>

        <Button variant="outline" size="sm" onClick={() => setLang(lang === 'en' ? 'ar' : 'en')}>
          <Globe className="h-4 w-4 mr-1" />
          {lang === 'en' ? 'عربي' : 'EN'}
        </Button>
      </div>

      <Card className="w-full max-w-md shadow-elevated">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl font-bold">
            {isLogin ? t('loginTitle') : t('signupTitle')}
          </CardTitle>
          <CardDescription>
            {isLogin ? t('loginSubtitle') : t('signupSubtitle')}
          </CardDescription>
        </CardHeader>

        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">

            {/* Username */}
            {!isLogin && (
              <div className="space-y-2">
                <label className="text-sm">Username</label>
                <Input
                  value={username}
                  onChange={e => setUsername(e.target.value)}
                  required
                />
              </div>
            )}

            {/* Email */}
            <div className="space-y-2">
              <label>Email</label>
              <Input
                type="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                required
              />
            </div>

            {/* Password */}
            <div className="space-y-2">
              <label>Password</label>
              <Input
                type="password"
                value={password}
                onChange={e => setPassword(e.target.value)}
                required
              />
            </div>

            {/* Confirm Password */}
            {!isLogin && (
              <div className="space-y-2">
                <label>Confirm Password</label>
                <Input
                  type="password"
                  value={confirmPassword}
                  onChange={e => setConfirmPassword(e.target.value)}
                  required
                />
              </div>
            )}

            {/* Role */}
            {!isLogin && (
              <>
                <div className="space-y-2">
                  <label>Role</label>

                  <select
                    value={role}
                    onChange={(e) =>
                      setRole(e.target.value as 'student' | 'supervisor' | 'admin')
                    }
                    className="w-full h-11 rounded-lg border border-input bg-background px-3"
                  >
                    <option value="student">🎓 Student</option>
                    <option value="supervisor">👨‍🏫 Supervisor</option>
                    <option value="admin">⚙️ Admin</option>
                  </select>
                </div>

                {(role === 'supervisor' || role === 'admin') && (
                  <div className="space-y-2">
                    <label>Activation Code</label>

                    <Input
                      type="text"
                      value={inviteCode}
                      onChange={(e) => setInviteCode(e.target.value)}
                      placeholder="Enter activation code"
                      required
                    />
                  </div>
                )}
              </>
            )}

            <Button
              type="submit"
              className="w-full"
              disabled={loading}
            >
              {loading ? 'Loading...' : isLogin ? 'Login' : 'Sign Up'}
            </Button>

          </form>

          {/* Toggle */}
          <div className="text-center mt-4">
            <button onClick={() => setIsLogin(!isLogin)} className="text-sm underline">
              {isLogin ? 'Create account' : 'Already have account'}
            </button>
          </div>

        </CardContent>
      </Card>
    </div>
  );
}
