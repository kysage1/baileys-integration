const {
  DisconnectReason,
  makeInMemoryStore,
  useMultiFileAuthState,
} = require("@whiskeysockets/baileys");
const pino = require("pino");
const useMongoDBAuthState = require("./mongoAuthState");
const makeWASocket = require("@whiskeysockets/baileys").default;
const mongoURL = "mongodb+srv://venom:venom@venom.exnf9us.mongodb.net/?retryWrites=true&w=majority";
const { MongoClient } = require("mongodb");

const store = makeInMemoryStore({ logger: pino().child({ level: 'silent', stream: 'store' }) })

async function connectionMaha() {
  const mongoClient = new MongoClient(mongoURL, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  });
  await mongoClient.connect();
   //const { state, saveCreds } = await useMultiFileAuthState("auth_info_baileys");
const collection = mongoClient
    .db("whatsapp_api")
    .collection("auth_info_baileys");
  const { state, saveCreds } = await useMongoDBAuthState(collection);
const sock = makeWASocket({
    logger: pino({ level: "silent" }),
    printQRInTerminal: true,
    browser: ["mujahideen", "Safari", "5.1.7"],
    auth: state,
  });

  store.bind(sock.ev);

  sock.ev.on("connection.update", async (update) => {
    const { connection, lastDisconnect, qr } = update || {};

    if (qr) {
      console.log(qr);
      // write custom maha over here
    }

    if (connection === "close") {
      const shouldReconnect =
        lastDisconnect?.error?.output?.statusCode !==
        DisconnectReason.loggedOut;

      if (shouldReconnect) {
        connectionMaha();
      }
    }
  });

  sock.ev.on("messages.update", (messageInfo) => {
    console.log(messageInfo);
  });

  sock.ev.on("messages.upsert", (messageInfoUpsert) => {
    console.log(messageInfoUpsert);
  });
  sock.ev.on("creds.update", saveCreds);
}

connectionMaha();
