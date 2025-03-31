import Openfort from '@openfort/openfort-node';
import cors from 'cors';
import express, { Request, Response } from 'express';

process.loadEnvFile();

// Create an express application
const app = express();
app.use(express.json());

// Custom CORS options
app.use(
  cors()
);

// Ensure Openfort is only initialized once
const openfort = (() => {
  if (!process.env.OPENFORT_SECRET_KEY) {
    throw new Error("Openfort secret key is not set");
  }
  return new Openfort(process.env.OPENFORT_SECRET_KEY);
})();


async function createEncryptionSession(
  req: Request,
  res: Response
) {
  console.log(`[${req.headers['user-agent']?.split(' ')[0]}]`, 'Creating encryption session...',);

  try {
    const session = await openfort.registerRecoverySession(
      process.env.SHIELD_API_KEY!,
      process.env.SHIELD_SECRET_KEY!,
      process.env.SHIELD_ENCRYPTION_SHARE!
    );

    res.status(200).send({
      session: session,
    });

  } catch (e) {
    console.error(e);
    res.status(500).send({
      error: 'Internal server error',
    });
  }
}

app.post('/api/protected-create-encryption-session', createEncryptionSession);

// Start the server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
