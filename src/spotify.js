module.exports = function (RED) {
    const SpotifyWebApi = require('spotify-web-api-node');

    function SpotifyNode(config) {
        RED.nodes.createNode(this, config);

        const node = this;
        node.config = RED.nodes.getNode(config.auth);
        node.api = config.api;

        const spotifyApi = new SpotifyWebApi({
            clientId: node.config.credentials.clientId,
            clientSecret: node.config.credentials.clientSecret,
            accessToken: node.config.credentials.accessToken,
            refreshToken: node.config.credentials.refreshToken
        });

        node.on('input', async function (msg) {
            try {
                if ((new Date().getTime() / 1000) > node.config.credentials.expireTime) {
                    await refreshToken();
                }

                let params = (msg.params) ? msg.params : [];
                spotifyApi[node.api](...params).then(data => {
                    msg.payload = data.body;
                    node.send(msg);
                }).catch(err => {
                    msg.error = err;
                    node.send(msg);
                });
            } catch (err) {
                msg.err = err;
                node.send(msg);
            }
        });

        function refreshToken() {
            return new Promise((resolve, reject) => {
                spotifyApi.refreshAccessToken()
                .then(data => {
                    node.config.credentials.expireTime = data.body.expires_in + Math.floor(new Date().getTime() / 1000);
                    node.config.credentials.accessToken = data.body.access_token;
                    
                    RED.nodes.addCredentials(config.auth, node.config.credentials);

                    spotifyApi.setAccessToken(data.body.access_token);

                    resolve();
                })
                .catch(error => {
                    reject(error);
                });
            });
        }
    }
    RED.nodes.registerType("spotify", SpotifyNode);

    RED.httpAdmin.get('/spotify/apis', function (req, res) {
        const nonPublicApi = [
            '_getCredential',
            '_resetCredential',
            '_setCredential',
            'authorizationCodeGrant',
            'clientCredentialsGrant',
            'createAuthorizeURL',
            'getAccessToken',
            'getClientId',
            'getClientSecret',
            'getCredentials',
            'getRedirectURI',
            'getRefreshToken',
            'refreshAccessToken',
            'resetAccessToken',
            'resetClientId',
            'resetClientSecret',
            'resetCredentials',
            'resetRedirectURI',
            'resetRefreshToken',
            'setAccessToken',
            'setClientId',
            'setClientSecret',
            'setCredentials',
            'setRedirectURI',
            'setRefreshToken'
        ];

        let response = [];
        for (let key in Object.getPrototypeOf(new SpotifyWebApi())) {
            response.push(key);
        }
        response.sort();

        response = response.filter(function (item) {
            return nonPublicApi.indexOf(item) == -1;
        });

        res.json(response);
    });
};