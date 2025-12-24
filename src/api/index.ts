/* eslint-disable @typescript-eslint/no-unused-vars */

import { RootState } from "@/lib/store";
import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";

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
        getSignaturesForAddress: builder.mutation<SignatureInfo[], { address: string; limit?: number }>({
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
    }),
})

export const { useGetSignaturesForAddressMutation } = api;