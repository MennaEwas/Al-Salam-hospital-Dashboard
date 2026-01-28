# Al Salam Dashboard

Small dashboard that chains these APIs:

- `GET /branches`
- `GET /specialties/{branch_id}?lang=E`
- `GET /doctors/{branch_id}/{specialty_id}?lang=E`
- `GET /get_doctor_bio?doctorId={doctor_id}&lang=en`

## Run locally

1) Install dependencies:

```bash
cd /home/menna/Desktop/Al-Salam-Dashboard
npm install
```

2) Start dev server:

```bash
npm run dev
```

Then open the URL printed in the terminal (usually `http://localhost:5173`).

## How to test in the UI

- Pick a **Branch** → app loads **Specialties**
- Pick a **Specialty** → app loads **Doctors**
- Pick a **Doctor** → app loads **Doctor Bio**

If anything fails, you’ll see an error message under the dropdown/bio panel.

## Notes (CORS)

The app calls `/api/...` from the browser, and Vite proxies that to:

- `https://salemuatapi.alsalamhosp.com:446`

Config is in `vite.config.ts`.

