// lib/auth.ts
import { supabase } from './supabase';
import { v4 as uuidv4 } from 'uuid';

export async function signInAnonymously() {
  // Use Supabase's anonymous sign-in
  const { data, error } = await supabase.auth.signInAnonymously();
  
  if (error) {
    console.error('Error signing in anonymously:', error);
    return { user: null, error };
  }
  
  // Generate a random username for this guest
  const guestUsername = `Badger_${uuidv4().slice(0, 6)}`;
  
  // Add user metadata to users table
  if (data.user) {
    // Update user metadata in auth
    await supabase.auth.updateUser({
      data: {
        username: guestUsername,
        avatar_url: '/avatars/student.png',
        is_guest: true
      }
    });
    
    // Create or update the profile in the users table
    const { error: profileError } = await supabase
      .from('users')
      .upsert({
        id: data.user.id,
        username: guestUsername,
        avatar_url: '/avatars/student.png',
        is_guest: true
      }, { onConflict: 'id' });
    
    if (profileError) {
      console.error('Error creating user profile:', profileError);
      return { user: data.user, error: profileError };
    }
  }
  
  return { user: data.user, error: null };
}

export async function getCurrentUser() {
  const { data } = await supabase.auth.getUser();
  if (!data.user) return null;
  
  // Get the user profile data
  const { data: profile } = await supabase
    .from('users')
    .select('*')
    .eq('id', data.user.id)
    .single();
    
  return {
    ...data.user,
    profile: profile || null
  };
}

export async function signOut() {
  const { error } = await supabase.auth.signOut();
  return { error };
}