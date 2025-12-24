import React from "react";

interface SignaturesTableProps {
    signatures: SignatureInfo[];
}

export const SignaturesTable: React.FC<SignaturesTableProps> = ({ signatures }) => {
    return (
        <div className="w-full overflow-x-auto">
            <table className="w-full text-left text-sm text-zinc-500 dark:text-zinc-400">
                <thead className="bg-zinc-50 text-xs uppercase text-zinc-700 dark:bg-zinc-800 dark:text-zinc-400">
                    <tr>
                        <th className="px-6 py-3">Signature</th>
                        <th className="px-6 py-3">Slot</th>
                        <th className="px-6 py-3">Status</th>
                        <th className="px-6 py-3">Time</th>
                    </tr>
                </thead>
                <tbody>
                    {signatures.map((sig) => (
                        <tr key={sig.signature} className="border-b bg-white dark:border-zinc-700 dark:bg-zinc-900">
                            <td className="px-6 py-4 font-medium text-zinc-900 dark:text-white truncate max-w-50" title={sig.signature}>
                                <a href={`https://solscan.io/tx/${sig.signature}`} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline dark:text-blue-400">
                                    {sig.signature.slice(0, 20)}...
                                </a>
                            </td>
                            <td className="px-6 py-4">{sig.slot}</td>
                            <td className="px-6 py-4">{sig.confirmationStatus}</td>
                            <td className="px-6 py-4">{sig.blockTime ? new Date(sig.blockTime * 1000).toLocaleString() : "N/A"}</td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
};