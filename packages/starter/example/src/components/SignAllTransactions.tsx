import { Button } from '@mui/material';
import { useConnection, useWallet } from '@solana/wallet-adapter-react';
import { PublicKey, Transaction, TransactionInstruction } from '@solana/web3.js';
import bs58 from 'bs58';
import type { FC } from 'react';
import React, { useCallback } from 'react';
import { useNotify } from './notify';

export const SignAllTransactions: FC = () => {
    const { connection } = useConnection();
    const { publicKey, signAllTransactions } = useWallet();
    const notify = useNotify();

    const onClick = useCallback(async () => {
        try {
            if (!publicKey) throw new Error('Wallet not connected!');
            if (!signAllTransactions) throw new Error('Wallet does not support transaction signing!');

            const { blockhash } = await connection.getLatestBlockhash();

            const transactions = await signAllTransactions([
                new Transaction({
                    feePayer: publicKey,
                    recentBlockhash: blockhash,
                }).add(
                    new TransactionInstruction({
                        data: Buffer.from('Hello, from the Solana Wallet Adapter example app!#1'),
                        keys: [],
                        programId: new PublicKey('MemoSq4gqABAXKb96qnH8TysNcWxMyWCqXgDLGmfcHr'),
                    })
                ),
                new Transaction({
                    feePayer: publicKey,
                    recentBlockhash: blockhash,
                }).add(
                    new TransactionInstruction({
                        data: Buffer.from('Hello, from the Solana Wallet Adapter example app!#2'),
                        keys: [],
                        programId: new PublicKey('MemoSq4gqABAXKb96qnH8TysNcWxMyWCqXgDLGmfcHr'),
                    })
                ),
            ]);
            if (transactions.some((transaction) => !transaction.signature)) throw new Error('Transaction not signed!');
            const signatures = transactions.map((transaction) => bs58.encode(transaction.signature!));
            notify('info', `Transaction signed: ${signatures}`);
            if (!transactions.every((transaction) => transaction.verifySignatures()))
                throw new Error(`Transaction signature invalid! ${signatures}`);
            notify('success', `Transaction signature valid! ${signatures}`);
        } catch (error: any) {
            notify('error', `Transaction signing failed! ${error?.message}`);
        }
    }, [publicKey, signAllTransactions, connection, notify]);

    return (
        <Button variant="contained" color="secondary" onClick={onClick} disabled={!publicKey || !signAllTransactions}>
            Sign All Transaction
        </Button>
    );
};
