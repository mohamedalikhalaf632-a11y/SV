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

export default function StudentDashboard() {
  const { t } = useLanguage();
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('complaints');
  const queryClient = useQueryClient();

  const tabs = [
    { id: 'complaints', label: t('complaints'), icon: MessageSquare },
    { id: 'suggestions', label: t('suggestions'), icon: Lightbulb },
    { id: 'profile', label: t('profile'), icon: User },
  ];

  const { data: complaints = [] } = useQuery({
    queryKey: ['my-complaints'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('complaints')
        .select('*, replies(*)')
        .eq('user_id', user!.id)
        .order('created_at', { ascending: false });
      if (error) throw error;
      return data as any[];
    },
  });

  const { data: suggestions = [] } = useQuery({
    queryKey: ['my-suggestions'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('suggestions')
        .select('*')
        .eq('user_id', user!.id)
        .order('created_at', { ascending: false });
      if (error) throw error;
      return data as any[];
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

// الدوال الفرعية يجب أن تكون خارج دالة StudentDashboard الرئيسية
function ComplaintsTab({ userId, complaints, queryClient }: { userId: string; complaints: any[]; queryClient: any }) {
  // ... ضع محتوى ComplaintsTab هنا ...
  return <div>Complaints Tab Content</div>;
}

function SuggestionsTab({ userId, suggestions, queryClient }: { userId: string; suggestions: any[]; queryClient: any }) {
  // ... ضع محتوى SuggestionsTab هنا ...
  return <div>Suggestions Tab Content</div>;
}

function ProfileTab() {
  return <div>Profile Tab Content</div>;
}