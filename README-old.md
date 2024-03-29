# Important note

This App is online at https://poemunity.com 

There are three folders: flux, Poemunity-React-Query and poemunity-redux. In the flux folder we have the original project, made during the bootcamp and deployed afterwards. Then, I created the Poemunity-React-Query folder and continued from there, managing Server State (cache) with Poemunity-React-Query and Client State with useContext (a Global State Manager like Flux or Redux is not needed anymore with this approach since we divide it into these two differenciated parts (Server State (asynchronous) and Client State)). By the way, a middleware like Thunk manages asynchrony for Redux, and all that is now transparent to me with React Query.
Finally, I'm starting a third approach, this time with redux

# Poemunity - Fullstack React Application with Flux & Node.js

This Bootcamp took place at _Skylab Coders Academy_ (Barcelona) from the 6th of July to the 25th of September of 2020.

My final Project was **Poemunity**, a social poetry website made in 2,5 weeks with the following technologies and methodologies:

- JavaScript
- React
- Flux
- Node.js
- Express
- MongoDB & Mongoose
- SCSS
- Material UI
- Git & Github
- TDD & BDD Testing (Jasmine, Jest, Mocha, Chai)
- Agile (Scrum)
- SOLID principles

Presentation: https://www.youtube.com/watch?v=WAyod6lGboE&t=4s


# IMPORTANT!: FOLLOWING NOTES ARE JUST TO REMEMBER, BUT THEY ARE OLD. NOW I'M ON AMAZON WEB SERVICES, I DO CI/CD WITH GITHUB ACTIONS AND I MANAGE AUTHENTICATION MYSELF WITH TOKENS)


This project was bootstrapped with [Create React App](https://github.com/facebook/create-react-app).

## Available Scripts

**Important!** You will need an implementation of MongoDB. My database is called "poemsAPI" and my collection is called "poems".

In the project directory, you can run:

### `npm start`

From the frontend folder, runs the app in the development mode.<br />
Open [http://localhost:3000](http://localhost:3000) to view it in the browser.


From the backend folder, runs the app in the development mode.<br />
Open [http://localhost:4200](http://localhost:4200) to view it in the browser.


### `npm test`

Launches the test runner in the interactive watch mode, both from the frontend and backend folders.<br />
See the section about [running tests](https://facebook.github.io/create-react-app/docs/running-tests) for more information.

## Upgrade

I've decided to launch this app into the real world. Just to remember:
- I bought my domain on Godaddy
- first I redirected my DNS from Godaddy to Heroku, but then I did it from Cloudfare, in order to get a free SSL certificate so my public direction is https://poemunity.com 

### `npm run build` and deploy to Heroku

Git clone the project. The Git repository on the root folder is the one that synchs with github. We go to "Poemunity-React-Query", then the "frontend" folder, and type "npm run build" (npm i first, to install node_modules). This builds the frontend into static files, and redirects automatically (see prebuild and postbuild scripts on package.json) to the "public" folder of the "backend" folder. We also send there the favicon (poemunity.svg file). So we just have to serve the backend (that serves a static index; the whole frontend resumes into that static file)

In the "backend" folder (npm i first, to install node_modules, and also install heroku) we create another git repository (git init) that is necessary in order to connect with Heroku. Each time that we make a new build, we type from inside of the backend folder: git add --all, git commit -m "modify static files from frontend" and "git push heroku master --force". Previously we have had to type heroku git:remote -a poemunity, in order to link the git repository to Heroku.

(I need another terminal with the root open so I can add, commit and push all the changes to my repo)
(I also need to create a .env file in Poemunity-React-Query/backend with the info contained in my google drive (poemunity -> .env))

That's it, Heroku builds the backend and deploys. Don't forget to add the env variables to Heroku (on production, from the backend folder. The .env file on the backed folder works fine on development, but for production I have to tell Heroku about them). The .env files (on backend and frontend folders) are included in .gitignore for security reasons.

The MongoDB database is in the cloud, so we just have to link it.

It's important to note that the auth0 uri is now conditional: in development is http://localhost:3000/perfil and in production is https://poemunity.com/perfil. We do this with the process.env.NODE_ENV variable.

### `npm run eject`

**Note: this is a one-way operation. Once you `eject`, you can’t go back!**

If you aren’t satisfied with the build tool and configuration choices, you can `eject` at any time. This command will remove the single build dependency from your project.

Instead, it will copy all the configuration files and the transitive dependencies (webpack, Babel, ESLint, etc) right into your project so you have full control over them. All of the commands except `eject` will still work, but they will point to the copied scripts so you can tweak them. At this point you’re on your own.

You don’t have to ever use `eject`. The curated feature set is suitable for small and middle deployments, and you shouldn’t feel obligated to use this feature. However we understand that this tool wouldn’t be useful if you couldn’t customize it when you are ready for it.

## Learn More

You can learn more in the [Create React App documentation](https://facebook.github.io/create-react-app/docs/getting-started).

To learn React, check out the [React documentation](https://reactjs.org/).

### Code Splitting

This section has moved here: https://facebook.github.io/create-react-app/docs/code-splitting

### Analyzing the Bundle Size

This section has moved here: https://facebook.github.io/create-react-app/docs/analyzing-the-bundle-size

### Making a Progressive Web App

This section has moved here: https://facebook.github.io/create-react-app/docs/making-a-progressive-web-app

### Advanced Configuration

This section has moved here: https://facebook.github.io/create-react-app/docs/advanced-configuration

### Deployment

This section has moved here: https://facebook.github.io/create-react-app/docs/deployment

### `npm run build` fails to minify

This section has moved here: https://facebook.github.io/create-react-app/docs/troubleshooting#npm-run-build-fails-to-minify