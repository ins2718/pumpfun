"use client";

import React from "react";
import { SignatureRow } from "./signature-row";

interface SignaturesTableProps {
    signatures: SignatureInfo[];
}

export const SignaturesTable: React.FC<SignaturesTableProps> = ({ signatures }) => {
    return (
        <div className="w-full overflow-x-auto">
            <table className="w-full text-left text-sm text-zinc-500 dark:text-zinc-400">
                <thead className="bg-zinc-50 text-xs uppercase text-zinc-700 dark:bg-zinc-800 dark:text-zinc-400">
                    <tr>
                        <th className="px-6 py-3">Транзакция</th>
                        <th className="px-6 py-3">Изменения баланса</th>
                        <th className="px-6 py-3">Время</th>
                    </tr>
                </thead>
                <tbody>
                    {signatures.map((sig) => (
                        <SignatureRow key={sig.signature} sig={sig} />
                    ))}
                </tbody>
            </table>
        </div>
    );
};