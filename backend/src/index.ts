import dotenv from 'dotenv';
dotenv.config();

import { app } from './app';

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`May chu Food Social API dang chay tai http://localhost:${PORT}`);
});

