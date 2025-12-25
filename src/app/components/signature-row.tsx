"use client";

import React, { useEffect, useState } from "react";
import { useLazyGetTransactionQuery } from "@/api";
import { parseSwapSummary } from "@/lib/parse";

export const SignatureRow: React.FC<{ sig: SignatureInfo }> = ({ sig }) => {
    const [getTransaction, { data: transactionData, isLoading }] = useLazyGetTransactionQuery();
    const [summary, setSummary] = useState<SwapSummary | null>(null);

    useEffect(() => {
        if (transactionData) {
            const parsed = parseSwapSummary(transactionData);
            setSummary(parsed);
        }
    }, [transactionData]);

    return (
        <tr className="border-b bg-white dark:border-zinc-700 dark:bg-zinc-900">
            <td className="px-6 py-4 font-medium text-zinc-900 dark:text-white truncate max-w-50" title={sig.signature}>
                <a href={`https://solscan.io/tx/${sig.signature}`} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline dark:text-blue-400">
                    {sig.signature.slice(0, 20)}...
                </a>
            </td>
            <td
                className="px-6 py-4 cursor-pointer hover:text-blue-600 transition-colors"
                onClick={() => getTransaction({ signature: sig.signature })}
                title="Get Transaction Details"
            >
                {isLoading ? "Loading..." : summary ? <div className="flex flex-col gap-1 text-xs">
                    {Object.entries(summary.debit).map(([mint, amount]) => (
                        <div key={mint} className="text-green-600 dark:text-green-400 truncate" title={`${amount} ${mint}`}>
                            + {Number(amount.toFixed(4))} {mint.slice(0, 4)}...
                        </div>
                    ))}
                    {Object.entries(summary.credit).map(([mint, amount]) => (
                        <div key={mint} className="text-red-600 dark:text-red-400 truncate" title={`${amount} ${mint}`}>
                            - {Number(amount.toFixed(4))} {mint.slice(0, 4)}...
                        </div>
                    ))}
                </div> : sig.slot}
            </td>
            <td className="px-6 py-4">{sig.blockTime ? new Date(sig.blockTime * 1000).toLocaleString("RU-ru") : "N/A"}</td>
        </tr>
    );
};