"use client";

import { useCallback, useState } from "react";
import { useGetSignaturesForAddressQuery } from "@/api";
import { SignaturesTable } from "./components/signatures-table";

export default function Home() {
    const [wallet, setWallet] = useState("");
    const [isValid, setIsValid] = useState(false);
    const [queryAddress, setQueryAddress] = useState("");
    const { data: signatures, isLoading, error } = useGetSignaturesForAddressQuery({ address: queryAddress, limit: 20 }, { skip: !queryAddress });
    // const { data, isLoading: isLoadingTransaction } = useGetAccountInfoQuery({ address: queryAddress }, { skip: !queryAddress });
    const handleInput = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
        const value = e.target.value;
        setWallet(value);

        // Простая валидация Solana адреса (Base58, длина 32-44 символа)
        const solanaRegex = /^[1-9A-HJ-NP-Za-km-z]{32,44}$/;
        setIsValid(solanaRegex.test(value));
    }, []);

    return (
        <div className="flex min-h-screen items-center justify-center bg-zinc-50 font-sans dark:bg-black">
            <main className="flex w-full max-w-5xl flex-col items-center gap-6 px-4 py-12">
                <input
                    type="text"
                    placeholder="FeutrNsE4P21kLoEqteLQYQpH2PQQF8nyC6ZWzEkpump"
                    maxLength={44}
                    minLength={32}
                    value={wallet}
                    onChange={handleInput}
                    className="w-full rounded-lg border border-zinc-300 p-4 text-center text-lg shadow-sm focus:border-black focus:outline-none focus:ring-1 focus:ring-black dark:border-zinc-700 dark:bg-zinc-900 dark:text-white dark:focus:border-white dark:focus:ring-white"
                />
                <button
                    disabled={!isValid || isLoading}
                    onClick={() => setQueryAddress(wallet)}
                    className={`rounded-full px-8 py-3 font-semibold transition-all ${isValid && !isLoading
                        ? "bg-black text-white hover:bg-zinc-800 dark:bg-white dark:text-black dark:hover:bg-zinc-200"
                        : "cursor-not-allowed bg-zinc-200 text-zinc-400 dark:bg-zinc-800 dark:text-zinc-600"
                        }`}
                >
                    {isLoading ? "Загрузка..." : "Продолжить"}
                </button>

                {error && (
                    <div className="text-red-500">
                        Произошла ошибка при получении данных
                    </div>
                )}

                {signatures && <SignaturesTable signatures={signatures} />}
            </main>
        </div>
    );
}
