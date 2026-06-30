const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const cors = require('cors');
const dotenv = require('dotenv');
const path = require('path');
const session = require('express-session');
const passport = require('passport');
const SteamStrategy = require('passport-steam').Strategy;

// Загрузка переменных окружения
dotenv.config();

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
    cors: { origin: '*' }
});

const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Настройка сессий
app.use(session({
    secret: process.env.SESSION_SECRET || 'super-secret-key-cs2-mvp',
    resave: false,
    saveUninitialized: false,
    cookie: { maxAge: 1000 * 60 * 60 * 24 * 7 } // 7 дней
}));

// Раздача статических файлов Frontend'а
app.use(express.static(path.join(__dirname, 'public')));

// Инициализация Passport.js
app.use(passport.initialize());
app.use(passport.session());

// Настройка Steam OpenID
passport.serializeUser((user, done) => {
    done(null, user);
});

passport.deserializeUser((obj, done) => {
    done(null, obj);
});

if (process.env.STEAM_API_KEY && process.env.DOMAIN) {
    passport.use(new SteamStrategy({
        returnURL: `${process.env.DOMAIN}/api/auth/steam/return`,
        realm: process.env.DOMAIN,
        apiKey: process.env.STEAM_API_KEY
    },
    (identifier, profile, done) => {
        process.nextTick(() => {
            // Здесь мы будем сохранять пользователя в базу, если его там нет
            profile.identifier = identifier;
            return done(null, profile);
        });
    }));
} else {
    console.warn('⚠️ STEAM_API_KEY или DOMAIN не заданы в .env! Авторизация через Steam работать не будет.');
}

// =====================================================
// ROUTES (API)
// =====================================================

// Аутентификация через Steam
app.get('/api/auth/steam',
    (req, res, next) => {
        if (!process.env.STEAM_API_KEY) {
            return res.status(500).json({ error: "Steam API Key is not configured" });
        }
        next();
    },
    passport.authenticate('steam', { failureRedirect: '/' })
);

app.get('/api/auth/steam/return',
    passport.authenticate('steam', { failureRedirect: '/' }),
    (req, res) => {
        console.log("Steam Auth Success! User:", req.user ? req.user.displayName : "No User");
        // Успешная авторизация - редирект на главную
        res.redirect('/');
    }
);

// Получение профиля текущего пользователя
app.get('/api/auth/user', (req, res) => {
    console.log("Checking auth status. Is authenticated:", req.isAuthenticated());
    if (req.isAuthenticated()) {
        try {
            res.json({
                authenticated: true,
                user: {
                    steamId: req.user.id,
                    name: req.user.displayName,
                    avatar: req.user.photos && req.user.photos.length > 2 ? req.user.photos[2].value : req.user.photos[0].value
                }
            });
        } catch (e) {
            console.error("Error parsing user data:", e);
            res.status(500).json({ error: "Failed to parse user data" });
        }
    } else {
        res.json({ authenticated: false });
    }
});

// Выход из аккаунта
app.get('/api/auth/logout', (req, res) => {
    req.logout(() => {
        res.redirect('/');
    });
});

// =====================================================
// MOCK DATABASE (Временная замена MySQL)
// =====================================================
const MOCK_AVATARS = [
    "https://ui-avatars.com/api/?name=User&background=1c1c1f&color=D4AF37&bold=true",
    "https://ui-avatars.com/api/?name=Pro&background=1c1c1f&color=D4AF37&bold=true",
    "https://ui-avatars.com/api/?name=VIP&background=1c1c1f&color=D4AF37&bold=true",
    "https://ui-avatars.com/api/?name=Admin&background=1c1c1f&color=D4AF37&bold=true",
    "https://ui-avatars.com/api/?name=Player&background=1c1c1f&color=D4AF37&bold=true"
];
const MOCK_NAMES = ["✪ s1mple", "ZywOo", "m0NESY", "donk", "Maniac Hunter", "Ilya_Cheb", "Antigravity_AI"];

app.get('/api/stats', (req, res) => {
    // Симуляция SQL запроса к таблице статистики
    let leaderboard = [];
    for (let i = 0; i < 50; i++) {
        let isVip = Math.random() > 0.8;
        let isMvp = Math.random() > 0.95;
        let isAdmin = Math.random() > 0.98;
        
        let rank = '';
        if (isAdmin) rank = 'owner';
        else if (isMvp) rank = 'mvp';
        else if (isVip) rank = 'vip';

        leaderboard.push({
            id: i + 1,
            name: MOCK_NAMES[Math.floor(Math.random() * MOCK_NAMES.length)] + (i > 0 ? `_${i}` : ''),
            avatar: MOCK_AVATARS[i % MOCK_AVATARS.length],
            kills: Math.floor(Math.random() * 5000) + 100,
            deaths: Math.floor(Math.random() * 4000) + 50,
            playtime: Math.floor(Math.random() * 200) + 5,
            rank: rank,
            score: Math.floor(Math.random() * 15000) + 500
        });
    }
    leaderboard.sort((a, b) => b.kills - a.kills);
    leaderboard = leaderboard.map((p, index) => ({...p, position: index + 1}));
    
    res.json(leaderboard);
});

// =====================================================
// CHAT WEBSOCKETS (Временная память сервера)
// =====================================================
const chatMessages = [
    { id: 1, user: 'm0NESY', avatar: 'https://ui-avatars.com/api/?name=M&background=1c1c1f&color=D4AF37&bold=true', text: 'Всем привет! Слежу за чатом.', rank: 'ADMIN', time: '01:10' },
    { id: 2, user: 'donk', avatar: 'https://ui-avatars.com/api/?name=D&background=1c1c1f&color=D4AF37&bold=true', text: 'сервер реально пушка', rank: 'VIP', time: '01:10' }
];

io.on('connection', (socket) => {
    // Отправляем текущую историю чата при подключении
    socket.emit('chatHistory', chatMessages);

    // Принимаем новое сообщение
    socket.on('chatMessage', (msgData) => {
        const newMsg = {
            id: Date.now(),
            user: msgData.user || 'Игрок',
            avatar: msgData.avatar || 'https://ui-avatars.com/api/?name=P&background=1c1c1f&color=D4AF37&bold=true',
            text: msgData.text,
            rank: msgData.rank || '',
            time: new Date().toLocaleTimeString('ru-RU', { hour: '2-digit', minute: '2-digit' })
        };
        
        chatMessages.push(newMsg);
        // Ограничиваем историю 50 сообщениями
        if (chatMessages.length > 50) chatMessages.shift();
        
        // Рассылаем всем
        io.emit('chatMessage', newMsg);
    });
});

// Старт сервера
server.listen(PORT, () => {
    console.log(`🚀 Сервер запущен на http://localhost:${PORT}`);
    console.log(`📁 Файлы сайта раздаются из папки /public`);
});
