import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  const authHeader = req.headers.get('Authorization');
  if (!authHeader) {
    return new Response(JSON.stringify({ error: 'Not authenticated' }), {
      status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }

  // Service-role client — safe here because this runs on Supabase servers, not in the browser
  const adminClient = createClient(
    Deno.env.get('SUPABASE_URL') ?? '',
    Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
  );

  // Verify the caller is a real authenticated admin for this school
  const callerClient = createClient(
    Deno.env.get('SUPABASE_URL') ?? '',
    Deno.env.get('SUPABASE_ANON_KEY') ?? '',
    { global: { headers: { Authorization: authHeader } } },
  );

  const { data: { user }, error: sessionErr } = await callerClient.auth.getUser();
  if (sessionErr || !user) {
    return new Response(JSON.stringify({ error: 'Invalid session' }), {
      status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }

  const { data: caller } = await adminClient
    .from('teachers')
    .select('role, school_id')
    .eq('id', user.id)
    .single();

  if (!caller || caller.role !== 'admin') {
    return new Response(JSON.stringify({ error: 'Only school admins can create teachers' }), {
      status: 403, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }

  const { name, email, password, subjects, class_teacher_of } = await req.json();

  if (!name || !email || !password) {
    return new Response(JSON.stringify({ error: 'Name, email, and password are required' }), {
      status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }

  // Create the Supabase auth account
  const { data: ud, error: authErr } = await adminClient.auth.admin.createUser({
    email: email.trim(),
    password,
    email_confirm: true,
  });

  if (authErr || !ud?.user) {
    return new Response(JSON.stringify({ error: authErr?.message ?? 'Failed to create account' }), {
      status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }

  // Insert teacher record in the same school as the admin
  const { error: dbErr } = await adminClient.from('teachers').insert({
    id: ud.user.id,
    school_id: caller.school_id,
    name: name.trim(),
    email: email.trim(),
    role: 'teacher',
    subjects: subjects ?? [],
    class_teacher_of: class_teacher_of?.trim() || null,
  });

  if (dbErr) {
    // Roll back the auth user so we don't leave orphans
    await adminClient.auth.admin.deleteUser(ud.user.id);
    return new Response(JSON.stringify({ error: dbErr.message }), {
      status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }

  return new Response(JSON.stringify({ success: true, user_id: ud.user.id }), {
    status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
  });
});
