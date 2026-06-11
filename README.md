
# EcoVisit — Clean City Initiative

A civic tech platform where citizens can report garbage and waste issues in their area. You upload a photo, video, or description along with your location — the report gets logged and tracked in real time. The idea is to make it easier for people to flag problems and hold municipalities accountable for cleanup.

---

## Features

- Waste report submission with image/video upload and GPS location
- User authentication with OTP verification
- Real-time report status tracking
- Reward system for verified reports *(planned)*
- Automated email alerts to local municipalities via Power Automate *(planned)*

---

## Tech Stack

| Layer | Technology |
|---|---|
| Frontend | React.js, TypeScript, Tailwind CSS |
| Backend / Database | Firebase (Firestore, Auth, Storage) |
| OTP / Email | EmailJS |
| AI Integration | Google Gemini API |
| Build Tool | Vite |

---

## Getting Started

**Prerequisites:** Node.js v18+, a Firebase project, EmailJS account, Gemini API key

```bash
git clone https://github.com/anuj1g/ecovisit.git
cd ecovisit
npm install

# Copy the env template and fill in your keys
cp .env.example .env.local

npm run dev
```

---

## Project Structure

```
ecovisit/
├── src/
│   ├── components/     # Reusable UI components
│   ├── pages/          # Route-level pages
│   ├── firebase/       # Firebase config and helpers
│   └── utils/          # Utility functions
├── .env.example
├── firestore.rules
└── vite.config.ts
```

---

## Roadmap

- [x] User authentication with OTP
- [x] Waste report submission with image/video upload
- [x] GPS location tagging
- [x] Real-time report status tracking
- [ ] Automated municipality email alerts via Power Automate
- [ ] Reward/voucher system for verified reports
- [ ] Admin dashboard for municipality officials

---

## Contributing

Pull requests are welcome. For major changes, open an issue first.

---

## License

MIT
