import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.3"

// Setup environment variables for Edge Function
// These must be set securely in the Supabase Dashboard
const TELEGRAM_BOT_TOKEN = Deno.env.get('TELEGRAM_BOT_TOKEN')
const TELEGRAM_CHAT_ID = Deno.env.get('TELEGRAM_CHAT_ID')
const SUPABASE_URL = Deno.env.get('SUPABASE_URL')!
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!

serve(async (req) => {
  try {
    // We expect this Edge Function to be triggered by a Database Webhook on INSERT to `orders` table
    const payload = await req.json()
    
    // Ignore legacy database webhook triggers to avoid duplicate notifications
    if (payload.type === 'INSERT' && payload.table === 'orders') {
      console.log("Ignoring database webhook trigger in favor of direct invocation.");
      return new Response(JSON.stringify({ message: "Webhook ignored" }), { status: 200 })
    }

    const record = payload.record // The newly inserted order
    const items = payload.items // The order items passed directly from checkout

    if (!record || !record.id) {
      return new Response("No order record found in payload", { status: 400 })
    }

    if (!TELEGRAM_BOT_TOKEN || !TELEGRAM_CHAT_ID) {
      console.error(`[Order ${record.order_number}] Missing Telegram secrets.`);
      throw new Error("Missing Telegram configuration in Supabase Secrets")
    }

    console.log(`[Order ${record.order_number}] Processing Telegram notification for ${record.customer_name}...`);

    // Format the items text directly from the payload
    const itemsText = items && items.length > 0 
      ? items.map((item: any) => `• ${item.product_name}\n  Variant: ${item.variant_name}\n  Qty: ${item.quantity}`).join('\n\n')
      : "No items provided";

    // Timezone formatting (IST)
    const orderDate = new Date(record.created_at);
    
    const formattedDate = new Intl.DateTimeFormat('en-IN', {
      timeZone: 'Asia/Kolkata',
      day: '2-digit',
      month: 'short',
      year: 'numeric'
    }).format(orderDate);

    const formattedTime = new Intl.DateTimeFormat('en-IN', {
      timeZone: 'Asia/Kolkata',
      hour: '2-digit',
      minute: '2-digit',
      hour12: true
    }).format(orderDate).toUpperCase();

    // Google Maps link based on address
    const googleMapsLink = record.address 
      ? `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(record.address)}`
      : null;

    // Construct the elegant HTML message
    const message = `🔔 <b>NEW ORDER</b>

<b>Order:</b>
${record.order_number}

<b>Date:</b>
${formattedDate}

<b>Time:</b>
${formattedTime}

<b>Status:</b>
${record.status || 'Pending'}

<b>Customer:</b>
${record.customer_name}

<b>Phone:</b>
${record.phone}
<a href="tel:${record.phone}">📞 Call Customer</a>

<b>Address:</b>
${record.address}
${googleMapsLink ? `<a href="${googleMapsLink}">📍 Open Location</a>` : ''}
${record.landmark ? `\n<b>Landmark:</b>\n${record.landmark}` : ''}
${record.notes ? `\n<b>Notes:</b>\n${record.notes}` : ''}

<b>Items:</b>
${itemsText}

<b>Total:</b>
₹${record.total}`;

    // Send securely to Telegram
    const response = await fetch(`https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/sendMessage`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        chat_id: TELEGRAM_CHAT_ID,
        text: message,
        parse_mode: 'HTML',
      }),
    })

    const result = await response.json()

    if (!response.ok) {
      console.error(`[Order ${record.order_number}] Telegram API Error:`, result);
      throw new Error(`Telegram API Error: ${result.description}`)
    }

    console.log(`[Order ${record.order_number}] Telegram notification sent successfully.`);

    return new Response(
      JSON.stringify({ success: true, result }),
      { headers: { "Content-Type": "application/json" } }
    )
  } catch (error: any) {
    console.error("Telegram Notification Edge Function Error:", error.message)
    return new Response(JSON.stringify({ error: error.message }), {
      headers: { "Content-Type": "application/json" },
      status: 400,
    })
  }
})
