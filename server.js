require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const path = require('path');
const cors = require('cors');
const bcrypt = require('bcryptjs');

const User = require('./models/User');
const Registration = require('./models/Registration');
const Player = require('./models/Player');
const LeaderboardEntry = require('./models/LeaderboardEntry');

const authRoutes = require('./routes/auth');
const registrationRoutes = require('./routes/registrations');
const adminRoutes = require('./routes/admin');
const playerRoutes = require('./routes/players');
const leaderboardRoutes = require('./routes/leaderboard');
const contactRoutes = require('./routes/contact');

const app = express();
const PORT = process.env.PORT || 3000;
const MONGODB_URI = process.env.MONGO_URI;
const ADMIN_USERNAME = 'admin';
const ADMIN_PASSWORD = 'Admin@123';

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(__dirname));

app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'home.html'));
});

app.use('/api/auth', authRoutes);
app.use('/api/registrations', registrationRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/players', playerRoutes);
app.use('/api/leaderboard', leaderboardRoutes);
app.use('/api/contact', contactRoutes);
app.use(
    "/api/payment",
    require("./routes/paymentRoutes")
);
app.post('/api/chat', async (req, res) => {
    const { messages } = req.body;
    try {
        const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${process.env.GROQ_API_KEY}`
            },
            body: JSON.stringify({
                model: 'llama-3.3-70b-versatile',
                messages: messages,
                max_tokens: 500,
                temperature: 0.7
            })
        });
        const data = await response.json();
        res.json(data);
    } catch (err) {
        res.status(500).json({ error: 'Chat failed' });
    }
});

// Backward-compatible endpoint used by the current player page
app.get('/players', async (req, res) => {
  try {
    const players = await Player.find().sort({ rank: 1 });
    res.json(players);
  } catch (error) {
    res.status(500).json({ message: 'Failed to load players.' });
  }
});

async function seedPlayers() {
  const count = await Player.countDocuments();
  if (count > 0) return;

  const seeds = [
  {
    "name": "Mario",
    "type": "All-Rounder",
    "rank": 1,
    "image": "mario.png",
    "speed": 88,
    "handling": 80,
    "drift": 84,
    "badge": "badge-gold",
    "badgeLabel": "Champion",
    "desc": "Balanced all-round racer with strong acceleration and drifting."
  },
  {
    "name": "Luigi",
    "type": "All-Rounder",
    "rank": 2,
    "image": "luigi.png",
    "speed": 84,
    "handling": 86,
    "drift": 81,
    "badge": "badge-silver",
    "badgeLabel": "Runner-Up",
    "desc": "Fast and reliable with excellent corner control."
  },
  {
    "name": "Peach",
    "type": "Lightweight",
    "rank": 3,
    "image": "peach.png",
    "speed": 80,
    "handling": 92,
    "drift": 88,
    "badge": "badge-bronze",
    "badgeLabel": "Top 3",
    "desc": "Quick handling makes Peach a strong technical racer."
  },
  {
    "name": "Rosalina",
    "type": "All-Rounder",
    "rank": 4,
    "image": "rosalina.png",
    "speed": 82,
    "handling": 85,
    "drift": 83,
    "badge": "badge-blue",
    "badgeLabel": "Elite",
    "desc": "Graceful racer with a smooth balance of power and control."
  },
  {
    "name": "Waluigi",
    "type": "Heavyweight",
    "rank": 5,
    "image": "waluigi.png",
    "speed": 90,
    "handling": 72,
    "drift": 77,
    "badge": "badge-purple",
    "badgeLabel": "Top 5",
    "desc": "High speed and aggressive racing style for advanced players."
  },
  {
    "name": "Daisy",
    "type": "Lightweight",
    "rank": 6,
    "image": "daisy.png",
    "speed": 79,
    "handling": 90,
    "drift": 85,
    "badge": "badge-yellow",
    "badgeLabel": "Fast Start",
    "desc": "Strong cornering and quick starts make Daisy dangerous on short tracks."
  },
  {
    "name": "Yoshi",
    "type": "Lightweight",
    "rank": 7,
    "image": "yoshi.png",
    "speed": 81,
    "handling": 88,
    "drift": 82,
    "badge": "badge-green",
    "badgeLabel": "Speedster",
    "desc": "Consistent and easy to control for every track layout."
  },
  {
    "name": "Toad",
    "type": "Lightweight",
    "rank": 8,
    "image": "toad.png",
    "speed": 78,
    "handling": 91,
    "drift": 79,
    "badge": "badge-white",
    "badgeLabel": "Agile",
    "desc": "Tiny but agile, perfect for sharp turns and item dodging."
  },
  {
    "name": "Koopa",
    "type": "All-Rounder",
    "rank": 9,
    "image": "koopa.png",
    "speed": 77,
    "handling": 84,
    "drift": 78,
    "badge": "badge-shell",
    "badgeLabel": "Balanced",
    "desc": "Steady racer with dependable movement and defense."
  },
  {
    "name": "Birdo",
    "type": "All-Rounder",
    "rank": 10,
    "image": "birdo.png",
    "speed": 80,
    "handling": 83,
    "drift": 80,
    "badge": "badge-pink",
    "badgeLabel": "Solid",
    "desc": "Reliable all-round stats with smooth track performance."
  },
  {
    "name": "Diddy Kong",
    "type": "Lightweight",
    "rank": 11,
    "image": "diddykong.png",
    "speed": 83,
    "handling": 79,
    "drift": 81,
    "badge": "badge-brown",
    "badgeLabel": "Jumper",
    "desc": "Great for players who like fast reaction and small frames."
  },
  {
    "name": "Bowser Jr.",
    "type": "Heavyweight",
    "rank": 12,
    "image": "bowserjr.png",
    "speed": 86,
    "handling": 70,
    "drift": 74,
    "badge": "badge-red",
    "badgeLabel": "Power",
    "desc": "A strong racer built for straight-line speed and pressure."
  },
  {
    "name": "Dry Bones",
    "type": "Lightweight",
    "rank": 13,
    "image": "drybones.png",
    "speed": 76,
    "handling": 87,
    "drift": 78,
    "badge": "badge-gray",
    "badgeLabel": "Sneaky",
    "desc": "Light and tricky with dependable handling."
  },
  {
    "name": "Donkey Kong",
    "type": "Heavyweight",
    "rank": 14,
    "image": "donkeykong.png",
    "speed": 89,
    "handling": 68,
    "drift": 73,
    "badge": "badge-brown-dark",
    "badgeLabel": "Heavy Hit",
    "desc": "Powerful racer with strong momentum on wide tracks."
  },
  {
    "name": "Bowser",
    "type": "Heavyweight",
    "rank": 15,
    "image": "bowser.png",
    "speed": 92,
    "handling": 65,
    "drift": 71,
    "badge": "badge-fire",
    "badgeLabel": "Boss",
    "desc": "High top speed and a very aggressive racing profile."
  },
  {
    "name": "Wario",
    "type": "Heavyweight",
    "rank": 16,
    "image": "wario.png",
    "speed": 88,
    "handling": 66,
    "drift": 72,
    "badge": "badge-gold-dark",
    "badgeLabel": "Tough",
    "desc": "A hard-hitting racer with heavy acceleration."
  },
  {
    "name": "Metal Mario",
    "type": "All-Rounder",
    "rank": 17,
    "image": "metalmario.png",
    "speed": 85,
    "handling": 78,
    "drift": 79,
    "badge": "badge-metal",
    "badgeLabel": "Steel",
    "desc": "Solid and metallic with dependable track performance."
  },
  {
    "name": "Baby Mario",
    "type": "Lightweight",
    "rank": 18,
    "image": "babymario.png",
    "speed": 74,
    "handling": 89,
    "drift": 76,
    "badge": "badge-baby",
    "badgeLabel": "Mini",
    "desc": "Tiny racer with crisp handling and quick responsiveness."
  },
  {
    "name": "Baby Luigi",
    "type": "Lightweight",
    "rank": 19,
    "image": "babyluigi.png",
    "speed": 73,
    "handling": 90,
    "drift": 75,
    "badge": "badge-baby-green",
    "badgeLabel": "Mini",
    "desc": "Very light and nimble with excellent turning control."
  },
  {
    "name": "Pink Gold Peach",
    "type": "Lightweight",
    "rank": 20,
    "image": "pinkgoldpeach.png",
    "speed": 82,
    "handling": 86,
    "drift": 80,
    "badge": "badge-pink-gold",
    "badgeLabel": "Rare",
    "desc": "A stylish racer with graceful speed and handling."
  }
];
  await Player.insertMany(seeds);
}

async function seedAdminUser() {
  const adminEmail = 'admin@mariokart.local';
  const existing = await User.findOne({ email: adminEmail });
  if (existing) return;

  const passwordHash = await bcrypt.hash(ADMIN_PASSWORD, 10);
  await User.create({
    firstName: 'Admin',
    lastName: 'User',
    age: 99,
    email: adminEmail,
    passwordHash,
    role: 'admin'
  });
}

async function connectDatabase() {
  await mongoose.connect(process.env.MONGO_URI);
  console.log('MongoDB connected');
  await seedPlayers();
  await seedAdminUser();
}

connectDatabase().then(() => {
  app.listen(PORT, '0.0.0.0', () => {
  console.log(`Server running on ${PORT}`);
});
}).catch(error => {
  console.error('Database connection failed:', error.message);
  process.exit(1);
});
