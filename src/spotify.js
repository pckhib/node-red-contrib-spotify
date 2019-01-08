module.exports = function (RED) {
    const SpotifyWebApi = require('spotify-web-api-node');

    function SpotifyNode(config) {
        RED.nodes.createNode(this, config);

        const node = this;
        node.config = RED.nodes.getNode(config.auth);

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

                // TODO: Implement API functions
            } catch (err) {}
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
};