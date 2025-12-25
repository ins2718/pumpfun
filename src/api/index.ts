/* eslint-disable @typescript-eslint/no-unused-vars */

import { RootState } from "@/lib/store";
import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import type {
    AccountInfo,
    ParsedAccountData,
    ParsedTransactionWithMeta,
} from "@solana/web3.js";

export const api = createApi({
    reducerPath: "api",
    baseQuery: fetchBaseQuery({
        baseUrl: "/api",
        headers: {
            accept: "application/json",
        },
    }),
    tagTypes: [],
    endpoints: (builder) => ({
        getSignaturesForAddress: builder.query<SignatureInfo[], { address: string; limit?: number }>({
            query: ({ address, limit }) => ({
                url: "rpc",
                method: "POST",
                body: {
                    jsonrpc: "2.0",
                    id: 1,
                    method: "getSignaturesForAddress",
                    params: [
                        address,
                        { limit: limit ?? 1000 }
                    ]
                },
            }),
            transformResponse: (response: SolanaRpcResponse<SignatureInfo[]>) => response.result,
        }),
        getTransaction: builder.query<ParsedTransactionWithMeta, { signature: string }>({
            query: ({ signature }) => ({
                url: "rpc",
                method: "POST",
                body: {
                    jsonrpc: "2.0",
                    id: 1,
                    method: "getTransaction",
                    params: [
                        signature,
                        {
                            encoding: "jsonParsed",
                            maxSupportedTransactionVersion: 0,
                            commitment: "confirmed"
                        }
                    ]
                },
            }),
            transformResponse: (response: SolanaRpcResponse<any>) => response.result,
        }),
        getAccountInfo: builder.query<AccountInfo<ParsedAccountData> | null, { address: string }>({
            query: ({ address }) => ({
                url: "rpc",
                method: "POST",
                body: {
                    jsonrpc: "2.0",
                    id: 1,
                    method: "getAccountInfo",
                    params: [
                        address,
                        {
                            commitment: "finalized",
                            encoding: "jsonParsed"
                        }
                    ]
                },
            }),
            transformResponse: (response: SolanaRpcResponse<any>) => response.result,
        }),
    }),
})

export const { useGetSignaturesForAddressQuery, useLazyGetSignaturesForAddressQuery, useGetTransactionQuery, useLazyGetTransactionQuery, useGetAccountInfoQuery, useLazyGetAccountInfoQuery } = api;