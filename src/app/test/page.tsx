'use client';

import { createClient } from '@supabase/supabase-js';
import { useState } from 'react';

const supabaseUrl = 'https://civhtjriroyaljcdcsfx.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImNpdmh0anJpcm95YWxqY2Rjc2Z4Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDAwOTE5NzQsImV4cCI6MjA1NTY2Nzk3NH0.7FCQxehi055PrEDcsX1H7yYT5SMv7wr_lJaq1U0IiZE';
const supabase = createClient(supabaseUrl, supabaseAnonKey);

export default function AuthTest() {
  const [loading, setLoading] = useState(false);

  async function signInWithGoogle() {
    setLoading(true);
    await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: 'http://localhost:3000'
      }
    });
  }

  return (
    <div style={{ padding: '40px', textAlign: 'center' }}>
      <h1>Google Auth Test</h1>
      <button
        onClick={signInWithGoogle}
        disabled={loading}
        style={{
          backgroundColor: '#4285F4',
          color: 'white',
          padding: '10px 15px',
          border: 'none',
          borderRadius: '4px',
          cursor: loading ? 'default' : 'pointer'
        }}
      >
        {loading ? 'Loading...' : 'Sign in with Google'}
      </button>
    </div>
  );
}