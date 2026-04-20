import React, { useState } from 'react';
import { useLanguage } from '@/lib/i18n';
import { useAuth } from '@/lib/auth';
import DashboardLayout from '@/components/DashboardLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { StatusBadge, CategoryBadge } from '@/components/StatusBadge';
import { MessageSquare, Lightbulb, MessageCircle } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useToast } from '@/hooks/use-toast';
import { dummyComplaints, dummySuggestions, dummyReplies, type Complaint, type Suggestion, type Reply } from '@/lib/dummy-data';

export default function SupervisorDashboard() {
  const { t } = useLanguage();
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('complaints');
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const tabs = [
    { id: 'complaints', label: t('allComplaints'), icon: MessageSquare },
    { id: 'suggestions', label: t('allSuggestions'), icon: Lightbulb },
  ];

  const { data: complaints = [] } = useQuery({
    queryKey: ['all-complaints'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('complaints')
        .select('*')
        .order('created_at', { ascending: false });
      if (error) return dummyComplaints;
      return data as Complaint[];
    },
  });

  const { data: suggestions = [] } = useQuery({
    queryKey: ['all-suggestions'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('suggestions')
        .select('*')
        .order('created_at', { ascending: false });
      if (error) return dummySuggestions;
      return data as Suggestion[];
    },
  });

  return (
    <DashboardLayout activeTab={activeTab} onTabChange={setActiveTab} tabs={tabs}>
      {activeTab === 'complaints' && <SupervisorComplaints complaints={complaints} userId={user!.id} queryClient={queryClient} />}
      {activeTab === 'suggestions' && <SupervisorSuggestions suggestions={suggestions} />}
    </DashboardLayout>
  );
}

function SupervisorComplaints({ complaints, userId, queryClient }: { complaints: Complaint[]; userId: string; queryClient: any }) {
  const { t } = useLanguage();
  const { toast } = useToast();
  const [replyText, setReplyText] = useState<Record<string, string>>({});
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const { data: replies = [] } = useQuery({
    queryKey: ['all-replies'],
    queryFn: async () => {
      const { data, error } = await supabase.from('replies').select('*').order('created_at', { ascending: true });
      if (error) return dummyReplies;
      return data as Reply[];
    },
  });

  const statusMutation = useMutation({
    mutationFn: async ({ id, status }: { id: string; status: string }) => {
      const { error } = await supabase.from('complaints').update({ status }).eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['all-complaints'] });
      toast({ title: '✅', description: 'Status updated' });
    },
  });

  const replyMutation = useMutation({
    mutationFn: async ({ complaintId, message }: { complaintId: string; message: string }) => {
      const { error } = await supabase.from('replies').insert({
        complaint_id: complaintId,
        user_id: userId,
        message: message.trim(),
      });
      if (error) throw error;
    },
    onSuccess: (_, { complaintId }) => {
      setReplyText(prev => ({ ...prev, [complaintId]: '' }));
      queryClient.invalidateQueries({ queryKey: ['all-replies'] });
      toast({ title: '✅', description: 'Reply sent' });
    },
  });

  return (
    <div className="space-y-4 animate-fade-in">
      <h2 className="text-xl font-bold text-foreground">{t('allComplaints')}</h2>
      {complaints.map(c => {
        const complaintReplies = replies.filter(r => r.complaint_id === c.id);
        const isExpanded = expandedId === c.id;
        return (
          <Card key={c.id} className="shadow-card">
            <CardContent className="pt-4 space-y-3">
              <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-2">
                <div className="space-y-1 flex-1">
                  <h3 className="font-semibold text-foreground">{c.title}</h3>
                  <p className="text-sm text-muted-foreground">{c.description}</p>
                  <div className="flex gap-2 flex-wrap items-center">
                    <CategoryBadge category={c.category} />
                    <StatusBadge status={c.status as any} />
                    <span className="text-xs text-muted-foreground">{new Date(c.created_at).toLocaleDateString()}</span>
                  </div>
                </div>
                <Select value={c.status} onValueChange={status => statusMutation.mutate({ id: c.id, status })}>
                  <SelectTrigger className="w-36"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="pending">{t('pending')}</SelectItem>
                    <SelectItem value="in_review">{t('inReview')}</SelectItem>
                    <SelectItem value="resolved">{t('resolved')}</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <Button variant="ghost" size="sm" onClick={() => setExpandedId(isExpanded ? null : c.id)}>
                <MessageCircle className="h-4 w-4 mr-1" />
                {t('replies')} ({complaintReplies.length})
              </Button>

              {isExpanded && (
                <div className="space-y-2 animate-fade-in">
                  {complaintReplies.map(r => (
                    <div key={r.id} className="p-3 rounded-md bg-muted text-sm">
                      <p className="text-foreground">{r.message}</p>
                      <span className="text-xs text-muted-foreground">{new Date(r.created_at).toLocaleDateString()}</span>
                    </div>
                  ))}
                  <div className="flex gap-2">
                    <Textarea
                      placeholder={t('replyPlaceholder')}
                      value={replyText[c.id] || ''}
                      onChange={e => setReplyText(prev => ({ ...prev, [c.id]: e.target.value }))}
                      rows={2}
                      className="flex-1"
                    />
                    <Button
                      size="sm"
                      className="gradient-primary text-primary-foreground self-end"
                      onClick={() => replyMutation.mutate({ complaintId: c.id, message: replyText[c.id] || '' })}
                      disabled={!replyText[c.id]?.trim()}
                    >
                      {t('sendReply')}
                    </Button>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}

function SupervisorSuggestions({ suggestions }: { suggestions: Suggestion[] }) {
  const { t } = useLanguage();
  return (
    <div className="space-y-4 animate-fade-in">
      <h2 className="text-xl font-bold text-foreground">{t('allSuggestions')}</h2>
      {suggestions.map(s => (
        <Card key={s.id} className="shadow-card">
          <CardContent className="pt-4">
            <h3 className="font-semibold text-foreground">{s.title}</h3>
            <p className="text-sm text-muted-foreground mt-1">{s.description}</p>
            <span className="text-xs text-muted-foreground">{new Date(s.created_at).toLocaleDateString()}</span>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
