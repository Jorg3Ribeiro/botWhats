const { Client, LocalAuth, WAState } = require("whatsapp-web.js");
const express = require("express");
const qrcode = require("qrcode-terminal");
const winston = require("winston");

const fetch = (...args) =>
  import("node-fetch").then(({ default: fetch }) => fetch(...args));


const LOG_LEVEL = process.env.LOG_LEVEL || "info";
const MESSAGE_HANDLER_URL =
  process.env.MESSAGE_HANDLE_URL || "http://handler-api/message";


const logger = winston.createLogger({
  level: LOG_LEVEL,
  format: winston.format.json(),
  defaultMeta: { service: "whatsapp-api" },
  transports: [
    new winston.transports.Console({
      format: winston.format.simple()
    })
  ]
});

function handleErrors(response) {
  if (!response.ok) {
    throw Error(response.statusText);
  }
  return response;
}


const client = new Client({
  authStrategy: new LocalAuth({
    dataPath: "./home/whatsapp-data"
  })
});

client.initialize();

client.on("qr", qr => {
  logger.debug("QR code gerado");
  console.log("QR code gerado");
  qrcode.generate(qr, { small: true });
});

client.on("ready", () => {
  logger.info("WhatsApp client Esta pronto.");
  console.log("WhatsApp client Esta pronto.");
});

// - Defina o retorno de chamada para receber mensagens.
client.on("message", message => {
  // Faz uma solicitação POST para a API do manipulador de mensagens.
  // A API do manipulador de mensagens é responsável por
  // tratar a mensagem e retornando uma resposta.
  logger.debug("Mensagem recebida:", message);

  const options = {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify(message)
  };

  logger.debug("Postando mensagem para " + MESSAGE_HANDLER_URL);
  fetch(MESSAGE_HANDLER_URL, options)
    .then(handleErrors)
    .then(response => response.json())
    .then(response => {
      // Verifique se há texto para enviar de volta.
      if (response.text) {
        // Envie a resposta de volta ao remetente.
        logger.debug(
          'Enviando resposta "' + response.text + '" para ' + message.from
        );
        client.sendMessage(message.from, response.text);
      } else {
        logger.debug("Nenhuma resposta para enviar.");
      }
    })
    .catch(error => {
      logger.error("Erro ao tratar a mensagem:", error);
    });
});

var app = express();
app.use(express.json());

app.listen(3000, () => {
  logger.info("Express server está escutando na porta 3000.");
});

app.get("/health", (req, res) => {
  // Verifica o estado do cliente
  client.getState().then(state => {
    console.log("GET /health:", state);
    // Se o cliente estiver logado, envie uma resposta 200.
    if (state === WAState.CONNECTED || state === WAState.PAIRING) {
      res.status(200).send("Tudo Funcionando!");
    } else {
      // Caso contrário, envie uma resposta 503.
      res.status(503).send("Serviço não disponível");
    }
  });
});

app.post("/send", async (req, res) => {
  // Envie a mensagem para o cliente WhatsApp.
  logger.debug("Solicitação POST recebida no endpoint /send com corpo:", req.body);
  logger.debug("Enviando mensagem para cliente WhatsApp:", req.body.text);

  // Buscar todos os usuarios de contato no Whatsapp
  const contacts = await client.getContacts()
  // Filtra a procura do cliente pelo nome
  const contact = contacts.find(({ name }) => name === req.body.to)
  // Serializa o ID para o envio da msg
  const { id: { _serialized: chatId } } = contact
  
  client.sendMessage(chatId, req.body.text);
  res.send({ success: "Menssagem enviada!" });
});
