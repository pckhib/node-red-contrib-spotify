module.exports = function (RED) {

    const url = require('url');
    const crypto = require('crypto');
    const SpotifyWebApi = require('spotify-web-api-node');

    function AuthNode(config) {
        RED.nodes.createNode(this, config);

        this.name = config.name;
        this.scope = config.scope;
    }
    RED.nodes.registerType("spotify-auth", AuthNode, {
        credentials: {
            name: { type: 'text' },
            clientId: { type: 'password' },
            clientSecret: { type: 'password' },
            accessToken: { type: 'password' },
            refreshToken: { type: 'password' },
            expireTime: { type: 'password' }
        }
    });

    RED.httpAdmin.get('/spotify-credentials/auth', function (req, res) {
        if (!req.query.clientId || !req.query.clientSecret ||
            !req.query.id || !req.query.callback) {
            res.send(400);
            return;
        }

        const node_id = req.query.id;
        const credentials = {
            clientId: req.query.clientId,
            clientSecret: req.query.clientSecret,
            callback: req.query.callback
        };
        const scope = req.query.scope;
        const csrfToken = crypto.randomBytes(18).toString('base64').replace(/\//g, '-').replace(/\+/g, '_');
        credentials.csrfToken = csrfToken;

        res.redirect(url.format({
            protocol: 'https',
            hostname: 'accounts.spotify.com',
            pathname: '/authorize',
            query: {
                client_id: credentials.clientId,
                response_type: 'code',
                redirect_uri: credentials.callback,
                state: node_id + ':' + csrfToken,
                show_dialog: true,
                scope: scope
            }
        }));
        RED.nodes.addCredentials(node_id, credentials);
    });

    RED.httpAdmin.get('/spotify-credentials/auth/callback', function (req, res) {
        if (req.query.error) {
            return res.send('spotify.query.error', { error: req.query.error, description: req.query.error_description });
        }

        const state = req.query.state.split(':');
        const node_id = state[0];
        const credentials = RED.nodes.getCredentials(node_id);

        if (!credentials || !credentials.clientId || !credentials.clientSecret) {
            return res.send('spotify.error.no-credentials');
        }
        if (state[1] !== credentials.csrfToken) {
            return res.send('spotify.error.token-mismatch');
        }

        const spotifyApi = new SpotifyWebApi({
            clientId: credentials.clientId,
            clientSecret: credentials.clientSecret,
            redirectUri: credentials.callback
        });

        spotifyApi.authorizationCodeGrant(req.query.code).then(data => {
            credentials.accessToken = data.body.access_token;
            credentials.refreshToken = data.body.refresh_token;
            credentials.expireTime = data.body.expires_in + Math.floor(new Date().getTime() / 1000);
            credentials.tokenType = data.body.token_type;
            credentials.name = 'Spotify OAuth2';

            delete credentials.csrfToken;
            delete credentials.callback;
            RED.nodes.addCredentials(node_id, credentials);
            res.send('spotify.authorized');
        })
        .catch(error => {
            res.send('spotify.error.tokens');
        });
    });
};