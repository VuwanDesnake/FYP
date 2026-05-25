
-- Fix notifications insert policy - only authenticated users can insert for themselves
DROP POLICY "Service role can insert notifications" ON public.notifications;
CREATE POLICY "Authenticated can insert own notifications" ON public.notifications FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Fix badges insert policy
DROP POLICY "Service role can insert badges" ON public.badges;
CREATE POLICY "Authenticated can insert own badges" ON public.badges FOR INSERT WITH CHECK (auth.uid() = user_id);
