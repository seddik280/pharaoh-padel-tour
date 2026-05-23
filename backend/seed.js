// seed.js — run once to populate demo data
require('dotenv').config();
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const User = require('./models/User');
const Tournament = require('./models/Tournament');
const Match = require('./models/Match');
const Registration = require('./models/Registration');
const PointsHistory = require('./models/PointsHistory');

const seed = async () => {
  await mongoose.connect(process.env.MONGO_URI);
  console.log('Connected to MongoDB');

  await Promise.all([
    User.deleteMany({}),
    Tournament.deleteMany({}),
    Match.deleteMany({}),
    Registration.deleteMany({}),
    PointsHistory.deleteMany({}),
  ]);
  console.log('Cleared existing data');

  const hash = pw => bcrypt.hashSync(pw, 10);

  // ── Name pools ──────────────────────────────────────────────────
  const firstNames = [
    'Ahmed','Mohamed','Omar','Ali','Hassan','Khaled','Youssef','Tarek',
    'Hossam','Karim','Wael','Ramy','Sherif','Adel','Bassem','Fady',
    'Mostafa','Nabil','Rami','Sameh','Tamer','Walid','Amr','Essam',
    'Sara','Nour','Rania','Dina','Aya','Mai','Salma','Mariam'
  ];
  const lastNames = [
    'Hassan','Ahmed','Ibrahim','Khalil','Mansour','Abdallah','Kamal','Fouad',
    'Samir','Rashid','Salah','Farouk','Hamdy','Gouda','Aziz','Ramzy',
    'Saber','Lotfy','Hegazy','Gaber','Desoky','Bayoumi','Attia','Zaki',
    'Wahba','Tawfik','Shawky','Ragab','Nasser','Badawi','Morsi','Zaher'
  ];

  let nameIdx = 0;
  const nextName = () => {
    const name = `${firstNames[nameIdx % firstNames.length]} ${lastNames[Math.floor(nameIdx / firstNames.length) % lastNames.length]}`;
    nameIdx++;
    return name;
  };

  // ── Build user list ──────────────────────────────────────────────
  const userDocs = [
    { name: 'Admin User',           email: 'admin@padel.com',   password: hash('admin'), role: 'admin',  points: 0 },
    // Team members — fixed
    { name: 'Abdelrahman Seddik',   email: 'seddik@padel.com',  password: hash('123'),   role: 'player', points: 2800 },
    { name: 'Mohamed Badea',        email: 'badea@padel.com',   password: hash('123'),   role: 'player', points: 1450 },
    { name: 'Mahmoud Yakout',       email: 'yakout@padel.com',  password: hash('123'),   role: 'player', points: 1100 },
    { name: 'Mohamed Nader',        email: 'nader@padel.com',   password: hash('123'),   role: 'player', points: 380  },
  ];

  // 32 C players (points 1200–2799), skip first 2 (seddik+badea already added)
  const cPoints = [2600,2400,2200,2100,2000,1950,1900,1850,1800,1750,1700,1680,1650,1620,1600,1580,1560,1540,1520,1500,1480,1460,1440,1420,1400,1380,1360,1340,1320,1300];
  for (let i = 0; i < 30; i++) {
    userDocs.push({ name: nextName(), email: `c${i+1}@padel.com`, password: hash('123'), role: 'player', points: cPoints[i] });
  }

  // 32 D players (points 500–1199), skip yakout already added
  const dPoints = [1180,1150,1100,1050,1000,980,960,940,920,900,880,860,840,820,800,780,760,740,720,700,680,660,640,620,600,580,560,540,520,500,510];
  for (let i = 0; i < 31; i++) {
    userDocs.push({ name: nextName(), email: `d${i+1}@padel.com`, password: hash('123'), role: 'player', points: dPoints[i] });
  }

  // 32 Beginner players (points 0–499), skip nader already added
  const bPoints = [490,470,450,430,410,390,370,350,330,310,290,270,250,230,210,190,170,150,130,110,90,80,70,60,50,450,420,380,340,300,260];
  for (let i = 0; i < 31; i++) {
    userDocs.push({ name: nextName(), email: `b${i+1}@padel.com`, password: hash('123'), role: 'player', points: bPoints[i] });
  }

  const users = await User.insertMany(userDocs);
  console.log(`Created ${users.length} users`);

  const admin    = users[0];
  const seddik   = users[1];
  const badea    = users[2];
  const yakout   = users[3];
  const nader    = users[4];
  const cPlayers = users.slice(5, 37);    // 32 C players
  const dPlayers = users.slice(37, 69);   // 32 D players (yakout + 31 more)
  const bPlayers = users.slice(69, 101);  // 32 Beginner players (nader + 31 more)

  // ── Tournaments ─────────────────────────────────────────────────
  const tournaments = await Tournament.insertMany([
    { name: 'Spring Open',       category: 'Beginner', date: '2026-03-15', status: 'completed' },
    { name: 'City Championship', category: 'D',        date: '2026-04-01', status: 'active'    },
    { name: 'Elite Masters',     category: 'C',        date: '2026-05-10', status: 'upcoming'  },
    { name: 'Summer Slam',       category: 'Beginner', date: '2026-06-20', status: 'upcoming'  },
  ]);
  const [spring, city, elite, summer] = tournaments;
  console.log(`Created ${tournaments.length} tournaments`);

  // ── Helper: register a team ──────────────────────────────────────
  const regTeam = async (p1, p2, tournament) => {
    const avg = Math.round((p1.points + p2.points) / 2);
    await Registration.create({ player: p1._id, partner: p2._id, tournament: tournament._id, avgPoints: avg });
  };

  // Spring Open — 16 Beginner teams
  for (let i = 0; i < bPlayers.length - 1; i += 2) {
    await regTeam(bPlayers[i], bPlayers[i + 1], spring);
  }

  // City Championship — 16 D teams
  const dAll = [yakout, ...dPlayers];
  for (let i = 0; i < Math.min(dAll.length - 1, 31); i += 2) {
    await regTeam(dAll[i], dAll[i + 1], city);
  }

  // Elite Masters — 16 C teams
  const cAll = [seddik, badea, ...cPlayers];
  for (let i = 0; i < Math.min(cAll.length - 1, 31); i += 2) {
    await regTeam(cAll[i], cAll[i + 1], elite);
  }
  console.log('Created registrations');

  // ── Matches for Spring Open ──────────────────────────────────────
  await Match.create({ tournament: spring._id, player1: bPlayers[0]._id, player2: bPlayers[2]._id, winner: bPlayers[0]._id, round: 'quarter' });
  await Match.create({ tournament: spring._id, player1: bPlayers[4]._id, player2: bPlayers[6]._id, winner: bPlayers[4]._id, round: 'quarter' });
  await Match.create({ tournament: spring._id, player1: bPlayers[0]._id, player2: bPlayers[4]._id, winner: bPlayers[0]._id, round: 'semi' });
  await Match.create({ tournament: spring._id, player1: bPlayers[8]._id, player2: bPlayers[10]._id, winner: bPlayers[8]._id, round: 'semi' });
  await Match.create({ tournament: spring._id, player1: bPlayers[0]._id, player2: bPlayers[8]._id,  winner: bPlayers[0]._id, round: 'final' });

  // Matches for City Championship (in progress)
  await Match.create({ tournament: city._id, player1: yakout._id, player2: dPlayers[1]._id, winner: yakout._id, round: 'quarter' });
  await Match.create({ tournament: city._id, player1: dPlayers[2]._id, player2: dPlayers[4]._id, winner: dPlayers[2]._id, round: 'quarter' });
  console.log('Created matches');

  // ── Points history for Spring Open ──────────────────────────────
  await PointsHistory.insertMany([
    { player: bPlayers[0]._id, points: 60,  reason: 'Quarter-final — Spring Open', tournament: spring._id, date: '2026-03-15' },
    { player: bPlayers[0]._id, points: 120, reason: 'Semi-final — Spring Open',    tournament: spring._id, date: '2026-03-15' },
    { player: bPlayers[0]._id, points: 300, reason: 'Winner — Spring Open',        tournament: spring._id, date: '2026-03-15' },
    { player: bPlayers[4]._id, points: 60,  reason: 'Quarter-final — Spring Open', tournament: spring._id, date: '2026-03-15' },
    { player: bPlayers[4]._id, points: 120, reason: 'Semi-final — Spring Open',    tournament: spring._id, date: '2026-03-15' },
    { player: bPlayers[8]._id, points: 60,  reason: 'Semi-final — Spring Open',    tournament: spring._id, date: '2026-03-15' },
    { player: bPlayers[8]._id, points: 200, reason: 'Finalist — Spring Open',      tournament: spring._id, date: '2026-03-15' },
  ]);
  console.log('Created points history');

  console.log('\n✅ Seed complete!');
  console.log(`   ${users.length - 1} players (32 C / 32 D / 32 Beginner) + 1 admin`);
  console.log('   Admin:    admin@padel.com  / admin');
  console.log('   Rank 1:   seddik@padel.com / 123');
  console.log('   Player C: badea@padel.com  / 123');
  console.log('   Player D: yakout@padel.com / 123');
  console.log('   Beginner: nader@padel.com  / 123');

  await mongoose.disconnect();
};

seed().catch(err => { console.error(err); process.exit(1); });
