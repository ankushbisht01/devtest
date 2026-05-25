# Welcome

This is the GitHub repository for website of [SpArc Architects](https://github.com/dayshmookh/website-sparc)

## Local setup

Create `.env` from `.env.example` and start MongoDB locally:

```sh
cp .env.example .env
docker run -d --name website-sparc-mongo -p 27017:27017 mongo
npm install
npm start
```

Populate sample data, including local product and project images:

```sh
node scripts/populatedb.js mongodb://127.0.0.1:27017/website-sparc
```

Email sending is handled by a local dummy mailer in development. Project image uploads are stored under `www/catalog/project`.
