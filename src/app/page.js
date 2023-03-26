"use client"

import { useState, useEffect } from 'react'

import Image from 'next/image'
import { Inter } from 'next/font/google'
import styles from './page.module.css'

const inter = Inter({ subsets: ['latin'] })

import { configureChains, createClient, WagmiConfig } from 'wagmi';
import { mainnet, polygon } from 'wagmi/chains';
import { publicProvider } from 'wagmi/providers/public'
const { provider, webSocketProvider } = configureChains([polygon, mainnet], [publicProvider()]);

import { LensConfig, production } from '@lens-protocol/react-web';
import { bindings as wagmiBindings } from '@lens-protocol/wagmi';

const lensConfig = {
  bindings: wagmiBindings(),
  environment: production,
};

const client = createClient({
  autoConnect: true,
  provider,
  webSocketProvider,
});

import { LensProvider } from '@lens-protocol/react-web';


export default function Home() {
  return (
    <main className={styles.main}>
      <WagmiConfig client={client}>
      <LensProvider config={lensConfig}>
        <App />
      </LensProvider>
      </WagmiConfig>
    </main>
  )
}

import { useProfile } from '@lens-protocol/react-web';
import useNestedFollowers from './hooks/useNestedFollowers';
import Graph from './components/Graph';

function App() {
  const { data: profile, loading: profileLoading } = useProfile({
    handle: 'sserrano44.lens',
  });

  const { data: followers, loading: followersLoading } = useNestedFollowers(
    'sserrano44.lens',
    2
  );

  if (profileLoading || followersLoading) {
    return <div>Loading...</div>;
  }


  return (
    <div>
      <h1>Nested Followers Graph for {profile.name}</h1>
      <Graph data={followers} />
    </div>
  );
}