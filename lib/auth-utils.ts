import { toast } from 'sonner';

export async function signOut(): Promise<boolean> {
  try {
    const csrfRes = await fetch('/api/auth/csrf');
    const { csrfToken } = await csrfRes.json();
    await fetch('/api/auth/signout', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({ csrfToken }),
    });
    toast.success('Signed out successfully');
    window.location.href = '/';
    return true;
  } catch {
    toast.error('Failed to sign out');
    return false;
  }
}
