import React from 'react';
import { useLanguage } from '@/lib/i18n';
import { Badge } from '@/components/ui/badge';

type StatusType = 'pending' | 'in_review' | 'resolved';

export function StatusBadge({ status }: { status: StatusType }) {
  const { t } = useLanguage();

  const config: Record<StatusType, { label: string; className: string }> = {
    pending: { label: t('pending'), className: 'bg-warning/15 text-warning border-warning/30' },
    in_review: { label: t('inReview'), className: 'bg-info/15 text-info border-info/30' },
    resolved: { label: t('resolved'), className: 'bg-success/15 text-success border-success/30' },
  };

  const c = config[status] || config.pending;
  return <Badge variant="outline" className={c.className}>{c.label}</Badge>;
}

export function CategoryBadge({ category }: { category: string }) {
  const { t } = useLanguage();
  const labels: Record<string, string> = {
    teacher: t('teacher'),
    subject: t('subject'),
    administration: t('administration'),
    cleanliness: t('cleanliness'),
    facilities: t('facilities'),
    bullying: t('bullying'),
    schedule: t('schedule'),
    other: t('other'),
  };
  return <Badge variant="secondary">{labels[category] || category}</Badge>;
}
