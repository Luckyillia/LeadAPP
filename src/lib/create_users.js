// ============================================================
// LEADAPP — Tworzenie użytkowników przez Supabase Admin API
// ============================================================
// Uruchom: node create_users.js
// Wymagane: npm install @supabase/supabase-js
//
// Uzupełnij SUPABASE_URL i SERVICE_ROLE_KEY
// (nie anon key — service_role key z Settings → API)
// ============================================================

import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL     = 'https://rwjnvzyqcidfafwjiuga.supabase.co';
const SERVICE_ROLE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJ3am52enlxY2lkZmFmd2ppdWdhIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzkyMzE5MTUsImV4cCI6MjA5NDgwNzkxNX0.yUbtJNj0_vAXV57R7nwpD13PRlOTifa2JA34rLrTzSk';

const supabase = createClient(SUPABASE_URL, SERVICE_ROLE_KEY, {
  auth: { autoRefreshToken: false, persistSession: false }
});

const USERS = [
  { email: 'admin@leadapp.pl',   password: 'Admin1234!',  full_name: 'Anna Kowalska',      role: 'admin'        },
  { email: 'cc1@leadapp.pl',     password: 'Agent1234!',  full_name: 'Piotr Nowak',         role: 'agent_cc'     },
  { email: 'cc2@leadapp.pl',     password: 'Agent1234!',  full_name: 'Marta Wiśniewska',    role: 'agent_cc'     },
  { email: 'sd1@leadapp.pl',     password: 'Sales1234!',  full_name: 'Tomasz Lewandowski',  role: 'sales_direct' },
  { email: 'sd2@leadapp.pl',     password: 'Sales1234!',  full_name: 'Karolina Zając',      role: 'sales_direct' },
  { email: 'buyer@techcorp.pl',  password: 'Buyer1234!',  full_name: 'Marek Dąbrowski',     role: 'buyer'        },
];

async function main() {
  console.log('Tworzenie użytkowników...\n');

  for (const u of USERS) {
    const { data, error } = await supabase.auth.admin.createUser({
      email:            u.email,
      password:         u.password,
      email_confirm:    true,
      user_metadata:    { full_name: u.full_name, role: u.role },
    });

    if (error) {
      console.error(`✗ ${u.email}: ${error.message}`);
    } else {
      console.log(`✓ ${u.email}  →  ${data.user.id}`);
    }
  }

  console.log('\nGotowe! Teraz uruchom leadapp_demo_data.sql w Supabase SQL Editor.');
}

main();
