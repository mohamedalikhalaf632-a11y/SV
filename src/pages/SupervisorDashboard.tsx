import React, { useState } from 'react';
import { useLanguage } from '@/lib/i18n';
import { useAuth } from '@/lib/auth';
import DashboardLayout from '@/components/DashboardLayout';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { StatusBadge, CategoryBadge } from '@/components/StatusBadge';
import { MessageSquare, Lightbulb, MessageCircle } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useToast } from '@/hooks/use-toast';
import { type Complaint, type Suggestion, type Reply } from '@/lib/dummy-data';

export default function SupervisorDashboard() {
  const { t } = useLanguage();
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('complaints');
  const queryClient = useQueryClient();

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

      if (error) return [] as Complaint[];
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

      if (error) return [] as Suggestion[];
      return data as Suggestion[];
    },
  });

  return (
    <DashboardLayout activeTab={activeTab} onTabChange={setActiveTab} tabs={tabs}>
      {activeTab === 'complaints' && (
        <SupervisorComplaints
          complaints={complaints}
          userId={user!.id}
          userRole={user?.role || 'supervisor'}
        />
      )}
      {activeTab === 'suggestions' && <SupervisorSuggestions suggestions={suggestions} />}
    </DashboardLayout>
  );
}

function SupervisorComplaints({
  complaints,
  userId,
  userRole,
}: {
  complaints: Complaint[];
  userId: string;
  userRole: string;
}) {
  const { t } = useLanguage();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const [replyText, setReplyText] = useState<Record<string, string>>({});
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const { data: replies = [] } = useQuery({
    queryKey: ['all-replies'],
    queryFn: async () => {
      const { data } = await supabase
        .from('replies')
        .select('*')
        .order('created_at', { ascending: true });

      return (data || []) as Reply[];
    },
  });

  const replyMutation = useMutation({
    mutationFn: async ({ complaintId, message }: any) => {
      const { error } = await supabase.from('replies').insert({
        complaint_id: complaintId,
        user_id: userId,
        message: message.trim(),
        role: userRole,
      });

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['all-replies'] });
    },
  });

  return (
    <div className="space-y-4">
      <h2 className="text-xl font-bold">{t('allComplaints')}</h2>

      {complaints.map(c => {
        const complaintReplies = replies.filter(r => r.complaint_id === c.id);
        const isExpanded = expandedId === c.id;

        return (
          <Card key={c.id}>
            <CardContent className="pt-4 space-y-3">

              <div>
                <h3 className="font-semibold">{c.title}</h3>
                <p className="text-sm text-muted-foreground">{c.description}</p>
              </div>

              <Button
                variant="ghost"
                size="sm"
                onClick={() => setExpandedId(isExpanded ? null : c.id)}
              >
                الردود ({complaintReplies.length})
              </Button>

              {isExpanded && (
                <div className="space-y-2">

                  {/* 💬 الرسائل */}
                  {complaintReplies.map(r => (
                    <div
                      key={r.id}
                      className={`max-w-[75%] p-3 rounded-2xl text-sm ${
                        r.role === 'admin'
                          ? 'ml-auto bg-yellow-200 text-black shadow-[0_0_12px_#FFD700]'
                          : r.role === 'supervisor'
                          ? 'mr-auto bg-purple-200 text-black shadow-[0_0_12px_#A855F7]'
                          : 'bg-muted'
                      }`}
                    >
                      <p>{r.message}</p>
                    </div>
                  ))}

                  {/* 💬 بوكس الإرسال (واحد فقط للجميع) */}
                  <div className="flex gap-2">
                    <Textarea
                      placeholder="اكتب ردك..."
                      value={replyText[c.id] || ''}
                      onChange={e =>
                        setReplyText(prev => ({
                          ...prev,
                          [c.id]: e.target.value,
                        }))
                      }
                      rows={2}
                      className="flex-1"
                    />

                    <Button
                      onClick={() =>
                        replyMutation.mutate({
                          complaintId: c.id,
                          message: replyText[c.id] || '',
                        })
                      }
                      disabled={!replyText[c.id]?.trim()}
                      className={
                        userRole === 'admin'
                          ? 'bg-yellow-400 text-black shadow-[0_0_10px_#FFD700]'
                          : 'bg-purple-500 text-white shadow-[0_0_10px_#A855F7]'
                      }
                    >
                      إرسال
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

function SupervisorSuggestions({ suggestions }: any) {
  return (
    <div className="space-y-4">
      {suggestions.map((s: any) => (
        <Card key={s.id}>
          <CardContent className="pt-4">
            <h3>{s.title}</h3>
            <p>{s.description}</p>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}