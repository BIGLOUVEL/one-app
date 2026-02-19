import pg from 'pg';
const { Client } = pg;

const sql = `
CREATE TABLE IF NOT EXISTS user_data (
  user_id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  state JSONB NOT NULL DEFAULT '{}',
  version INTEGER NOT NULL DEFAULT 1,
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE user_data ENABLE ROW LEVEL SECURITY;

-- Drop policies if they exist (idempotent)
DROP POLICY IF EXISTS "Users can read own data" ON user_data;
DROP POLICY IF EXISTS "Users can insert own data" ON user_data;
DROP POLICY IF EXISTS "Users can update own data" ON user_data;
DROP POLICY IF EXISTS "Service role full access" ON user_data;

-- Create RLS policies
CREATE POLICY "Users can read own data" ON user_data FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own data" ON user_data FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own data" ON user_data FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Service role full access" ON user_data FOR ALL USING (auth.role() = 'service_role');
`;

// Try multiple connection approaches
const attempts = [
  {
    name: 'Direct connection (port 5432)',
    config: {
      host: 'db.ydvtxjgjockwpcdvqsow.supabase.co',
      port: 5432,
      database: 'postgres',
      user: 'postgres',
      password: 'postgres',
      ssl: { rejectUnauthorized: false },
      connectionTimeoutMillis: 10000,
    }
  },
  {
    name: 'Pooler transaction mode (port 6543)',
    config: {
      host: 'aws-0-eu-west-3.pooler.supabase.com',
      port: 6543,
      database: 'postgres',
      user: 'postgres.ydvtxjgjockwpcdvqsow',
      password: 'postgres',
      ssl: { rejectUnauthorized: false },
      connectionTimeoutMillis: 10000,
    }
  },
  {
    name: 'Pooler session mode (port 5432)',
    config: {
      host: 'aws-0-eu-west-3.pooler.supabase.com',
      port: 5432,
      database: 'postgres',
      user: 'postgres.ydvtxjgjockwpcdvqsow',
      password: 'postgres',
      ssl: { rejectUnauthorized: false },
      connectionTimeoutMillis: 10000,
    }
  }
];

for (const attempt of attempts) {
  console.log(`\nTrying: ${attempt.name}...`);
  const client = new Client(attempt.config);
  try {
    await client.connect();
    console.log('Connected! Executing SQL...');
    await client.query(sql);
    console.log('SUCCESS! Table user_data created with RLS policies.');
    await client.end();
    process.exit(0);
  } catch (err) {
    console.log(`Failed: ${err.message}`);
    try { await client.end(); } catch {}
  }
}

console.log('\nAll direct connection attempts failed.');
console.log('Trying Supabase Management API...');

// Try Management API
try {
  const res = await fetch('https://api.supabase.com/v1/projects/ydvtxjgjockwpcdvqsow/database/query', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InlkdnR4amdqb2Nrd3BjZHZxc293Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2ODc0MDIxMywiZXhwIjoyMDg0MzE2MjEzfQ.s3BRRq5ADQYAUMg-zGv6e67QFP_x1OnfuE7dUr9Bk2o',
    },
    body: JSON.stringify({ query: sql }),
  });
  const text = await res.text();
  console.log('Management API status:', res.status);
  console.log('Response:', text.substring(0, 300));
} catch (e) {
  console.log('Management API failed:', e.message);
}

console.log('\n--- RESULT ---');
console.log('Could not create the table automatically.');
console.log('Please paste the SQL above in the Supabase Dashboard SQL Editor.');
