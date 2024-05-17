
const { createServer } = require("http");
const express = require("express");
const app = express();

app.get('/ruta-http', (req, res) => {
    res.status(200).json({
        message: 'Hola mundo'
    });
});


const { WebSocketServer, WebSocket } = require("ws");

const server = createServer(app);
const wss = new WebSocketServer({ server });

const notificaciones = [
    { id: 1, cuerpo: "Hola mundo" },
    { id: 2, cuerpo: "Adios mundo" },
];

wss.on("connection", (ws) => {
    console.log("Cliente conectado");

    ws.send(
        JSON.stringify({
            message: "notificaciones",
        })
    );

    ws.on("message", (data) => {
        console.log("Mensaje recibido: ", data);
        const dataJson = JSON.parse(data);

        switch (dataJson.action) {
            case "getNotificaciones":
                ws.send(
                    JSON.stringify({
                        event: "getNotificaciones",
                        data: notificaciones,
                    })
                );
                break;
                
            case "crearNotificacion":
                const idNotifi =
                    notificaciones.length > 0
                        ? notificaciones[notificaciones.length - 1].id + 1
                        : 1;

                const notificacion = {
                    id: idNotifi,
                    cuerpo: dataJson.data.cuerpo,
                };

                notificaciones.push(notificacion);

                ws.send("notificacionCreada");

                wss.clients.forEach((client) => {
                    if (client.readyState === WebSocket.OPEN) {
                        client.send(
                            JSON.stringify({
                                event: "notificacionCreada",
                                data: notificacion,
                            })
                        );
                    }
                });

                break;
        }
    });
});

server.listen(3000, () => {
    console.log("Servidor corriendo en el puerto 8080");
});
