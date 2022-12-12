This is a [Next.js](https://nextjs.org/) project bootstrapped with [`create-next-app`](https://github.com/vercel/next.js/tree/canary/packages/create-next-app).

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `pages/index.tsx`. The page auto-updates as you edit the file.

[API routes](https://nextjs.org/docs/api-routes/introduction) can be accessed on [http://localhost:3000/api/hello](http://localhost:3000/api/hello). This endpoint can be edited in `pages/api/hello.ts`.

The `pages/api` directory is mapped to `/api/*`. Files in this directory are treated as [API routes](https://nextjs.org/docs/api-routes/introduction) instead of React pages.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js/) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/deployment) for more details.

## Deploy on Firebase

Firebase files not included in git, must init the project from a new machine

- `firebase experiments:enable webframeworks`
- `firebase init hosting`
- `firebase deploy`

Also will need to add the following environment variables using `firebase functions:secrets:set <VAR_NAME>` and [granting your firebase function access to them](https://cloud.google.com/functions/docs/configuring/secrets):

- `OPENAI_SK`
- `PROJECT_NAME`
- `TWILIO_ACCOUNT_SID`
- `TWILIO_AUTH_TOKEN`
- `TWILIO_MESSAGING_SERVICE_SID`

## Weird notes

- Firebase hosting a preferred deploy target over vercel because hobby plan vercel has a 10 second timeout on serverless functions, whereas firebase cloud functions get 5 minutes.
- Using Cloud Tasks with firebase functions as a method of rate-limiting calls to OpenAI
- - As of writing there is no queuing logic on the server side, so need to consider this if hosting locally or on a VM like Railway, Digital Ocean, etc
- In a perfect world, UI + functions would be hosted cleanly on a paid-tier vercel deploy, which could handle potentially longer requests for generating images. However, would still potentially run into queuing/rate-limiting issues with larger audiences. And we still rely on Cloud Firestore as our db.
- Some kind of all-in-one solution would be to host on Railway (with queuing probably happening in-memory) with Supabase to store submissions