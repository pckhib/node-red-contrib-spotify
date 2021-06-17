# Node-RED node for Spotify Web API

This node for Node-RED is a wrapper for [spotify-web-api-node](https://github.com/thelinmichael/spotify-web-api-node).

## Features

The package contains two nodes. One configuration node to setup the OAuth2 authentication using a Client id and a Client secret.
The function node is to select the API function which you want to use.

## How to install

Run the following command in the root directory of your Node-RED installation
```
npm install node-red-contrib-spotify
```
or
```
yarn add node-red-contrib-spotify
```

## Configuration

### Authentication

1. Head to the [Spotify Developer Dashboard](https://developer.spotify.com/dashboard/applications).
2. Create a new application by selecting `CREATE A CLIENT ID`
3. Select the created application, click `EDIT SETTINGS` and add a new `Redirect URI`.
   ```
   <node-red-ip:port>/spotify-credentials/auth/callback
   
   // e.g. if you're running node-red on localhost
   http://localhost:1880/spotify-credentials/auth/callback
   ```
4. Click save and copy the `Client ID` and `Client Secret`.
5. Paste the Client ID and Client Secret in the Spotify Config node in Node-RED.
6. Enter the required scopes. A list of all available scopes can be found on the [Authorization Scopes](https://developer.spotify.com/documentation/general/guides/scopes/) page.
7. Press `Start Authentication` and allow the access for your Spotify account.

### Usage

Some API functions require extra parameters. To define parameters, use the `msg.params` object and define an array with all required arguments.
Check out the [API description](https://github.com/thelinmichael/spotify-web-api-node/blob/master/src/spotify-web-api.js) for more information about available functions.

Example:
```js
// API function: getArtistAlbums
msg.params = [
    '43ZHCT0cAZBISjO8DG9PnE', /* Artist ID */
    { limit: 10, offset: 20 } /* Options */
];
```

## For Home Assistance users

TensE wrote:  So I seem to have figured it out after a bunch of searching. Here’s what I’ve done:

1. Setup the Spotify Dashboard.
1. Get Client ID and Secret and put them in NodeRED (+ your scopes) and press Start Authentication.
1. Most likely the INVALID_CLIENT page will come up so copy the URL and decode it.
1. Find the URL between redirect_uri=<link_here>&state (should look something like 
`http://<your-ha-IP>:8123/api/hassio_ingress/<bunch-of-junk>/spotify-credentials/auth/callback)`
1. In Spotify Dashboard edit your application and put that link as the Redirect URI
1. Press Start Authentication in NodeRED again it should bring you to the permissions page where you click AGREE
1. It will then probably open a page with 401: Unauthorized error. Select the URL and press Enter to open it again. (Don’t F5 as that doesn’t work)
1. You should now get spotify.authorized
