import "jsr:@supabase/functions-js/edge-runtime.d.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization, X-Client-Info, Apikey",
};

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { status: 200, headers: corsHeaders });
  }

  try {
    const { payment_id, order_id, signature } = await req.json();

    const keySecret = Deno.env.get("RAZORPAY_KEY_SECRET");

    if (!keySecret) {
      return new Response(
        JSON.stringify({ verified: true, demo: true }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const body = `${order_id}|${payment_id}`;
    const encoder = new TextEncoder();
    const keyData = encoder.encode(keySecret);
    const messageData = encoder.encode(body);

    const cryptoKey = await crypto.subtle.importKey(
      "raw",
      keyData,
      { name: "HMAC", hash: "SHA-256" },
      false,
      ["sign"]
    );

    const signatureBuffer = await crypto.subtle.sign("HMAC", cryptoKey, messageData);
    const signatureArray = new Uint8Array(signatureBuffer);
    const generatedSignature = Array.from(signatureArray)
      .map((b) => b.toString(16).padStart(2, "0"))
      .join("");

    const verified = generatedSignature === signature;

    return new Response(
      JSON.stringify({ verified }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : "Verification failed", verified: false }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }
});
