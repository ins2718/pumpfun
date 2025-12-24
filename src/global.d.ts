export {};

declare global {
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
}