# Brounie Developer Examination

Photo viewer application that fetches photos from Instagram, using Firebase as storage solution.

## Design, Development and Architecture Decisions

Application solution was developed in a local environment using:

- Node.js / Express
- Firebase Auth
- Firebase Database
- PUG
- SASS
- Session-based platform

Firebase was the proposed storage solution, thus, dependencies and configurations were implemented to work with Express

The application consists of 4 VIEWS:

- login
- register
- home
- profile.

Accomplished functionalities are:
following:

1. Register\* (10 pts.)[check]
2. Login\* (10 pts.)[check]
3. Display images by date in descending order (20 pts.)[check]
4. User search (15 pts.)[check]
5. See users’ other submissions (10 pts.)[check]
6. Search autocomplete (15 pts.)[check]
7. See image details like title, description, etc (10 pts.)[check]
8. Follow other users (20 pts.)[check]
9. Profile (10 pts.)[check]
   10.Share in at least one social network (10 pts.)
   11.Complete README file\* (20 pts.)[check]
10. \*\*[extra] Middleware to invalidate unauthorized requests [check]

### Dependencies

- "body-parser": "^1.18.3", => form submits
- "express": "^4.16.4", => middleware
- "express-session": "^1.15.6", => userData & userID availability throughout application
- "firebase-admin": "^6.4.0", => firebase auth and database functions for node.js
- "instagram-node": "^0.5.8", => photo fetching
- "moment": "^2.22.2", => display photos creation date
- "path": "^0.12.7", => public path shortening
- "pug": "^2.0.3" => page structure

### Installing

Authorize Instragram username for Instagram API sandbox

Include:

- config/keys.js
- auth/serviceAccountKey.json

Run following commands:

- npm install
- node index.js

Go to localhost:80 and register

## Thank you!!

## Author

- **Kevin Aragon** - _pickME_ - (https://github.com/herisho/pickME)

## Acknowledgments

- Thanks Mau for letting me finish :)
