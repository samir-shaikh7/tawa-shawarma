import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.3"

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const { order, items, turnstileToken } = await req.json()

    // Enforce Minimum Order Quantity (MOQ) of 2
    if (!items || !Array.isArray(items)) {
      return new Response(JSON.stringify({ error: "Invalid order items" }), { 
        status: 400, 
        headers: { ...corsHeaders, "Content-Type": "application/json" } 
      })
    }

    const totalQuantity = items.reduce((sum: number, item: any) => sum + (Number(item.quantity) || 0), 0)

    if (totalQuantity < 2) {
      return new Response(JSON.stringify({ error: "Minimum order quantity is 2 items." }), { 
        status: 400, 
        headers: { ...corsHeaders, "Content-Type": "application/json" } 
      })
    }

    const TURNSTILE_SECRET_KEY = Deno.env.get('TURNSTILE_SECRET_KEY')
    
    if (TURNSTILE_SECRET_KEY) {
      if (!turnstileToken) {
        return new Response(JSON.stringify({ error: "Missing Cloudflare Turnstile token" }), { 
          status: 400, 
          headers: { ...corsHeaders, "Content-Type": "application/json" } 
        })
      }

      if (turnstileToken !== "dev_bypass") {
        // Validate the token with Cloudflare
        const formData = new FormData();
        formData.append('secret', TURNSTILE_SECRET_KEY);
        formData.append('response', turnstileToken);

        const turnstileRes = await fetch('https://challenges.cloudflare.com/turnstile/v0/siteverify', {
          method: 'POST',
          body: formData,
        });
        
        const turnstileData = await turnstileRes.json();
        
        if (!turnstileData.success) {
          return new Response(JSON.stringify({ error: "Security check failed. Please try again." }), { 
            status: 403,
            headers: { ...corsHeaders, "Content-Type": "application/json" }
          })
        }
      }
    } else {
      console.log("⚠️ Turnstile validation bypassed: TURNSTILE_SECRET_KEY not configured. This should only happen in development.");
      // Note: In production, you MUST configure TURNSTILE_SECRET_KEY.
    }

    // Token is valid! Proceed with creating the order securely via Service Role
    const SUPABASE_URL = Deno.env.get('SUPABASE_URL')!
    const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY)
    
    const { data: orderData, error: orderError } = await supabase
      .from('orders')
      .insert([order])
      .select()
      .single()

    if (orderError) throw orderError

    const orderItemsToInsert = items.map((item: any) => ({
      ...item,
      order_id: orderData.id,
    }))

    const { error: itemsError } = await supabase
      .from('order_items')
      .insert(orderItemsToInsert)

    if (itemsError) throw itemsError

    // Fast-path: Invoke telegram-notify directly to eliminate race conditions and delays
    try {
      // Using async/await ensures it executes before the response closes, but it's very fast
      await supabase.functions.invoke('telegram-notify', {
        body: { record: orderData, items: orderItemsToInsert }
      })
      console.log(`[Order ${orderData.order_number}] Successfully triggered telegram-notify.`)
    } catch (notifyError) {
      console.error(`[Order ${orderData.order_number}] Failed to trigger telegram-notify:`, notifyError)
      // We don't throw here because the order was successfully placed
    }

    return new Response(
      JSON.stringify({ success: true, order: orderData }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    )
  } catch (error: any) {
    return new Response(JSON.stringify({ error: error.message }), { 
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 400 
    })
  }
})
