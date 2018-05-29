const clientID = 'a44d59070a224417aac3d046ad9a1f40';
const apiBaseURL = 'https://api.spotify.com/v1';
const redirectURI = 'http://localhost:3000/';

// let accessToken = '';
// let expiresIn = '';

const Spotify = {
    accessToken: undefined,
    expiresIn: undefined,
    userID: undefined,


    getAccessToken() {
        let url = window.location.href;
        if(this.accessToken) {
            return this.accessToken;
        } else if (url.match(/access_token=([^&]*)/)){
            this.accessToken = url.match(/access_token=([^&]*)/)[1]
            this.expiresIn = url.match(/expires_in=([^&]*)/)[1]
            window.setTimeout(() => this.accessToken = '', this.expiresIn * 1000);
            window.history.pushState('Access Token', null, '/');
            return this.accessToken
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
        let URL = `${apiBaseURL}/search?type=track&q=${term.replace(' ', '%20')}`;
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

    getUserID() {
        if (this.userID) {
          return new Promise(function(resolve){
            resolve()
          })
        }
        const URLGetUser = 'https://api.spotify.com/v1/me'
        const headerGET = { headers: this.buildAuthorizationHeader() };
        return fetch(URLGetUser, headerGET)
        .then(response => {
          if (response.ok) {
            return response.json();
          }
          throw new Error(`Spotify says '${response.statusText}'`);
        }).then(jsonResponse => {
          if(jsonResponse.id) {
            this.userID = jsonResponse.id;
            return jsonResponse.id;
          }
          throw new Error('userID: Error Received')
        }
      );
    },

    createPlaylist(playlistName) {
      const URLNewPlaylist = `${apiBaseURL}/users/${this.userID}/playlists`;
      const headerPOSTPlaylist = {
        method: 'POST',
        headers: this.buildAuthorizationHeader(),
        body: JSON.stringify({name: playlistName})
      };
      return fetch(URLNewPlaylist, headerPOSTPlaylist)
      .then(response => {
        if (response.ok) {
          return response.json();
        }
        throw new Error(`Spotify says '${response.statusText}'`);
      }).then(jsonResponse => {
        if(jsonResponse.id) {
          console.log(jsonResponse);
          return jsonResponse.id
        }
        throw new Error('No playlist received');
      }
    );
  },

    saveTracksToPlaylist(playlistID, URIs){
      const URLAddTracks = `${apiBaseURL}/users/${this.userID}/playlists/${playlistID}/tracks`
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
          if(jsonResponse.id) {
            playlistID = jsonResponse.id
          }
          console.log('Tracks added')
        })

    },

    savePlaylist(playlistName, URIs) {
        if(!playlistName || !URIs || URIs.length === 0){
            return;
        }
        return this.getUserID()
          .then(
            () => this.createPlaylist(playlistName)
          ).then(
            playlistID => this.saveTracksToPlaylist(playlistID, URIs)
          );
        }

};

export default Spotify;
