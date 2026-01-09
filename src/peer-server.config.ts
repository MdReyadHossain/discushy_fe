export const peerServerTest = {
    host: 'peer-server-rn7x.onrender.com',
    port: 443,
    secure: true,
    path: '/peerjs'
}

export const peerServerGlobal = {
    host: '0.peerjs.com',
    port: 443,
    secure: true,
    path: '/'
}

export const peerServerBT1 = {
    host: 'peer.arkan360.ai',
    port: 443,
    secure: true,
    path: '/peerjs',
};

export const peerIceServerCloudFlare = {
    config: {
        iceServers: [
            {
                urls: [
                    "stun:stun.cloudflare.com:3478",
                    "stun:stun.cloudflare.com:53"
                ]
            },
            {
                urls: [
                    "turn:turn.cloudflare.com:3478?transport=udp",
                    "turn:turn.cloudflare.com:3478?transport=tcp",
                    "turns:turn.cloudflare.com:5349?transport=tcp",
                    "turn:turn.cloudflare.com:53?transport=udp",
                    "turn:turn.cloudflare.com:80?transport=tcp",
                    "turns:turn.cloudflare.com:443?transport=tcp"
                ],
                username: "g073965b8a81b91b99efc53dae7d5617a16e34931b8ecf107b6cb3fc4141ca0a",
                credential: "ba3944495053f1856e566d33123d2a34aeb7b366f5f2173391c88373b877cd23"
            }
        ]
    }
}

export const peerIceServerGlobal = {
    config: {
        iceServers: [
            { urls: 'stun:stun.l.google.com:19302' },
            { urls: 'stun:stun1.l.google.com:19302' },
            {
                urls: 'turn:openrelay.metered.ca:80',
                username: 'openrelayproject',
                credential: 'openrelayproject'
            }
        ]
    }
}

export const peerIceServerCloudFlare2 = {
    config: {
        iceServers: [
            { urls: 'stun:stun.cloudflare.com:3478' },
            { urls: 'stun:stun.cloudflare.com:53' },
            {
                urls: 'turn:turn.cloudflare.com:3478',
                username: 'g073965b8a81b91b99efc53dae7d5617a16e34931b8ecf107b6cb3fc4141ca0a',
                credential: 'ba3944495053f1856e566d33123d2a34aeb7b366f5f2173391c88373b877cd23'
            }
        ]
    }
}

export const peerConfiguration = { ...peerServerBT1, ...peerIceServerCloudFlare };