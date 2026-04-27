import React, { createContext, useContext, useState, useCallback } from 'react';

type Language = 'en' | 'ar';

const translations = {
  en: {
    // Auth
    login: 'Login',
    signup: 'Sign Up',
    email: 'Email',
    password: 'Password',
    confirmPassword: 'Confirm Password',
    loginTitle: 'Welcome Back',
    signupTitle: 'Create Account',
    loginSubtitle: 'Sign in to your account',
    signupSubtitle: 'Register for a new account',
    noAccount: "Don't have an account?",
    hasAccount: 'Already have an account?',
    loggingIn: 'Signing in...',
    signingUp: 'Creating account...',
    checkEmail: 'Please check your email for verification.',

    // Navigation
    complaints: 'Complaints',
    suggestions: 'Suggestions',
    profile: 'Profile',
    dashboard: 'Dashboard',
    users: 'Users',
    analytics: 'Analytics',
    pricing: 'Pricing',
    logout: 'Logout',

    // Student
    submitComplaint: 'Submit Complaint',
    submitSuggestion: 'Submit Suggestion',
    title: 'Title',
    description: 'Description',
    category: 'Category',
    status: 'Status',
    date: 'Date',
    image: 'Image (Optional)',
    submit: 'Submit',
    myComplaints: 'My Complaints',
    mySuggestions: 'My Suggestions',
    noComplaints: 'No complaints yet',
    noSuggestions: 'No suggestions yet',
    noReplyYet:'لا يوجد رد بعد',
    supervisorReply:'رد المشرف: ',
    myComplaint: 'شكاواي',
    noComplaint: 'لا توجد شكاوى بعد',

    // Categories
    teacher: 'Teacher',
    subject: 'Subject',
    administration: 'Administration',
    cleanliness: 'Cleanliness',
    facilities: 'Facilities',
    bullying: 'Bullying' ,
    schedule: 'Schedule' ,
    other: 'Other' ,

    // Status
    pending: 'Pending',
    inReview: 'In Review',
    resolved: 'Resolved',

    // Supervisor
    allComplaints: 'All Complaints',
    allSuggestions: 'All Suggestions',
    reply: 'Reply',
    replyPlaceholder: 'Write your reply...',
    sendReply: 'Send Reply',
    changeStatus: 'Change Status',
    urgent: 'Urgent',
    replies: 'Replies',

    // Admin
    totalComplaints: 'Total Complaints',
    totalSuggestions: 'Total Suggestions',
    totalUsers: 'Total Users',
    resolutionRate: 'Resolution Rate',
    complaintsByCategory: 'Complaints by Category',
    complaintsOverTime: 'Complaints Over Time',
    weakestAreas: 'Weakest Areas',
    manageUsers: 'Manage Users',
    role: 'Role',
    student: 'Student',
    supervisor: 'Supervisor',
    admin: 'Admin',

    // Pricing
    pricingTier: 'Pricing Tier',
    currentTier: 'Current Tier',
    monthlyPrice: 'Monthly Price',
    activeStudents: 'Active Students',
    egpMonth: 'EGP/month',

    // General
    darkMode: 'Dark Mode',
    lightMode: 'Light Mode',
    language: 'Language',
    arabic: 'العربية',
    english: 'English',
    loading: 'Loading...',
    save: 'Save',
    cancel: 'Cancel',
    delete: 'Delete',
    edit: 'Edit',
    actions: 'Actions',
    search: 'Search...',
    welcomeBack: 'Welcome back',
    systemName: 'Student Feedback System',
  },
  ar: {
    login: 'تسجيل الدخول',
    signup: 'إنشاء حساب',
    email: 'البريد الإلكتروني',
    password: 'كلمة المرور',
    confirmPassword: 'تأكيد كلمة المرور',
    loginTitle: 'مرحباً بعودتك',
    signupTitle: 'إنشاء حساب جديد',
    loginSubtitle: 'سجّل الدخول إلى حسابك',
    signupSubtitle: 'سجّل حساباً جديداً',
    noAccount: 'ليس لديك حساب؟',
    hasAccount: 'لديك حساب بالفعل؟',
    loggingIn: 'جاري تسجيل الدخول...',
    signingUp: 'جاري إنشاء الحساب...',
    checkEmail: 'يرجى التحقق من بريدك الإلكتروني.',

    complaints: 'الشكاوى',
    suggestions: 'المقترحات',
    profile: 'الملف الشخصي',
    dashboard: 'لوحة التحكم',
    users: 'المستخدمون',
    analytics: 'التحليلات',
    pricing: 'التسعير',
    logout: 'تسجيل الخروج',

    submitComplaint: 'تقديم شكوى',
    submitSuggestion: 'تقديم مقترح',
    title: 'العنوان',
    description: 'الوصف',
    category: 'الفئة',
    status: 'الحالة',
    date: 'التاريخ',
    image: 'صورة (اختياري)',
    submit: 'إرسال',
    myComplaints: 'شكاواي',
    mySuggestions: 'مقترحاتي',
    noComplaints: 'لا توجد شكاوى بعد'
    noSuggestions: 'لا توجد مقترحات بعد',
    noReplyYet:'لا يوجد رد بعد',
    supervisorReply:'رد المشرف: ',
    myComplaint: 'شكاواي',
    noComplaint: 'لا توجد شكاوى بعد',

    teacher: 'المعلم',
    subject: 'المادة',
    administration: 'الإدارة',
    cleanliness: 'النظافة',
    facilities: 'المرافق',
    bullying: 'التنمر',
    schedule: 'الجدول',
    other: 'اخرى',

    pending: 'قيد الانتظار',
    inReview: 'قيد المراجعة',
    resolved: 'تم الحل',

    allComplaints: 'جميع الشكاوى',
    allSuggestions: 'جميع المقترحات',
    reply: 'الرد',
    replyPlaceholder: 'اكتب ردك...',
    sendReply: 'إرسال الرد',
    changeStatus: 'تغيير الحالة',
    urgent: 'عاجل',
    replies: 'الردود',

    totalComplaints: 'إجمالي الشكاوى',
    totalSuggestions: 'إجمالي المقترحات',
    totalUsers: 'إجمالي المستخدمين',
    resolutionRate: 'معدل الحل',
    complaintsByCategory: 'الشكاوى حسب الفئة',
    complaintsOverTime: 'الشكاوى عبر الزمن',
    weakestAreas: 'أضعف المجالات',
    manageUsers: 'إدارة المستخدمين',
    role: 'الدور',
    student: 'طالب',
    supervisor: 'مشرف',
    admin: 'مدير',

    pricingTier: 'فئة التسعير',
    currentTier: 'الفئة الحالية',
    monthlyPrice: 'السعر الشهري',
    activeStudents: 'الطلاب النشطون',
    egpMonth: 'جنيه/شهر',

    darkMode: 'الوضع الداكن',
    lightMode: 'الوضع الفاتح',
    language: 'اللغة',
    arabic: 'العربية',
    english: 'English',
    loading: 'جاري التحميل...',
    save: 'حفظ',
    cancel: 'إلغاء',
    delete: 'حذف',
    edit: 'تعديل',
    actions: 'الإجراءات',
    search: 'بحث...',
    welcomeBack: 'مرحباً بعودتك',
    systemName: 'نظام ملاحظات الطلاب',
  },
} as const;

type TranslationKey = keyof typeof translations.en;

interface LanguageContextType {
  lang: Language;
  setLang: (lang: Language) => void;
  t: (key: TranslationKey) => string;
  dir: 'ltr' | 'rtl';
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export function LanguageProvider({ children }: { children: React.ReactNode }) {
  const [lang, setLangState] = useState<Language>('en');

  const setLang = useCallback((newLang: Language) => {
    setLangState(newLang);
    document.documentElement.dir = newLang === 'ar' ? 'rtl' : 'ltr';
    document.documentElement.lang = newLang;
  }, []);

  const t = useCallback((key: TranslationKey) => {
    return translations[lang][key] || key;
  }, [lang]);

  const dir = lang === 'ar' ? 'rtl' : 'ltr';

  return (
    <LanguageContext.Provider value={{ lang, setLang, t, dir }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const context = useContext(LanguageContext);
  if (!context) throw new Error('useLanguage must be used within LanguageProvider');
  return context;
}
