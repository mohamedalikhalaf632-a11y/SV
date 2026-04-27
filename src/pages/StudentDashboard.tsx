import React, { useState } from 'react';
import { useLanguage } from '@/lib/i18n';
import { useAuth } from '@/lib/auth';
import DashboardLayout from '@/components/DashboardLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { StatusBadge, CategoryBadge } from '@/components/StatusBadge';
import { MessageSquare, Lightbulb, User } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useToast } from '@/hooks/use-toast';
import { dummyComplaints, dummySuggestions, type Complaint, type Suggestion } from '@/lib/dummy-data';

export default function StudentDashboard() {
  const { t } = useLanguage();
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('complaints');
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const tabs = [
    { id: 'complaints', label: t('complaints'), icon: MessageSquare },
    { id: 'suggestions', label: t('suggestions'), icon: Lightbulb },
    { id: 'profile', label: t('profile'), icon: User },
  ];

queryFn: async ()=> {
  // 1. جلب الشكاوى الخاصة بالطالب
  const { data: complaints, error: complaintsError } = await supabase
    .from('complaints')
    .select('*')
    .eq('user_id', user!.id);

  if (complaintsError) throw complaintsError;
  if (!complaints || complaints.length === 0) return [];

  // 2. جلب كل الردود الخاصة بجميع شكاوى هذا الطالب دفعة واحدة
  const complaintIds = complaints.map(c => c.id);
  const { data: allReplies, error: repliesError } = await supabase
    .from('replies')
    .select('*')
    .in('complaint_id', complaintIds);

  // 3. ربط الردود بالشكاوى برمجياً (هذا بديل للـ Relationship)
  const combinedData = complaints.map(complaint => ({
    ...complaint,
    replies: allReplies?.filter(reply => reply.complaint_id === complaint.id) || []
  }));

  return combinedData as any; // نستخدم any لتجاوز أخطاء التعريفات
}, 

  const { data: suggestions = [] } = useQuery({
    queryKey: ['my-suggestions'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('suggestions')
        .select('*')
        .eq('user_id', user!.id)
        .order('created_at', { ascending: false });
      if (error) return dummySuggestions.filter(s => s.user_id === 'u1');
      return data as Suggestion[];
    },
  });

  return (
    <DashboardLayout activeTab={activeTab} onTabChange={setActiveTab} tabs={tabs}>
      {activeTab === 'complaints' && <ComplaintsTab userId={user!.id} complaints={complaints} queryClient={queryClient} />}
      {activeTab === 'suggestions' && <SuggestionsTab userId={user!.id} suggestions={suggestions} queryClient={queryClient} />}
      {activeTab === 'profile' && <ProfileTab />}
    </DashboardLayout>
  );
}

