import { NextResponse } from "next/server";
import { getCachedTransaction, saveTransactionToCache } from "@/lib/cache";

export async function POST(request: Request) {
    try {
        const body = await request.json();
        const { method, params, id } = body;

        // Если это запрос getTransaction, проверяем кэш
        if (method === "getTransaction" && params?.[0]) {
            const cachedResult = getCachedTransaction(params[0]);
            if (cachedResult) {
                return NextResponse.json({
                    jsonrpc: "2.0",
                    result: cachedResult,
                    id: id,
                });
            }
        }

        const response = await fetch("https://api.mainnet-beta.solana.com", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify(body),
        });

        const data = await response.json();

        // Если запрос успешен и вернул результат, сохраняем в кэш
        if (method === "getTransaction" && params?.[0] && data.result) {
            saveTransactionToCache(params[0], data.result);
        }

        return NextResponse.json(data);
    } catch (error) {
        console.error("RPC Proxy Error:", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}