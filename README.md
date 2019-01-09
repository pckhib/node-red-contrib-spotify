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
3. Select the created application and copy the `Client ID` and `Client Secret`.
4. Paste the Client ID and Client Secret in the Spotify Config node in Node-RED.
5. Enter the required scopes. A list of all available scopes can be found on the [Authorization Scopes](https://developer.spotify.com/documentation/general/guides/scopes/) page.
6. Press `Start Authentication` and allow the access for your Spotify account.

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
