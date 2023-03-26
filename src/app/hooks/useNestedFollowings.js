// hooks/useNestedFollowers.js
import { useState, useEffect } from 'react';
import LensClient, { polygon } from '@lens-protocol/client';

const lensClient = new LensClient({ environment: polygon });

async function fetchNestedFollowings(profile, depth) {
  if (depth === 0) return [];

  console.log(profile);

  const results = await lensClient.profile.allFollowing({address: profile.ownedBy});
  const nestedFollowingsPromises = results.items.map((follower) =>
  fetchNestedFollowings(follower.profile, depth - 1)
  );
  const nestedFollowers = await Promise.all(nestedFollowingsPromises);

  return results.items.map((follower, index) => ({
    ...follower.profile,
    children: nestedFollowers[index],
  }));
}

export default function useNestedFollowings(handle, depth = 3) {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      setLoading(true);
      const profile = await lensClient.profile.fetch({ handle: handle });
      console.log('profile', profile);
      const followings = await fetchNestedFollowings(profile, depth);
      console.log('followings', followings);
      // debugger;
      setData([{...profile, children: followings}]);
      setLoading(false);
    })();
  }, [handle, depth]);

  return { data, loading };
}

