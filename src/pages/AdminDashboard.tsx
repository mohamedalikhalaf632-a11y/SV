import React, { useState } from 'react';
import { useLanguage } from '@/lib/i18n';
import { useAuth } from '@/lib/auth';
import DashboardLayout from '@/components/DashboardLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { StatusBadge, CategoryBadge } from '@/components/StatusBadge';
import { MessageSquare, Lightbulb, Users, BarChart3, DollarSign } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useQuery } from '@tanstack/react-query';
import { dummyComplaints, dummySuggestions, getPricingTier, type Complaint, type Suggestion } from '@/lib/dummy-data';
import { PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line } from 'recharts';

const CHART_COLORS = ['hsl(270,70%,55%)', 'hsl(290,65%,60%)', 'hsl(330,70%,60%)', 'hsl(210,100%,52%)', 'hsl(145,65%,42%)'];

export default function AdminDashboard() {
  const { t } = useLanguage();
  const [activeTab, setActiveTab] = useState('analytics');

  const tabs = [
    { id: 'analytics', label: t('analytics'), icon: BarChart3 },
    { id: 'complaints', label: t('complaints'), icon: MessageSquare },
    { id: 'suggestions', label: t('suggestions'), icon: Lightbulb },
    { id: 'users', label: t('users'), icon: Users },
    { id: 'pricing', label: t('pricing'), icon: DollarSign },
  ];

  const { data: complaints = [] } = useQuery({
    queryKey: ['admin-complaints'],
    queryFn: async () => {
      const { data, error } = await supabase.from('complaints').select('*').order('created_at', { ascending: false });
      if (error) return dummyComplaints;
      return data as Complaint[];
    },
  });

  const { data: suggestions = [] } = useQuery({
    queryKey: ['admin-suggestions'],
    queryFn: async () => {
      const { data, error } = await supabase.from('suggestions').select('*').order('created_at', { ascending: false });
      if (error) return dummySuggestions;
      return data as Suggestion[];
    },
  });

  const { data: profiles = [] } = useQuery({
    queryKey: ['admin-profiles'],
    queryFn: async () => {
      const { data, error } = await supabase.from('profiles').select('*');
      if (error) return [];
      return data;
    },
  });

  const studentCount = profiles.filter(p => p.role === 'student').length || 12; // dummy fallback

  return (
    <DashboardLayout activeTab={activeTab} onTabChange={setActiveTab} tabs={tabs}>
      {activeTab === 'analytics' && <AnalyticsTab complaints={complaints} suggestions={suggestions} profiles={profiles} />}
      {activeTab === 'complaints' && <AdminComplaintsTab complaints={complaints} />}
      {activeTab === 'suggestions' && <AdminSuggestionsTab suggestions={suggestions} />}
      {activeTab === 'users' && <UsersTab profiles={profiles} />}
      {activeTab === 'pricing' && <PricingTab studentCount={studentCount} />}
    </DashboardLayout>
  );
}

