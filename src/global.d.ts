interface SolanaRpcResponse<T> {
    jsonrpc: "2.0";
    result: T;
    id: number;
}

interface SignatureInfo {
    signature: string;
    slot: number;
    err: any | null;
    memo: string | null;
    blockTime: number | null;
    confirmationStatus: "processed" | "confirmed" | "finalized" | null;
}

type SwapSummary = {
    user: string;
    credit: Record<string, number>;
    debit: Record<string, number>;
    sol?: {
        netDelta: number;          // (post-pre) в SOL
        grossInFromSystem: number; // сумма system transfers TO user
        grossOutFromSystem: number;// сумма system transfers FROM user
        fee: number;               // meta.fee в SOL
    };
};

type UiTokenAmount = {
    uiAmount: number | null;
    uiAmountString?: string;
    decimals: number;
    amount: string;
};

type TokenBalance = {
    accountIndex: number;
    mint: string;
    owner?: string;
    uiTokenAmount: UiTokenAmount;
};

type AccountKey = {
    pubkey: string;
    signer?: boolean;
    writable?: boolean;
    source?: string;
};

type SolanaTxJsonParsed = {
    blockTime?: number | null;
    meta?: {
        err: unknown;
        fee?: number; // lamports
        preBalances?: number[]; // lamports
        postBalances?: number[]; // lamports
        preTokenBalances?: TokenBalance[];
        postTokenBalances?: TokenBalance[];
        logMessages?: string[];
    };
    transaction?: {
        message?: {
            accountKeys?: (AccountKey | string)[];
        };
        signatures?: string[];
    };
};