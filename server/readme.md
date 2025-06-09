## 🚀 Get Started

Follow these steps to run the backend server locally.
> **Note:** Frontend is rendered from server side.
### 1. Navigate to Server Folder

```bash
cd server
```

### 2. Install Dependencies

```bash
npm install
```

### 3. Environment Variables

Create a `.env` file in the `server/` directory.
All required keys are listed in `.env.sample`.

Example `.env`:

```env
PORT=8888
OPENAI_API_KEY="your-openai-key"
CLOUDINARY_NAME="your-cloudinary-name"
CLOUDINARY_API_SECRET="your-cloudinary-secret"
CLOUDINARY_API_KEY="your-cloudinary-key"
```

### 4. Build and Start the Server

```bash
npm run build
npm run start
```

The server should now be running at:

```
http://localhost:8888
```

---

## 📁 Folder Structure (Server)

```
server/
├── src/                # Source code
│   ├── routes/         # API route handlers
│   ├── controllers/    # Business logic
│   ├── middlewares/    # Middleware functions
│   ├── utils/          # Utility/helper functions
│   └── index.ts        # Entry point
├── .env                # Environment variables
├── tsconfig.json       # TypeScript config
└── package.json
```

---

## 🥪 Scripts

| Command         | Description              |
| --------------- | ------------------------ |
| `npm install`   | Install dependencies     |
| `npm run build` | Compile TypeScript code  |
| `npm run start` | Start the backend server |

---

## 🔐 Technologies Used

* Node.js
* Express
* TypeScript
* Cloudinary
* OpenAI API