function StatCard({ title, value, icon: Icon, color }: { title: string; value: string | number; icon: React.ElementType; color: string }) {
  return (
    <Card className="shadow-card">
      <CardContent className="pt-4 flex items-center gap-4">
        <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${color}`}>
          <Icon className="h-6 w-6 text-primary-foreground" />
        </div>
        <div>
          <p className="text-sm text-muted-foreground">{title}</p>
          <p className="text-2xl font-bold text-foreground">{value}</p>
        </div>
      </CardContent>
    </Card>
  );
}

function AnalyticsTab({ complaints, suggestions, profiles }: { complaints: Complaint[]; suggestions: Suggestion[]; profiles: any[] }) {
  const { t } = useLanguage();
  const resolved = complaints.filter(c => c.status === 'resolved').length;
  const resolutionRate = complaints.length > 0 ? Math.round((resolved / complaints.length) * 100) : 0;

  const categoryData = ['teacher', 'subject', 'administration', 'cleanliness', 'facilities', 'bullying', 'schedule', 'other'].map(cat => ({
    name: t(cat as any),
    value: complaints.filter(c => c.category === cat).length,
  }));

  const weakestAreas = [...categoryData].sort((a, b) => b.value - a.value).slice(0, 3);

  // Group by month
  const timeData: Record<string, number> = {};
  complaints.forEach(c => {
    const month = new Date(c.created_at).toLocaleDateString('en', { month: 'short', year: '2-digit' });
    timeData[month] = (timeData[month] || 0) + 1;
  });
  const lineData = Object.entries(timeData).map(([name, count]) => ({ name, count }));

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard title={t('totalComplaints')} value={complaints.length} icon={MessageSquare} color="gradient-primary" />
        <StatCard title={t('totalSuggestions')} value={suggestions.length} icon={Lightbulb} color="bg-accent" />
        <StatCard title={t('totalUsers')} value={profiles.length} icon={Users} color="bg-info" />
        <StatCard title={t('resolutionRate')} value={`${resolutionRate}%`} icon={BarChart3} color="bg-success" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="shadow-card">
          <CardHeader><CardTitle>{t('complaintsByCategory')}</CardTitle></CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={250}>
              <PieChart>
                <Pie data={categoryData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={80} label>
                  {categoryData.map((_, i) => <Cell key={i} fill={CHART_COLORS[i % CHART_COLORS.length]} />)}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card className="shadow-card">
          <CardHeader><CardTitle>{t('weakestAreas')}</CardTitle></CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={250}>
              <BarChart data={weakestAreas}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(270,20%,90%)" />
                <XAxis dataKey="name" tick={{ fontSize: 12 }} />
                <YAxis />
                <Tooltip />
                <Bar dataKey="value" fill="hsl(270,70%,55%)" radius={[8, 8, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card className="shadow-card lg:col-span-2">
          <CardHeader><CardTitle>{t('complaintsOverTime')}</CardTitle></CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={250}>
              <LineChart data={lineData}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(270,20%,90%)" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Line type="monotone" dataKey="count" stroke="hsl(270,70%,55%)" strokeWidth={2} dot={{ fill: 'hsl(270,70%,55%)' }} />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

function AdminComplaintsTab({ complaints }: { complaints: Complaint[] }) {
  const { t } = useLanguage();
  return (
    <div className="space-y-3 animate-fade-in">
      <h2 className="text-xl font-bold text-foreground">{t('allComplaints')}</h2>
      {complaints.map(c => (
        <Card key={c.id} className="shadow-card">
          <CardContent className="pt-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div className="space-y-1">
                <h3 className="font-semibold text-foreground">{c.title}</h3>
                <p className="text-sm text-muted-foreground">{c.description}</p>
                <div className="flex gap-2 flex-wrap"><CategoryBadge category={c.category} /><StatusBadge status={c.status as any} /></div>
              </div>
              <span className="text-xs text-muted-foreground whitespace-nowrap">{new Date(c.created_at).toLocaleDateString()}</span>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}

function AdminSuggestionsTab({ suggestions }: { suggestions: Suggestion[] }) {
  const { t } = useLanguage();
  return (
    <div className="space-y-3 animate-fade-in">
      <h2 className="text-xl font-bold text-foreground">{t('allSuggestions')}</h2>
      {suggestions.map(s => (
        <Card key={s.id} className="shadow-card">
          <CardContent className="pt-4">
            <h3 className="font-semibold text-foreground">{s.title}</h3>
            <p className="text-sm text-muted-foreground mt-1">{s.description}</p>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}

function UsersTab({ profiles }: { profiles: any[] }) {
  const { t } = useLanguage();
  return (
    <div className="animate-fade-in">
      <h2 className="text-xl font-bold text-foreground mb-4">{t('manageUsers')}</h2>
      <Card className="shadow-card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border bg-muted/50">
                <th className="text-start p-3 font-medium text-muted-foreground">{t('email')}</th>
                <th className="text-start p-3 font-medium text-muted-foreground">{t('role')}</th>
                <th className="text-start p-3 font-medium text-muted-foreground">{t('date')}</th>
              </tr>
            </thead>
            <tbody>
              {profiles.map(p => (
                <tr key={p.id} className="border-b border-border last:border-0 hover:bg-muted/30 transition-colors">
                  <td className="p-3 text-foreground">{p.email}</td>
                  <td className="p-3 capitalize text-foreground">{p.role}</td>
                  <td className="p-3 text-muted-foreground">{new Date(p.created_at).toLocaleDateString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}

function PricingTab({ studentCount }: { studentCount: number }) {
  const { t } = useLanguage();
  const pricing = getPricingTier(studentCount);

  const tiers = [
    { range: '0 - 50', price: 500, active: studentCount <= 50 },
    { range: '51 - 200', price: 1000, active: studentCount > 50 && studentCount <= 200 },
    { range: '201 - 500', price: 1500, active: studentCount > 200 && studentCount <= 500 },
    { range: '500+', price: 2000, active: studentCount > 500 },
  ];

  return (
    <div className="space-y-6 animate-fade-in">
      <Card className="shadow-elevated">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <DollarSign className="h-5 w-5 text-primary" />
            {t('pricingTier')}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="p-4 rounded-xl bg-muted text-center">
              <p className="text-sm text-muted-foreground">{t('activeStudents')}</p>
              <p className="text-3xl font-bold text-foreground">{studentCount}</p>
            </div>
            <div className="p-4 rounded-xl gradient-primary text-center">
              <p className="text-sm text-primary-foreground/80">{t('currentTier')}</p>
              <p className="text-3xl font-bold text-primary-foreground">{pricing.tier}</p>
            </div>
            <div className="p-4 rounded-xl bg-muted text-center">
              <p className="text-sm text-muted-foreground">{t('monthlyPrice')}</p>
              <p className="text-3xl font-bold text-foreground">{pricing.price} <span className="text-sm font-normal">{t('egpMonth')}</span></p>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {tiers.map((tier, i) => (
          <Card key={i} className={`shadow-card transition-all ${tier.active ? 'ring-2 ring-primary shadow-primary' : ''}`}>
            <CardContent className="pt-6 text-center space-y-2">
              <p className="text-sm text-muted-foreground">{tier.range} {t('users').toLowerCase()}</p>
              <p className="text-2xl font-bold text-foreground">{tier.price} <span className="text-sm font-normal text-muted-foreground">{t('egpMonth')}</span></p>
              {tier.active && <p className="text-xs font-medium text-primary">● {t('currentTier')}</p>}
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
