const http = require("http");
const app = require("./app");

// Normalise le port fourni en un nombre, une chaîne, ou false si invalide.
const normalizePort = (val) => {
  const port = parseInt(val, 10);
  if (isNaN(port)) {
    return val;
  }
  if (port >= 0) {
    return port;
  }
  return false;
};

// Définit le port sur lequel l'application doit écouter.
const port = normalizePort(process.env.PORT || "4000");
app.set("port", port);

// Gère les erreurs de démarrage du serveur, comme les privilèges insuffisants ou le port déjà utilisé.
const errorHandler = (error) => {
  if (error.syscall !== "listen") {
    throw error;
  }
  const address = server.address();
  const bind =
    typeof address === "string" ? "pipe " + address : "port: " + port;
  switch (error.code) {
    case "EACCES":
      console.error(bind + " requires elevated privileges.");
      process.exit(1);
      break;
    case "EADDRINUSE":
      console.error(bind + " is already in use.");
      process.exit(1);
      break;
    default:
      throw error;
  }
};

// Crée le serveur HTTP en utilisant l'application Express.
const server = http.createServer(app);

// Écoute les événements d'erreur et de démarrage du serveur pour gérer les erreurs et confirmer le démarrage.
server.on("error", errorHandler);
server.on("listening", () => {
  const address = server.address();
  const bind = typeof address === "string" ? "pipe " + address : "port " + port;
  console.log("Listening on " + bind);
});

// Démarre le serveur sur le port spécifié.
server.listen(port);
