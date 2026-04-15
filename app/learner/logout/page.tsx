import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';

// Server Component — clears the learner session cookie then redirects to login.
export default async function LearnerLogoutPage() {
  const cookieStore = await cookies();
  cookieStore.set('orbit_learner_session', '', {
    httpOnly: true,
    sameSite: 'lax',
    path: '/',
    maxAge: 0, // immediately expire
  });
  redirect('/learner/login');
}
