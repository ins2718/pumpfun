"use client";

import { useCallback, useState } from "react";
import { useLazyGetSignaturesForAddressQuery } from "@/api";
import { SignaturesTable } from "./components/signatures-table";

const sleep = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

export default function Home() {
    const [wallet, setWallet] = useState("");
    const [isValid, setIsValid] = useState(false);
    const [signatures, setSignatures] = useState<SignatureInfo[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [status, setStatus] = useState("");
    const [trigger] = useLazyGetSignaturesForAddressQuery();

    const handleInput = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
        const value = e.target.value;
        setWallet(value);

        // Простая валидация Solana адреса (Base58, длина 32-44 символа)
        const solanaRegex = /^[1-9A-HJ-NP-Za-km-z]{32,44}$/;
        setIsValid(solanaRegex.test(value));
    }, []);

    const handleLoad = async () => {
        if (!isValid) return;
        setIsLoading(true);
        setSignatures([]);
        setStatus("Начинаем загрузку...");

        let currentBefore: string | undefined = undefined;
        let hasMore = true;
        let totalLoaded = 0;
        const delay = 10000;

        try {
            while (hasMore) {
                const result = await trigger({ address: wallet, limit: 1000, before: currentBefore }).unwrap();

                if (result === undefined) {
                    setStatus(`Ошибка ответа API, повтор через ${delay / 1000} секунд...`);
                    await sleep(delay);
                    continue;
                }

                if (result.length > 0) {
                    setSignatures((prev) => [...prev, ...result]);
                    totalLoaded += result.length;
                    setStatus(`Загружено ${totalLoaded} транзакций...`);

                    currentBefore = result[result.length - 1].signature;
                    if (result.length < 1000) hasMore = false;
                } else {
                    hasMore = false;
                }
            }
            setStatus(`Загрузка завершена. Всего: ${totalLoaded}`);
        } catch (e) {
            setStatus("Ошибка при загрузке");
            console.error(e);
        } finally {
            setIsLoading(false);
        }
    };

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
                    onClick={handleLoad}
                    className={`rounded-full px-8 py-3 font-semibold transition-all ${isValid && !isLoading
                        ? "bg-black text-white hover:bg-zinc-800 dark:bg-white dark:text-black dark:hover:bg-zinc-200"
                        : "cursor-not-allowed bg-zinc-200 text-zinc-400 dark:bg-zinc-800 dark:text-zinc-600"
                        }`}
                >
                    {isLoading ? "Загрузка..." : "Продолжить"}
                </button>

                {status && (
                    <div className="text-sm text-zinc-500 dark:text-zinc-400">
                        {status}
                    </div>
                )}

                {signatures.length > 0 && <SignaturesTable signatures={signatures} isLoading={isLoading} />}
            </main>
        </div>
    );
}
