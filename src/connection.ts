import makeWASocket, { DisconnectReason, useSingleFileAuthState } from "@adiwajshing/baileys"
import _default from "@adiwajshing/baileys/lib/Store/make-in-memory-store"
import { Boom } from "@hapi/boom";
import path from 'path'

export const connect = async () => {
    const {state, saveState} = useSingleFileAuthState(
        path.resolve(__dirname, "..", "cache", "auth_info_milti.json")
    );

    const socket = makeWASocket({
        printQRInTerminal: true,
        auth: state
    });

    socket.ev.on('connection.update', async (update) => {
        const {connection, lastDisconnect} = update;

        if(connection === 'close'){
            const shoudReconnect = (lastDisconnect?.error as Boom)?.output?.statusCode !== DisconnectReason.loggedOut;

            if(shoudReconnect)
                await connect();
        }
    })

    socket.ev.on('creds.update', saveState);

    return socket;
}