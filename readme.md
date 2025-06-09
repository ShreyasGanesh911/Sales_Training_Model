## 🧰 Folder Structure

```
project-root/
├── client/     # Frontend React app
│   └── .env    # Environment variables
├── server/     # Backend API
│   └── .env    # Environment variables
├── README.md
└── ...
```

---

## 🚀 Get Started

Follow these steps to run the application locally.

### 1. Clone the Repository

```bash
git clone https://github.com/ShreyasGanesh911/Sales_Training_Model.git
cd Sales_Training_Model
```

### 2. Setup the Client

```bash
cd client
npm install
```

* Create a `.env` file inside the `client` directory with necessary variables present in the ` .env.sample`.
* Then build the client:

```bash
npm run build
```

### 3. Setup the Server

```bash
cd ../server
npm install
```

* Create a `.env` file inside the `server` directory with necessary variables present in the ` .env.sample`.
* Then build and start the server:

```bash
npm run build
npm run start
```

### 4. Open in Browser

The app should now be running on:

```
http://localhost:8888
```

---

## ⚙️ Environment Variables

You’ll need to create two `.env` files — one inside `client/` and one inside `server/`.

All the required content is present in the .env.sample files

```
VITE_SERVER_URL = "http://localhost:8888"
```

Example `.env` (server):

```
PORT = 8888
OPENAI_API_KEY = ""
CLOUDINARY_NAME = ""
CLOUDINARY_API_SECRET = ""
CLOUDINARY_API_KEY = ""
```

---

## 🥪 Scripts

### Client

| Command         | Description          |
| --------------- | -------------------- |
| `npm install`   | Install dependencies |
| `npm run build` | Build the frontend   |

### Server

| Command         | Description              |
| --------------- | ------------------------ |
| `npm install`   | Install dependencies     |
| `npm run build` | Compile TypeScript code  |
| `npm run start` | Start the backend server |

---