function ComplaintsTab({ userId, complaints, queryClient }: { userId: string; complaints: Complaint[]; queryClient: any }) {
  const { t } = useLanguage();
  const { toast } = useToast();
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState('');

  const submitMutation = useMutation({
    mutationFn: async () => {
      const { error } = await supabase.from('complaints').insert({
        user_id: userId,
        title: title.trim(),
        description: description.trim(),
        category,
      });
      if (error) throw error;
    },
    onSuccess: () => {
      toast({ title: '✅', description: 'Complaint submitted successfully' });
      setTitle(''); setDescription(''); setCategory('');
      queryClient.invalidateQueries({ queryKey: ['my-complaints'] });
    },
    onError: (err: any) => toast({ title: 'Error', description: err.message, variant: 'destructive' }),
  });

  const categories = ['teacher', 'subject', 'administration', 'cleanliness', 'facilities', 'bullying', 'schedule', 'other'];

  return (
    <div className="space-y-6 animate-fade-in">
      <Card className="shadow-card">
        <CardHeader>
          <CardTitle>{t('submitComplaint')}</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={e => { e.preventDefault(); submitMutation.mutate(); }} className="space-y-4">
            <Input placeholder={t('title')} value={title} onChange={e => setTitle(e.target.value)} required />
            <Textarea placeholder={t('description')} value={description} onChange={e => setDescription(e.target.value)} required rows={3} />
            <Select value={category} onValueChange={setCategory} required>
              <SelectTrigger><SelectValue placeholder={t('category')} /></SelectTrigger>
              <SelectContent>
                {categories.map(c => (
                  <SelectItem key={c} value={c}>{t(c as any)}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Button type="submit" className="gradient-primary text-primary-foreground" disabled={!category || submitMutation.isPending}>
              {t('submit')}
            </Button>
          </form>
        </CardContent>
      </Card>

      <Card className="shadow-card">
        <CardHeader>
          <CardTitle>{t('myComplaints')}</CardTitle>
        </CardHeader>
        <CardContent>
          {complaints.length === 0 ? (
            <p className="text-muted-foreground text-center py-8">{t('noComplaints')}</p>
          ) : (
            <div className="space-y-3">
              {complaints.map(c => (
                <div key={c.id} className="flex flex-col sm:flex-row sm:items-center justify-between p-4 rounded-lg border border-border bg-card hover:shadow-card transition-shadow gap-2">
                  <div className="space-y-1">
                    <h4 className="font-medium text-foreground">{c.title}</h4>
                    <p className="text-sm text-muted-foreground line-clamp-1">{c.description}</p>
                    <div className="flex gap-2 flex-wrap">
                      <CategoryBadge category={c.category} />
                      <span className="text-xs text-muted-foreground">{new Date(c.created_at).toLocaleDateString()}</span>
                    </div>
                  </div>
                  <StatusBadge status={c.status as any} />
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

function SuggestionsTab({ userId, suggestions, queryClient }: { userId: string; suggestions: Suggestion[]; queryClient: any }) {
  const { t } = useLanguage();
  const { toast } = useToast();
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');

  const submitMutation = useMutation({
    mutationFn: async () => {
      const { error } = await supabase.from('suggestions').insert({
        user_id: userId,
        title: title.trim(),
        description: description.trim(),
      });
      if (error) throw error;
    },
    onSuccess: () => {
      toast({ title: '✅', description: 'Suggestion submitted' });
      setTitle(''); setDescription('');
      queryClient.invalidateQueries({ queryKey: ['my-suggestions'] });
    },
    onError: (err: any) => toast({ title: 'Error', description: err.message, variant: 'destructive' }),
  });

  return (
    <div className="space-y-6 animate-fade-in">
      <Card className="shadow-card">
        <CardHeader><CardTitle>{t('submitSuggestion')}</CardTitle></CardHeader>
        <CardContent>
          <form onSubmit={e => { e.preventDefault(); submitMutation.mutate(); }} className="space-y-4">
            <Input placeholder={t('title')} value={title} onChange={e => setTitle(e.target.value)} required />
            <Textarea placeholder={t('description')} value={description} onChange={e => setDescription(e.target.value)} required rows={3} />
            <Button type="submit" className="gradient-primary text-primary-foreground" disabled={submitMutation.isPending}>
              {t('submit')}
            </Button>
          </form>
        </CardContent>
      </Card>
      <Card className="shadow-card">
        <CardHeader><CardTitle>{t('mySuggestions')}</CardTitle></CardHeader>
        <CardContent>
          {suggestions.length === 0 ? (
            <p className="text-muted-foreground text-center py-8">{t('noSuggestions')}</p>
          ) : (
            <div className="space-y-3">
              {suggestions.map(s => (
                <div key={s.id} className="p-4 rounded-lg border border-border bg-card hover:shadow-card transition-shadow">
                  <h4 className="font-medium text-foreground">{s.title}</h4>
                  <p className="text-sm text-muted-foreground mt-1">{s.description}</p>
                  <span className="text-xs text-muted-foreground">{new Date(s.created_at).toLocaleDateString()}</span>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

function ProfileTab() {
  const { t } = useLanguage();
  const { user } = useAuth();
  return (
    <div className="animate-fade-in">
      <Card className="shadow-card max-w-md">
        <CardHeader><CardTitle>{t('profile')}</CardTitle></CardHeader>
        <CardContent className="space-y-4">
          <div>
            <label className="text-sm text-muted-foreground">{t('email')}</label>
            <p className="font-medium text-foreground">{user?.email}</p>
          </div>
          <div>
            <label className="text-sm text-muted-foreground">{t('role')}</label>
            <p className="font-medium text-foreground capitalize">{user?.role}</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
