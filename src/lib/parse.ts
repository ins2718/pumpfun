import type { ParsedTransactionWithMeta, ParsedInstruction } from "@solana/web3.js";

const LAMPORTS_PER_SOL = 1_000_000_000;

function toPubkeyString(k: any): string {
    if (k && typeof k === "object" && "pubkey" in k) return String(k.pubkey);
    return String(k);
}

function isSigner(k: any): boolean {
    return !!(k && typeof k === "object" && "signer" in k && k.signer);
}

function safeNum(x: unknown): number {
    const n = typeof x === "number" ? x : typeof x === "string" ? Number(x) : NaN;
    return Number.isFinite(n) ? n : 0;
}

function uiAmountFromTokenBalance(tb: any): number {
    const ui = tb?.uiTokenAmount?.uiAmount;
    if (typeof ui === "number") return ui;
    const s = tb?.uiTokenAmount?.uiAmountString;
    return typeof s === "string" ? safeNum(s) : 0;
}

function sumSystemTransfers(tx: ParsedTransactionWithMeta, user: string) {
    const instructions = (tx.transaction.message as any).instructions ?? [];
    let grossIn = 0;
    let grossOut = 0;

    for (const ix of instructions as any[]) {
        const parsed = ix?.parsed as ParsedInstruction["parsed"] | undefined;
        if (!parsed || typeof parsed !== "object") continue;

        // system transfer в jsonParsed выглядит как:
        // { program: "system", parsed: { type: "transfer", info: { source, destination, lamports } } }
        if (ix.program !== "system") continue;
        if (parsed.type !== "transfer") continue;

        const info: any = (parsed as any).info;
        const source = String(info?.source ?? "");
        const destination = String(info?.destination ?? "");
        const lamports = Number(info?.lamports ?? 0);

        if (!lamports) continue;
        const sol = lamports / LAMPORTS_PER_SOL;

        if (destination === user) grossIn += sol;
        if (source === user) grossOut += sol;
    }

    return { grossIn, grossOut };
}

/**
 * Делает "сводку" по изменению активов пользователя в транзакции:
 * credit = что пользователь ОТДАЛ
 * debit  = что пользователь ПОЛУЧИЛ
 *
 * По токенам берём net-дельту uiAmount для всех mint'ов, где owner==user (если owner доступен).
 * По SOL берём net-дельту баланса userIndex (post-pre).
 * Дополнительно считаем gross system transfers, чтобы объяснять расхождения с "страницей пользователя".
 */
export function parseSwapSummary(tx: ParsedTransactionWithMeta): SwapSummary {
    if (!tx.meta) throw new Error("No meta in transaction");
    if (tx.meta.err) throw new Error("Transaction failed");

    const keys: any[] = (tx.transaction.message as any).accountKeys ?? [];
    let userIndex = keys.findIndex(isSigner);
    if (userIndex < 0) userIndex = 0;

    const user = toPubkeyString(keys[userIndex]);
    if (!user) throw new Error("Cannot determine user");

    // SOL net delta
    const preLamports = (tx.meta.preBalances?.[userIndex] ?? 0);
    const postLamports = (tx.meta.postBalances?.[userIndex] ?? 0);
    const netDeltaSol = (postLamports - preLamports) / LAMPORTS_PER_SOL;

    // Token net deltas (multi-token)
    const preTB = tx.meta.preTokenBalances ?? [];
    const postTB = tx.meta.postTokenBalances ?? [];

    const preByMint = new Map<string, number>();
    const postByMint = new Map<string, number>();

    const add = (m: Map<string, number>, mint: string, v: number) => {
        if (!mint) return;
        m.set(mint, (m.get(mint) ?? 0) + v);
    };

    for (const tb of preTB as any[]) {
        if (tb?.owner && tb.owner !== user) continue;
        add(preByMint, String(tb.mint), uiAmountFromTokenBalance(tb));
    }
    for (const tb of postTB as any[]) {
        if (tb?.owner && tb.owner !== user) continue;
        add(postByMint, String(tb.mint), uiAmountFromTokenBalance(tb));
    }

    const credit: Record<string, number> = {};
    const debit: Record<string, number> = {};

    // SOL: если netDeltaSol отрицательный — пользователь ОТДАЛ SOL => credit.sol
    //      если положительный — пользователь ПОЛУЧИЛ SOL => debit.sol
    if (netDeltaSol < 0) credit["sol"] = -netDeltaSol;
    if (netDeltaSol > 0) debit["sol"] = netDeltaSol;

    // Tokens: если delta отрицательная — пользователь ОТДАЛ токен => credit[mint]
    //         если положительная — пользователь ПОЛУЧИЛ токен => debit[mint]
    const allMints = new Set<string>([...preByMint.keys(), ...postByMint.keys()]);
    for (const mint of allMints) {
        const d = (postByMint.get(mint) ?? 0) - (preByMint.get(mint) ?? 0);
        if (Math.abs(d) < 1e-12) continue;

        if (d < 0) credit[mint] = -d;
        else debit[mint] = d;
    }

    // gross system transfers (часто совпадает с тем, что "видит" эксплорер в активности)
    const { grossIn, grossOut } = sumSystemTransfers(tx, user);
    const feeSol = (tx.meta.fee ?? 0) / LAMPORTS_PER_SOL;

    return {
        user,
        credit,
        debit,
        sol: {
            netDelta: netDeltaSol,
            grossInFromSystem: grossIn,
            grossOutFromSystem: grossOut,
            fee: feeSol,
        },
    };
}
