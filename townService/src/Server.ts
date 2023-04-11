import Express from 'express';
import * as http from 'http';
import CORS from 'cors';
import { AddressInfo } from 'net';
import swaggerUi from 'swagger-ui-express';
import { ValidateError } from 'tsoa';
import fs from 'fs/promises';
import { MongoClient, ServerApiVersion } from 'mongodb';
import { Server as SocketServer } from 'socket.io';
import mongoose from 'mongoose';
import { env } from 'process';
import { RegisterRoutes } from '../generated/routes';
import TownsStore from './lib/TownsStore';
import { ClientToServerEvents, ServerToClientEvents } from './types/CoveyTownSocket';
import { TownsController } from './town/TownsController';
import { logError } from './Utils';


// Create the server instances
const app = Express();
app.use(CORS());
const server = http.createServer(app);
const socketServer = new SocketServer<ClientToServerEvents, ServerToClientEvents>(server, {
  cors: { origin: '*' },
});

// Initialize the towns store with a factory that creates a broadcast emitter for a town
TownsStore.initializeTownsStore((townID: string) => socketServer.to(townID));

// Connect the socket server to the TownsController. We use here the same pattern as tsoa
// (the library that we use for REST), which creates a new controller instance for each request
socketServer.on('connection', socket => {
  new TownsController().joinTown(socket);
});

// Set the default content-type to JSON
app.use(Express.json());

// Add a /docs endpoint that will display swagger auto-generated documentation
app.use('/docs', swaggerUi.serve, async (_req: Express.Request, res: Express.Response) => {
  const swaggerSpec = await fs.readFile('../shared/generated/swagger.json', 'utf-8');
  return res.send(swaggerUi.generateHTML(JSON.parse(swaggerSpec)));
});

// Register the TownsController routes with the express server
RegisterRoutes(app);

// Add a middleware for Express to handle errors
app.use(
  (
    err: unknown,
    _req: Express.Request,
    res: Express.Response,
    next: Express.NextFunction,
  ): Express.Response | void => {
    if (err instanceof ValidateError) {
      return res.status(422).json({
        message: 'Validation Failed',
        details: err?.fields,
      });
    }
    if (err instanceof Error) {
      logError(err);
      return res.status(500).json({
        message: 'Internal Server Error',
      });
    }

    return next();
  },
);

// Start the configured server, defaulting to port 8081 if $PORT is not set
server.listen(process.env.PORT || 8081, () => {
  const address = server.address() as AddressInfo;
  // eslint-disable-next-line no-console
  console.log(`Listening on ${address.port}`);
  if (process.env.DEMO_TOWN_ID) {
    TownsStore.getInstance().createTown(process.env.DEMO_TOWN_ID, false);
  }
});

// Establish a connection to the database
const MONOGO_URI =
  'mongodb+srv://mikeymundia:HiWcqPuJthaxp8Ct@convey-town.hjgrpb3.mongodb.net/?retryWrites=true&w=majority';

mongoose.connect(MONOGO_URI || 'mongodb://localhost/27017');

mongoose.connection.on('connected', () => {
  console.log('Connected to MongoDB');
});

mongoose.connection.on('error', err => {
  console.error(err);
});


// Song Schema
const songSchema = new mongoose.Schema({
  songID: String,
  songName: String,
  likeCount: Number,
  dislikeCount: Number,
  comments: [{ username: String, commentText: String }],
});

// Song Model
const Song = mongoose.model('Song', songSchema);

// Create a  dummy song
const song = new Song({
  songID: '123',
  songName: 'Hello',
  likeCount: 0,
  dislikeCount: 0,
  comments: [
    {
      username: 'mikey',
      commentText: 'Hello World',
    },
    {
      username: 'ronit',
      commentText: 'Hello Server',
    },
  ],
});

// app GET endpoint
app.get('/songs', async (req, res) => {
  const songs = await Song.find();
  res.send(songs);
});

// app POST endpoint
app.post('/songs', async (req, res) => {
  const song2 = new Song({
    songID: req.body.songID,
    songName: req.body.songName,
    likeCount: req.body.likeCount,
    dislikeCount: req.body.dislikeCount,
    comments: req.body.comments,
  });
  await song2.save();
  res.send(song2);
});

// Save the song to the database
// song
//   .save()
//   .then(() => console.log('Song saved to the database'))
//   .catch(err => console.error(err));

// const client = new MongoClient(URI);

// async function connectToDatabase() {
//   try {
//     await client.connect();
//     console.log('Connected to MongoDB');
//   } catch (error) {
//     console.error(error);
//   }
// }

// connectToDatabase();
