const clientID = 'a44d59070a224417aac3d046ad9a1f40';
const redirectURI = 'http://localhost:3000/'

let accessToken = '';
let expiresIn = '';

const Spotify = {
    getAccessToken() {
        let url = window.location.href;
        if(accessToken) {
            return accessToken;
        } else if (url.match(/access_token=([^&]*)/)){
            accessToken = url.match(/access_token=([^&]*)/)[1]
            expiresIn = url.match(/expires_in=([^&]*)/)[1]
            window.setTimeout(() => accessToken = '', expiresIn * 1000);
            window.history.pushState('Access Token', null, '/');
            return accessToken
        }
        else {
            let URL = `https://accounts.spotify.com/authorize?client_id=${clientID}&response_type=token&scope=playlist-modify-public&redirect_uri=${redirectURI}`
            window.location =  URL;
        }
    },

    buildAuthorizationHeader() {
      const authorizationHeader = {
        Authorization: `Bearer ${this.getAccessToken()}`
      }
      return authorizationHeader;
    },

    search(term) {
        let URL = `https://api.spotify.com/v1/search?type=track&q=${term.replace(' ', '%20')}`;
        // let headers = { headers: {Authorization: `Bearer ${token}`}}

        return fetch(URL, {
                headers: this.buildAuthorizationHeader()
              }).then(response => {
                if (response.ok) {
                  return response.json();
                }
                throw new Error(`Spotify says '${response.statusText}'`);
              }).then(jsonResponse => {
                    if(jsonResponse.tracks) {
                        return jsonResponse.tracks.items.map(track => {
                            return {
                                id: track.id,
                                name: track.name,
                                artist: track.artists[0].name,
                                album: track.album.name,
                                URI: track.uri
                            }
                        });
                    }
                    throw new Error('Search results: bad format')
                }
          )
    },

    savePlaylist(playlistName, URIs) {
        if(!playlistName || !URIs || URIs.length === 0){
            return;
        }

        //Get user ID
        const URLGetUser = 'https://api.spotify.com/v1/me'
        const headerGET = { headers: this.buildAuthorizationHeader() };
        let userID = '';
        let playlistID = '';

        fetch(URLGetUser, headerGET)
            .then(response => {
              if (response.ok) {
                return response.json();
              }
              throw new Error(`Spotify says '${response.statusText}'`);
            }).then(jsonResponse => {
                if(jsonResponse) {
                    userID = jsonResponse.id
                }
            })
            //POST Playlist name and get playlist ID
              .then(() => {
              const URLNewPlaylist = `https://api.spotify.com/v1/users/${userID}/playlists`;
              const headerPOSTPlaylist = {
                      method: 'POST',
                      headers: this.buildAuthorizationHeader(),
                      body: JSON.stringify({name: playlistName})
                  };
              fetch(URLNewPlaylist, headerPOSTPlaylist)
                  .then(response => {
                    if (response.ok) {
                      return response.json();
                    }
                    throw new Error(`Spotify says '${response.statusText}'`);
                  }).then(jsonResponse => {
                      if(jsonResponse) {
                          console.log(jsonResponse);
                          playlistID = jsonResponse.id
                      }


                    })
                  })
                  //POST Tracks
                    .then(() => {
                    console.log('PlaylistID: ' + playlistID);
                    console.log('URIs: ' + URIs);
                    const URLAddTracks = `https://api.spotify.com/v1/users/${userID}/playlists/${playlistID}/tracks`
                    const headerPOSTTracks = {
                      method: 'POST',
                      headers: this.buildAuthorizationHeader(),
                      // headers: {Authorization: `Bearer ${this.getAccessToken()}`, 'Content-Type': 'application/json'},
                      body: JSON.stringify({ uris: URIs})
                    };
                    fetch(URLAddTracks, headerPOSTTracks)
                      .then(response => {
                        if (response.ok) {
                          return response.json();
                        }
                        throw new Error(`Spotify says '${response.statusText}'`);
                      }).then(jsonResponse => {
                          if(jsonResponse) {
                            playlistID = jsonResponse.id
                          }
                          console.log('Tracks added')
                      })
                  })


                  
            }
};

export default Spotify;
