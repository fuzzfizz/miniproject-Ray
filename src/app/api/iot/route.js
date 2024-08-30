import { Client } from 'pg';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

// Initialize PostgreSQL client
const client = new Client({
    connectionString: process.env.DATABASE_URL,
});

// Connect to the database
client.connect().catch((err) => {
    console.error("Database connection error:", err);
});
export const dynamic = "force-dynamic";

const corsHeaders = {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type, Authorization",
};

async function connectDatabase() {
    try {
        await client.connect();
        console.log('Database connected');
    } catch (error) {
        console.error('Database connection error:', error);
        throw new Error('Failed to connect to database');
    }
}

export async function POST(request) {
    try {
        const requestBody = await request.json();
        const { SANG, SANG_LED, UNP, UNP_LED } = requestBody;

        if (typeof SANG !== 'number' || typeof SANG_LED !== 'number' || typeof UNP !== 'number' || typeof UNP_LED !== 'number') {
            return new Response(
                JSON.stringify({ error: "Invalid data format" }),
                {
                    status: 400,
                    headers: {
                        "Content-Type": "application/json",
                        "Cache-Control": "no-cache",
                    },
                }
            );
        }

        const result = await client.query(
            'INSERT INTO "VIP027" ("SANG", "SANG_LED", "UNP", "UNP_LED") VALUES ($1, $2, $3, $4) RETURNING "SANG", "SANG_LED", "UNP", "UNP_LED"',
            [SANG, SANG_LED, UNP, UNP_LED]
        );

        return new Response(
            JSON.stringify(result.rows[0]),
            {
                status: 201,
                headers: {
                    "Content-Type": "application/json",
                    "Cache-Control": "no-cache",
                },
            }
        );
    } catch (error) {
        console.error("Error inserting data:", error.message);
        console.error("Stack trace:", error.stack);
        return new Response(
            JSON.stringify({ error: "Internal Server Error" }),
            {
                status: 500,
                headers: {
                    "Content-Type": "application/json",
                },
            }
        );
    }
}

//------------------------------------------------------------------------------------------------

export async function GET(request) {
    try {
        // Query the database for the latest LED_Status
        const result = await client.query('SELECT "LED_Status" FROM "VIP027" WHERE id = 1 ORDER BY id DESC LIMIT 1');

        if (result.rows.length === 0) {
            return new Response(JSON.stringify({ error: "No data found" }), {
                status: 404,
                headers: { ...corsHeaders, "Content-Type": "application/json" },
            });
        }

        const ledStatus = result.rows[0].LED_Status;

        return new Response(JSON.stringify({ LED_Status: ledStatus }), {
            status: 200,
            headers: {
                ...corsHeaders,
                "Content-Type": "application/json",
                "Cache-Control": "no-cache"
            },
        });
    } catch (error) {
        console.error("Error retrieving LED status:", error);
        return new Response(JSON.stringify({ error: "Internal Server Error" }), {
            status: 500,
            headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
    }
}
//-----------------------------------------------------------------------------------
// pages/api/updateLedStatus.js

export async function PUT(request) {
    try {
        // Parse the request body as JSON
        const requestBody = await request.json();
        const { LED_Status } = requestBody;

        // Update the LED_Status in the database
        const result = await client.query(
            'UPDATE "VIP027" SET "LED_Status" = $1 WHERE id = 1  RETURNING *',
            [LED_Status]
        );

        // Check if update was successful
        if (result.rowCount === 0) {
            return new Response(JSON.stringify({ error: "Sensor ID not found" }), {
                status: 404,
                headers: { ...corsHeaders, "Content-Type": "application/json" },
            });
        }

        return new Response(JSON.stringify(result.rows[0]), {
            status: 200,
            headers: {
                ...corsHeaders,
                "Content-Type": "application/json",
                "Cache-Control": "no-cache"
            },
        });
    } catch (error) {
        console.error("Error updating LED status:", error);
        return new Response(JSON.stringify({ error: "Internal Server Error" }), {
            status: 500,
            headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
    }
}