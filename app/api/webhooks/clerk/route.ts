import { Webhook } from 'svix';
import { headers } from 'next/headers';
import { WebhookEvent } from '@clerk/nextjs/server';
import { createClient } from '@supabase/supabase-js';
import type { CreateUser, UpdateUser } from '@/types';

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
  {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  }
);

export async function POST(req: Request) {
  const WEBHOOK_SECRET = process.env.CLERK_WEBHOOK_SECRET;

  if (!WEBHOOK_SECRET) {
    throw new Error('Please add CLERK_WEBHOOK_SECRET to .env.local');
  }

  const headerPayload = await headers();
  const svix_id = headerPayload.get('svix-id');
  const svix_timestamp = headerPayload.get('svix-timestamp');
  const svix_signature = headerPayload.get('svix-signature');

  if (!svix_id || !svix_timestamp || !svix_signature) {
    return new Response('Error occurred -- no svix headers', {
      status: 400,
    });
  }

  const payload = await req.json();
  const body = JSON.stringify(payload);

  const wh = new Webhook(WEBHOOK_SECRET);

  let evt: WebhookEvent;

  try {
    evt = wh.verify(body, {
      'svix-id': svix_id,
      'svix-timestamp': svix_timestamp,
      'svix-signature': svix_signature,
    }) as WebhookEvent;
  } catch (err) {
    console.error('Error verifying webhook:', err);
    return new Response('Error occurred', {
      status: 400,
    });
  }

  const eventType = evt.type;

  if (eventType === 'user.created') {
    const { id, email_addresses } = evt.data;
    const primaryEmail = email_addresses.find(
      (email) => email.id === evt.data.primary_email_address_id
    );

    if (primaryEmail) {
      const newUser: CreateUser = {
        clerk_id: id,
        email: primaryEmail.email_address,
      };

      const { error } = await supabaseAdmin.from('users').insert(newUser);

      if (error) {
        console.error('Error creating user in Supabase:', error);
        return new Response('Error creating user', { status: 500 });
      }
    }
  }

  if (eventType === 'user.updated') {
    const { id, email_addresses } = evt.data;
    const primaryEmail = email_addresses.find(
      (email) => email.id === evt.data.primary_email_address_id
    );

    if (primaryEmail) {
      const updatedUser: UpdateUser = {
        email: primaryEmail.email_address,
      };

      const { error } = await supabaseAdmin
        .from('users')
        .update(updatedUser)
        .eq('clerk_id', id);

      if (error) {
        console.error('Error updating user in Supabase:', error);
        return new Response('Error updating user', { status: 500 });
      }
    }
  }

  if (eventType === 'user.deleted') {
    const { id } = evt.data;

    if (id) {
      const { error } = await supabaseAdmin
        .from('users')
        .delete()
        .eq('clerk_id', id);

      if (error) {
        console.error('Error deleting user from Supabase:', error);
        return new Response('Error deleting user', { status: 500 });
      }
    }
  }

  return new Response('', { status: 200 });
}
