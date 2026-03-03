# Deploy Backend to Vercel

1. Install Vercel CLI:
```bash
npm i -g vercel
```

2. Deploy backend:
```bash
cd backend
vercel --prod
```

3. Set environment variable in Vercel dashboard:
- GEMINI_API_KEY = AIzaSyB6rodRS4YmnAU4-TAOH6SUidpP6Hmru-Y

4. Update frontend API_BASE to your backend URL

Your backend will be at: https://your-project-name.vercel.app