M-Pesa Based WiFi Billing System














A full WiFi billing system allowing customers to buy internet time via M-Pesa STK Push, with optional MikroTik MAC-based access control.
Perfect for cyber cafés, public hotspots, estate WiFi and small ISPs.

🌟 Features

✔ M-Pesa STK Push integration

✔ Time-based internet access packages

✔ Admin dashboard

✔ MikroTik MAC whitelisting

✔ Real-time payment & session tracking

✔ Modern React/Next.js front-end

✔ Prisma ORM + MySQL database

✔ JWT authentication

🚀 Live Demo

🔗 https://anotherone-production-dcdb.up.railway.app/

🛠 Tech Stack
Backend

Node.js

Express.js

Prisma ORM

MySQL

Frontend

Next.js

React

TypeScript

Tailwind CSS

Other

MikroTik Router API

M-Pesa Daraja API

JWT + bcrypt

💻 Prerequisites

Node.js (16+)

npm

MySQL Server (8+)

Python 3.x (hotspot login server)

M-Pesa Requirements

Register & create an app in Safaricom Daraja Portal, then obtain:

Consumer Key

Consumer Secret

Passkey

Shortcode

MikroTik Router (Optional)

RouterOS v6+

API enabled:

/ip service set api disabled=no

⚡ Installation & Setup
1. Fork & Clone

Fork the repo:
👉 https://github.com/mwakidenis/Mpesa-Based_WiFi_Billing_System

Clone:

git clone https://github.com/mwakidenis/Mpesa-Based_WiFi_Billing_System.git
cd Mpesa-Based_WiFi_Billing_System

2. Install all dependencies
npm install

cd frontend
npm install
cd ..

3. Create MySQL Database
CREATE DATABASE wifi_billing;

4. Create .env
# M-Pesa Settings
MPESA_CONSUMER_KEY=your_key
MPESA_CONSUMER_SECRET=your_secret
MPESA_PASSKEY=your_passkey
MPESA_SHORTCODE=your_shortcode
MPESA_CALLBACK_URL=http://localhost:5000/api/mpesa/callback

# Database
DATABASE_URL="mysql://username:password@localhost:3306/wifi_billing"

# Authentication
JWT_SECRET=your_jwt_secret

# Admin
ADMIN_USERNAME=admin
ADMIN_PASSWORD=your_admin_password

# Server
PORT=5000

# MikroTik (Optional)
MIKROTIK_HOST=router_ip
MIKROTIK_USERNAME=username
MIKROTIK_PASSWORD=password

5. Run migrations
npx prisma migrate dev --name init
npx prisma generate

6. Create admin account
node scripts/addAdmin.js

🏃 Running the Project
Backend Server
npm start


Runs at: http://localhost:5000

Frontend (Next.js)
cd frontend
npm run dev


Runs at: http://localhost:3000

Hotspot Login Server
python -m http.server 8080 --directory hotspot


Login page: http://localhost:8080/login.html

👥 Usage
For Users

Connect to WiFi

Browser redirects automatically

Choose package

Enter phone number

Approve M-Pesa STK Push

Internet access is granted

For Admins

Login: /admin/login

View users

View payments

Adjust packages

Monitor activity

🔗 API Endpoints
Payments
POST /api/pay
POST /api/mpesa/callback

Admin
POST /api/admin/login
GET  /api/admin/payments
GET  /api/admin/users

User
GET /api/packages
GET /api/user/status

🔧 Configuration
MikroTik Auto-Whitelist

Add router details in .env
System will automatically add/remove MAC using API.

Customize Internet Packages

Edit:

frontend/lib/constants.ts

🛠 Development
Project Structure
wifi_billing/
├── api/
├── config/
├── frontend/
│   ├── app/
│   ├── components/
│   └── lib/
├── hotspot/
├── middleware/
├── models/
├── prisma/
├── routes/
├── scripts/
└── index.js

Scripts
npm run dev
npm start
cd frontend && npm run dev
cd frontend && npm run build
cd frontend && npm run lint

🔒 Security

Change admin credentials instantly

Use HTTPS

Validate all user inputs

Enable rate limiting

Restrict database privileges

Never expose .env file

🤝 Contributing

Fork: https://github.com/mwakidenis/Mpesa-Based_WiFi_Billing_System

Create a branch:

git checkout -b feature-name


Commit:

git commit -am "Add feature"


Push:

git push origin feature-name


Submit PR

⚖ License

MIT License (see LICENSE)

💌 Support
📧 Email

mwakidenice@gmail.com

💬 WhatsApp

👉 Chat on WhatsApp

☕ Buy Me a Coffee

Made with ❤️ in Africa for the World 🌍
