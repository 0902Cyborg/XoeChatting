
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import * as postgres from "https://deno.land/x/postgres@v0.14.2/mod.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

// Define the Supabase client URL and key
const supabaseUrl = Deno.env.get("SUPABASE_URL") as string;
const supabaseKey = Deno.env.get("SUPABASE_ANON_KEY") as string;
const postgresUrl = Deno.env.get("POSTGRES_URL") as string;

// Define a function to handle data retrieval and persona updates
async function handleAiPersonaRequest(req: Request) {
  try {
    const { userId, actionType } = await req.json();

    // Connect to Postgres
    const pool = new postgres.Pool(postgresUrl, 3, true);
    const connection = await pool.connect();

    try {
      let result;
      if (actionType === "getPersonaData") {
        // Fetch user data to inform the AI persona
        const profileQuery = await connection.queryObject`
          SELECT * FROM profiles WHERE id = ${userId}
        `;
        
        const messagesQuery = await connection.queryObject`
          SELECT content, role, sent_at 
          FROM messages 
          WHERE user_id = ${userId}
          ORDER BY sent_at DESC
          LIMIT 50
        `;
        
        result = {
          profile: profileQuery.rows[0] || null,
          recentMessages: messagesQuery.rows || [],
        };
      } else if (actionType === "updateRelationshipStage") {
        // Calculate relationship stage based on message count
        const countQuery = await connection.queryObject`
          SELECT COUNT(*) FROM messages WHERE user_id = ${userId}
        `;
        
        const count = parseInt(countQuery.rows[0].count);
        let newStage = "new";
        
        if (count > 500) {
          newStage = "committed";
        } else if (count > 200) {
          newStage = "dating";
        } else if (count > 50) {
          newStage = "acquaintance";
        }
        
        // Update the profile
        await connection.queryObject`
          UPDATE profiles 
          SET relationship_stage = ${newStage}, updated_at = NOW()
          WHERE id = ${userId}
        `;
        
        result = { success: true, newStage };
      }
      
      return new Response(JSON.stringify(result), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200,
      });
    } finally {
      connection.release();
      await pool.end();
    }
  } catch (error) {
    console.error("Error in AI persona function:", error);
    return new Response(JSON.stringify({ error: error.message }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 500,
    });
  }
}

// Handle CORS preflight requests
async function handleCors() {
  return new Response(null, {
    headers: corsHeaders,
  });
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return handleCors();
  }
  
  // Process requests
  if (req.method === "POST") {
    return handleAiPersonaRequest(req);
  }
  
  // Handle unsupported methods
  return new Response(JSON.stringify({ error: "Method not allowed" }), {
    headers: { ...corsHeaders, "Content-Type": "application/json" },
    status: 405,
  });
});
