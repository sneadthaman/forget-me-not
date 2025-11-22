require('dotenv').config();
const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_KEY);

async function seed() {
  // Seed users
  const users = [
    {
      name: 'Alice',
      email: 'alice@example.com',
      password_hash: 'hash1',
      auto_send_enabled: true,
      default_lead_time_days: 10,
      default_card_tone: 'sweet',
      stripe_customer_id: 'cus_test123'
    },
    {
      name: 'Bob',
      email: 'bob@example.com',
      password_hash: 'hash2',
      auto_send_enabled: false,
      default_lead_time_days: 7,
      default_card_tone: 'funny',
      stripe_customer_id: 'cus_test456'
    }
  ];
  const { data: userData, error: userError } = await supabase
    .from('users')
    .insert(users)
    .select();
  if (userError) console.error('User seed error:', userError);
  else console.log('Seeded users:', userData);

  // Seed contacts (linked to first user)
  const userId = userData && userData[0] ? userData[0].id : null;
  const contacts = [
    {
      user_id: userId,
      name: 'Charlie',
      relationship: 'friend',
      address_line1: '123 Main St',
      address_line2: 'Apt 4B',
      city: 'New York',
      state: 'NY',
      postal_code: '10001',
      country: 'USA',
      address_validated: true,
      email: 'charlie@example.com'
    },
    {
      user_id: userId,
      name: 'Dana',
      relationship: 'coworker',
      address_line1: '456 Market St',
      address_line2: null,
      city: 'San Francisco',
      state: 'CA',
      postal_code: '94105',
      country: 'USA',
      address_validated: false,
      email: 'dana@example.com'
    }
  ];
  const { data: contactData, error: contactError } = await supabase
    .from('contacts')
    .insert(contacts)
    .select();
  if (contactError) console.error('Contact seed error:', contactError);
  else console.log('Seeded contacts:', contactData);

  // Seed occasions (linked to first user and first contact)
  const contactId = contactData && contactData[0] ? contactData[0].id : null;
  const occasions = [
    {
      user_id: userId,
      contact_id: contactId,
      occasion_type: 'Birthday',
      custom_label: 'Charlie’s Birthday',
      date: '2025-12-01',
      lead_time_days: 7,
      tone_preference: 'funny'
    },
    {
      user_id: userId,
      contact_id: contactId,
      occasion_type: 'Anniversary',
      custom_label: 'Work Anniversary',
      date: '2026-01-15',
      lead_time_days: 10,
      tone_preference: 'sweet'
    }
  ];
  const { data: occasionData, error: occasionError } = await supabase
    .from('occasions')
    .insert(occasions)
    .select();
  if (occasionError) console.error('Occasion seed error:', occasionError);
  else console.log('Seeded occasions:', occasionData);
}

seed();
