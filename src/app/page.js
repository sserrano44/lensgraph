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
import { GoogleAnalytics } from "nextjs-google-analytics";


export default function Home() {
  return (
    <WagmiConfig client={client}>
      <GoogleAnalytics trackPageViews />
      <LensProvider config={lensConfig}>
        <App />
      </LensProvider>
    </WagmiConfig>
  )
}

import { useProfile } from '@lens-protocol/react-web';
import useNestedFollowers from './hooks/useNestedFollowers';
import useNestedFollowings from './hooks/useNestedFollowings';

import Graph from './components/Graph';

function App() {
  const [handle, setHandle] = useState('sserrano44.lens');
  const [inputHandle, setInputHandle] = useState(handle);

  const { data: profile, loading: profileLoading } = useProfile({
    handle: handle,
  });

  const { data: followers, loading: followersLoading } = useNestedFollowings(handle, 2);

  if (profileLoading || followersLoading) {
    return <div>Loading...</div>;
  }

  const handleInputChange = (event) => {
    setInputHandle(event.target.value);
  };

  const handleSearch = () => {
    setHandle(inputHandle);
  };

  return (
    <div>
      <div style={{
        position: 'absolute',
        top: 5,
        left: 5,
        'z-index': 1000,
      }}>
        <h1>Lens Following Graph</h1>
        <div>
          <input
            type="text"
            value={inputHandle}
            onChange={handleInputChange}
            placeholder="Enter handle"
          />
          <button onClick={handleSearch}>Search</button>
        </div>
        <h2>For {profile.name}</h2>
      </div>
      <Graph data={followers} />
    </div>
  );
}
