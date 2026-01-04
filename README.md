# Pilates Video App

אפליקציית פילאטיס מאובטחת עם סנכרון מ-Google Sheets

## תכונות

- 🔐 אימות JWT - רק משתמשים מורשים יכולים לגשת לאתר
- 👤 ניהול משתמשים - מנהל יכול ליצור משתמשים חדשים
- 📊 סנכרון מ-Google Sheets - טעינת תרגילים מגיליון אלקטרוני
- 🎥 נגן וידאו - צפייה בסרטוני YouTube לא רשומים
- 🇮🇱 ממשק בעברית

## דרישות מערכת

- Node.js 18+
- MongoDB
- חשבון Google Service Account עם גישה ל-Google Sheets API

## התקנה

### Backend

1. עבור לתיקיית השרת:

```bash
cd server
```

2. התקן תלויות:

```bash
npm install
```

3. צור קובץ `.env` (ראה `.env.example`):

```env
PORT=3000
NODE_ENV=development
MONGODB_URI=mongodb://localhost:27017/pilates-video-app
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production
JWT_EXPIRES_IN=7d
GOOGLE_SERVICE_ACCOUNT_PATH=./path/to/service-account-key.json
GOOGLE_SHEET_ID=your-google-sheet-id
ADMIN_EMAIL=admin@example.com
ADMIN_PASSWORD=admin123
```

4. צור משתמש מנהל ראשוני:

```bash
npm run create-admin
```

5. הפעל את השרת:

```bash
npm run dev
```

### Frontend

1. עבור לתיקיית הלקוח:

```bash
cd client
```

2. התקן תלויות:

```bash
npm install
```

3. צור קובץ `.env` (אופציונלי, אם השרת רץ על פורט אחר):

```env
VITE_API_URL=http://localhost:3000/api
```

4. הפעל את הלקוח:

```bash
npm run dev
```

## הגדרת Google Sheets

1. צור Service Account ב-Google Cloud Console
2. הורד את מפתח ה-JSON של ה-Service Account
3. שתף את הגיליון האלקטרוני עם כתובת האימייל של ה-Service Account
4. העתק את ה-Sheet ID מה-URL של הגיליון
5. הגדר את הנתיבים ב-`.env`

### מבנה הגיליון

הגיליון צריך להכיל:

- שורה ראשונה: כותרות (headers)
- שורות נוספות: נתוני תרגילים

שדות מומלצים:

- שם/Name/Title - שם התרגיל
- YouTube URL/Video URL - קישור לסרטון YouTube
- תיאור/Description - תיאור התרגיל
- משך/Duration - משך התרגיל בדקות
- רמה/Difficulty - רמת קושי
- קטגוריה/Category - קטגוריה

המערכת תזהה אוטומטית שדות עם שמות דומים.

## שימוש

### התחברות

1. פתח את האתר בדפדפן
2. לחץ על "התחברות"
3. הזן את האימייל והסיסמה של משתמש קיים

### יצירת משתמש חדש (מנהל בלבד)

1. התחבר כמנהל
2. השתמש ב-API endpoint:

```bash
POST /api/auth/users
Authorization: Bearer <admin-token>
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "password123",
  "role": "user"
}
```

### סנכרון תרגילים (מנהל בלבד)

1. התחבר כמנהל
2. עבור לדף "סרטונים"
3. לחץ על "סנכרן מגיליון"
4. התרגילים יטענו מ-Google Sheets

## API Endpoints

### Authentication

- `POST /api/auth/login` - התחברות
- `GET /api/auth/me` - קבלת פרופיל נוכחי
- `POST /api/auth/users` - יצירת משתמש חדש (מנהל בלבד)

### Exercises

- `GET /api/exercises` - קבלת כל התרגילים (דורש אימות)
- `GET /api/exercises/:id` - קבלת תרגיל ספציפי (דורש אימות)
- `POST /api/exercises/sync` - סנכרון מ-Google Sheets (מנהל בלבד)

## בדיקות ידניות

1. **בדיקת התחברות:**

   - פתח את האתר
   - נסה לגשת לדף "סרטונים" - צריך להפנות להתחברות
   - התחבר עם משתמש קיים
   - ודא שאתה מועבר לדף הסרטונים

2. **בדיקת יצירת משתמש:**

   - התחבר כמנהל
   - צור משתמש חדש דרך ה-API
   - ודא שהמשתמש יכול להתחבר

3. **בדיקת סנכרון:**

   - התחבר כמנהל
   - לחץ על "סנכרן מגיליון"
   - ודא שהתרגילים נטענו

4. **בדיקת נגן וידאו:**
   - בחר תרגיל מהרשימה
   - ודא שהסרטון נטען וניתן לצפייה

## פתרון בעיות

### שגיאת חיבור ל-MongoDB

- ודא ש-MongoDB פועל
- בדוק את ה-URI ב-`.env`

### שגיאת Google Sheets

- ודא שה-Service Account JSON קיים וזמין
- ודא שהגיליון משותף עם כתובת האימייל של ה-Service Account
- בדוק שה-Sheet ID נכון

### שגיאת JWT

- ודא שה-JWT_SECRET מוגדר
- ודא שהטוקן לא פג תוקף

## רישיון

ISC
