// hooks/useNestedFollowers.js
import { useState, useEffect } from 'react';
import LensClient, { polygon } from '@lens-protocol/client';

const lensClient = new LensClient({ environment: polygon });

async function fetchNestedFollowers(profileId, depth) {
  if (depth === 0) return [];

  console.log(profileId);

  const results = await lensClient.profile.allFollowers({ profileId });
  const nestedFollowersPromises = results.items.map((follower) =>
    fetchNestedFollowers(follower.wallet.defaultProfile.id, depth - 1)
  );
  const nestedFollowers = await Promise.all(nestedFollowersPromises);

  return results.items.map((follower, index) => ({
    ...follower.wallet.defaultProfile,
    children: nestedFollowers[index],
  }));
}

export default function useNestedFollowers(handle, depth = 3) {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      setLoading(true);
      const profile = await lensClient.profile.fetch({ handle: handle });
      console.log('profile', profile);
      const followers = await fetchNestedFollowers(profile.id, depth);
      console.log('followers', followers);
      setData(followers);
      // setData([]);
      setLoading(false);
    })();
  }, [handle, depth]);

  return { data, loading };
}

