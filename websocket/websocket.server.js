import { WebSocketServer } from 'ws'

export default function initializeWebSocket({ server }) {
    const wss = new WebSocketServer({ server })

    wss.on('connection', (socket) => {
        console.log("WebSocket is connected successfully")

        socket.send("Welcome to Quran Scholar");
    })

    wss.on('close', () => {
        console.log("WebSocket client disconnected")
    })

    wss.on('error', (err) => {
        console.error("WebSocket error: ", err)
    })
    return wss
}