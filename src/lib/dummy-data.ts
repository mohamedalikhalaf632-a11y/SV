export interface Complaint {
  id: string;
  user_id: string;
  title: string;
  description: string;
  category: 'teacher' | 'subject' | 'administration' | 'cleanliness' | 'facilities' | 'bullying' | 'schedule' | 'other';
  status: 'pending' | 'in_review' | 'resolved';
  image_url?: string;
  created_at: string;
  user_email?: string;
}

export interface Suggestion {
  id: string;
  user_id: string;
  title: string;
  description: string;
  created_at: string;
  user_email?: string;
}

export interface Reply {
  id: string;
  complaint_id: string;
  user_id: string;
  message: string;
  created_at: string;
  user_email?: string;
}

export const dummyComplaints: Complaint[] = [
  { id: '1', user_id: 'u1', title: 'Broken AC in Room 201', description: 'The air conditioner has been broken for 2 weeks.', category: 'facilities', status: 'pending', created_at: '2024-03-01T10:00:00Z', user_email: 'student1@gmail.com' },
  { id: '2', user_id: 'u1', title: 'Math teacher absent frequently', description: 'The math teacher has been absent 5 times this month.', category: 'teacher', status: 'in_review', created_at: '2024-03-05T14:00:00Z', user_email: 'student1@gmail.com' },
  { id: '3', user_id: 'u2', title: 'Dirty bathrooms', description: 'The bathrooms on the second floor are not cleaned regularly.', category: 'cleanliness', status: 'resolved', created_at: '2024-02-20T09:00:00Z', user_email: 'student2@gmail.com' },
  { id: '4', user_id: 'u2', title: 'Outdated science textbooks', description: 'The science textbooks are from 2015 and need updating.', category: 'subject', status: 'pending', created_at: '2024-03-10T11:00:00Z', user_email: 'student2@gmail.com' },
  { id: '5', user_id: 'u3', title: 'Slow administration response', description: 'It takes weeks to get any paperwork processed.', category: 'administration', status: 'in_review', created_at: '2024-03-08T16:00:00Z', user_email: 'student3@gmail.com' },
  { id: '6', user_id: 'u3', title: 'No lab equipment', description: 'Chemistry lab has no equipment for experiments.', category: 'facilities', status: 'pending', created_at: '2024-03-12T08:00:00Z', user_email: 'student3@gmail.com' },
];

export const dummySuggestions: Suggestion[] = [
  { id: '1', user_id: 'u1', title: 'Add water coolers', description: 'Install water coolers on every floor.', created_at: '2024-03-02T10:00:00Z', user_email: 'student1@gmail.com' },
  { id: '2', user_id: 'u2', title: 'Weekly sports activities', description: 'Organize weekly sports events for students.', created_at: '2024-03-06T12:00:00Z', user_email: 'student2@gmail.com' },
  { id: '3', user_id: 'u3', title: 'Student council meetings', description: 'Monthly meetings with administration.', created_at: '2024-03-09T15:00:00Z', user_email: 'student3@gmail.com' },
];

export const dummyReplies: Reply[] = [
  { id: '1', complaint_id: '2', user_id: 'sup1', message: 'We are looking into this matter.', created_at: '2024-03-06T10:00:00Z', user_email: 'supervisor@we.edu' },
  { id: '2', complaint_id: '3', user_id: 'sup1', message: 'This has been resolved. Thank you for reporting.', created_at: '2024-02-22T14:00:00Z', user_email: 'supervisor@we.edu' },
  { id: '3', complaint_id: '5', user_id: 'sup1', message: 'We have escalated this to the administration.', created_at: '2024-03-09T09:00:00Z', user_email: 'supervisor@we.edu' },
];

export function getPricingTier(studentCount: number): { tier: string; price: number; range: string } {
  if (studentCount <= 50) return { tier: 'Basic', price: 500, range: '0 - 50' };
  if (studentCount <= 200) return { tier: 'Standard', price: 1000, range: '51 - 200' };
  if (studentCount <= 500) return { tier: 'Premium', price: 1500, range: '201 - 500' };
  return { tier: 'Enterprise', price: 2000, range: '500+' };
}
