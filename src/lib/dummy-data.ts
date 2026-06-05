export interface Complaint {
  replies: any;
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



