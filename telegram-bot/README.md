# 🤖 Brain Arena Telegram Bot

ربات تلگرام برای بازی Brain Arena که امکان باز کردن وب اپ را فراهم می‌کند.

## 🚀 نصب و راه‌اندازی

### 1. ایجاد ربات در تلگرام

1. به [@BotFather](https://t.me/BotFather) در تلگرام پیام دهید
2. دستور `/newbot` را ارسال کنید
3. نام ربات را وارد کنید (مثال: `Brain Arena Bot`)
4. نام کاربری ربات را وارد کنید (باید به `bot` ختم شود، مثال: `brain_arena_quiz_bot`)
5. توکن ربات را کپی کنید

### 2. تنظیم Web App

1. به [@BotFather](https://t.me/BotFather) پیام دهید
2. دستور `/mybots` را ارسال کنید
3. ربات خود را انتخاب کنید
4. گزینه "Bot Settings" را انتخاب کنید
5. گزینه "Menu Button" را انتخاب کنید
6. "Configure Menu Button" را انتخاب کنید
7. URL وب اپ خود را وارد کنید:
   - برای توسعه: `http://localhost:3000`
   - برای پروداکشن: `https://your-domain.com`

### 3. نصب وابستگی‌ها

```bash
cd telegram-bot
npm install
```

### 4. تنظیم توکن

فایل `bot.js` را باز کنید و توکن ربات خود را جایگزین کنید:

```javascript
const token = 'YOUR_BOT_TOKEN'; // توکن دریافتی از BotFather
const webAppUrl = 'http://localhost:3000'; // آدرس وب اپ
```

### 5. اجرای ربات

```bash
# اجرای عادی
npm start

# اجرای در حالت توسعه (با nodemon)
npm run dev
```

## 📱 نحوه استفاده

### دستورات اصلی:
- `/start` - شروع بازی و نمایش دکمه وب اپ
- `/help` - نمایش راهنمای کامل

### مدیریت Webhook:
- `/setwebhook <URL>` - تنظیم webhook برای پروداکشن
- `/deletewebhook` - حذف webhook و بازگشت به polling
- `/webhookinfo` - نمایش اطلاعات webhook فعلی

### مراحل استفاده:
1. ربات را در تلگرام پیدا کنید
2. دستور `/start` را ارسال کنید
3. روی دکمه "🚀 شروع بازی" کلیک کنید
4. وب اپ Brain Arena باز خواهد شد

## ⚙️ ویژگی‌ها

- **پیغام خوشامدگویی**: پیغام فارسی با دکمه باز کردن وب اپ
- **دکمه Web App**: دسترسی مستقیم به بازی
- **سرور Express**: سرور داخلی برای دریافت Webhook
- **پشتیبانی از داده**: دریافت اطلاعات از وب اپ
- **مدیریت خطا**: کنترل خطاها و لاگ‌گیری
- **تشخیص خودکار حالت**: انتخاب خودکار بین polling و webhook

## 🔧 تنظیمات پیشرفته

### تغییر پیغام خوشامدگویی

در فایل `bot.js`، متغیر `welcomeMessage` را ویرایش کنید.

### تغییر آدرس وب اپ

متغیر `webAppUrl` را با آدرس مورد نظر خود تغییر دهید.

### اضافه کردن دستورات جدید

```javascript
bot.onText(/\/help/, (msg) => {
  const chatId = msg.chat.id;
  bot.sendMessage(chatId, 'راهنمای استفاده از ربات...');
});
```

## 🚀 استقرار در پروداکشن

### استفاده از Webhook (توصیه شده)

```javascript
// به جای polling از webhook استفاده کنید
const bot = new TelegramBot(token, {webHook: true});
bot.setWebHook(`https://your-domain.com/bot${token}`);
```

### متغیرهای محیطی

```bash
# .env فایل
BOT_TOKEN=your_bot_token_here
WEB_APP_URL=https://your-domain.com
WEBHOOK_URL=https://your-domain.com
PORT=3001
NODE_ENV=production
```

### تنظیم خودکار Webhook

ربات به صورت خودکار webhook را تنظیم می‌کند اگر:
- متغیر `WEBHOOK_URL` در فایل `.env` تنظیم شده باشد
- متغیر `NODE_ENV` برابر `production` باشد

**حالت‌های مختلف:**
- **Development**: استفاده از polling (پیش‌فرض)
- **Production**: استفاده از webhook (اگر URL تنظیم شده باشد)

## 📝 نکات مهم

- حتماً توکن ربات را محرمانه نگه دارید
- برای پروداکشن از HTTPS استفاده کنید
- ربات را در سرور پایدار اجرا کنید
- لاگ‌های ربات را بررسی کنید

## 🆘 عیب‌یابی

### ربات پاسخ نمی‌دهد
- توکن را بررسی کنید
- اتصال اینترنت را چک کنید
- لاگ‌های کنسول را بررسی کنید

### وب اپ باز نمی‌شود
- آدرس URL را بررسی کنید
- تنظیمات Menu Button را چک کنید
- HTTPS برای پروداکشن الزامی است

## 📞 پشتیبانی

برای سوالات و مشکلات، Issue ایجاد کنید یا با تیم توسعه تماس بگیرید.