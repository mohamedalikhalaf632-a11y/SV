import { createClient } from '@supabase/supabase-js'; 

// هنا حط المسار الحقيقي بتاع الـ supabase client بتاعك
// لو مش عارفه، شوف أي ملف تاني فيه "import { supabase }" واعرف هو بيعمل import منين
import { supabase } from '@/integrations/supabase/client'; 

export async function checkSubscription(orgId: string) {
  // بنجيب بيانات الاشتراك من الداتابيز
  const { data: org } = await supabase
    .from('pricing')
    .select('subscription_status, current_plan_limit, subscription_expiry')
    .eq('id', orgId)
    .single();

  // بنعد الطلاب
  const { count } = await supabase
    .from('profiles')
    .select('*', { count: 'exact', head: true })
    .eq('org_id', orgId);

  // شروط القفل
  const isExpired = new Date() > new Date(org.subscription_expiry);
  const isLimitExceeded = count >= org.current_plan_limit;

  if (org.subscription_status === 'suspended' || isExpired || isLimitExceeded) {
    return { blocked: true }; // دي معناها "اقفله"
  }
  
  return { blocked: false }; // دي معناها "سيبه يدخل"
}