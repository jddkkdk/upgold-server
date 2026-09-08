const express = require('express');
const app = express();
app.use(express.json());

// Временно храним балансы в памяти (при перезапуске сервера данные сбросятся)
// Позже можно подключить базу данных (SQLite, MongoDB и т.д.)
const users = {};

// ===== Эндпоинт для вебхука DonationAlerts =====
app.post('/webhook', (req, res) => {
  const donation = req.body.data;
  
  // Проверяем, что данные пришли
  if (!donation || !donation.attributes) {
    console.log('Ошибка: неверный формат запроса');
    return res.sendStatus(400);
  }

  const username = donation.attributes.username;
  const amount = donation.attributes.amount; // сумма доната в рублях

  // Начисляем голду: 1 голда за каждые 10 рублей
  const gold = Math.floor(amount / 10);

  if (!users[username]) {
    users[username] = { balance: 0 };
  }
  users[username].balance += gold;

  console.log(`✅ ${username} получил ${gold} голды. Баланс: ${users[username].balance}`);
  
  // Всегда отвечаем 200 OK, иначе DonationAlerts будет повторять запросы
  res.sendStatus(200);
});

// ===== Проверка баланса пользователя (для твоего сайта) =====
app.get('/balance/:username', (req, res) => {
  const username = req.params.username;
  const user = users[username];
  if (user) {
    res.json({ balance: user.balance });
  } else {
    res.json({ balance: 0 });
  }
});

// ===== Корневой эндпоинт (просто проверка, что сервер жив) =====
app.get('/', (req, res) => {
  res.send('Сервер работает!');
});

// ===== Запуск сервера =====
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`🚀 Сервер запущен на порту ${PORT}`);
});
