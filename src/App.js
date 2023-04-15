import logo from './logo.svg';
import { LensClient, production, ProfileSortCriteria, MOST_FOLLOWERS } from "@lens-protocol/client";
import { useEffect, useState } from 'react';
import SocialGraph from './SocialGraph';

const lensClient = new LensClient({
  environment: production
});

function App() {
  const [targetProfile,setTragetProfile] = useState(null);
  const [targetHandle,setTargetHandle] = useState('');
  const [connectionProfiles,setConnectionProfiles] = useState([]);  
  const [followerProfiles,setFollowerProfiles] = useState([]);
  const [renderGraph,setRenderGraph] = useState(false)

  const handleSubmit = (e) => {
    e.preventDefault()
    fetchProfileByHandle(targetHandle)
  }

  const fetchProfileByHandle = async (handle) => {
    const response = await lensClient.profile.fetch({
      handle: handle
    })
    setTragetProfile(response);
  }

  const transformProfileResponse = (data) => {
    return {
      "id": data.id,
      "name": data.name,
      "handle": data.handle,
      "address": data.ownedBy,
      "picture": data.picture,
      "followers": [],
      "totalFollowers": data.stats.totalFollowers
    }
  }
  
  useEffect(() => {
    async function getFollowers(id){
      const result = await lensClient.profile.allFollowers({
        profileId: id,
        limit:50
      });
      let followers = []
      let fids = []
      result.items.map((follower,i) => {
        followers.push({...follower.wallet.defaultProfile, connection_type: 'follower'})
        fids.push(follower.wallet.defaultProfile.id)
      })
      setFollowerProfiles(followers)
      
      getFollowing(targetProfile.ownedBy,fids)
    }

    async function getFollowing(address,fids){
      const result = await lensClient.profile.allFollowing({
        address: address,
        limit:50
      });
      let connections = []
      let mutualIds = []
      result.items.map((prof,i) => {
        if(fids.indexOf(prof.profile.id) == -1){
          connections.push({...prof.profile, connection_type: 'following'})
        }else{
          mutualIds.push(prof.profile.id)
          connections.push({...prof.profile, connection_type: 'mutual_follow'})
        }
        
      })

      let followersWithoutMutuals = []
      followerProfiles.map((p) => {
        if(mutualIds.indexOf(p.id) == -1)
          followersWithoutMutuals.push(p)
      })

      
      setConnectionProfiles([...followersWithoutMutuals, ...connections])
      setRenderGraph(true)
    }

    if(targetProfile!==null)
    getFollowers(targetProfile.id)
  } , [targetProfile])

  return (
    <div className="App">
      <header className="App-header">
        {/* <img src={logo} className="App-logo" alt="logo" /> */}
        <p>
          Enter a Lens handle (include <code style={{backgroundColor: '#0c0c0c'}}>.lens</code> suffix) to render its network graph
        </p>
        <form onSubmit={handleSubmit}>
          <input type="text" onChange={(e) => setTargetHandle(e.target.value)}></input>
          <button type='submit'>Show Network</button>
        </form>
      </header>
      <main>
      {renderGraph === true && (
          <SocialGraph lensProfile={targetProfile} connections={connectionProfiles}></SocialGraph>
        )}
      </main>
    </div>
  );
}

export default App;
