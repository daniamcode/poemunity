## Important note

There are two folders: flux and redux. In the flux folder we have the original project, made during the bootcamp and deployed afterwards. The app is online. The, I crate the redux folder and continue from there. The project will grow in the redux folder and I will probably will refactor the code in order to incorporate redux and remove flux.

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

This project was bootstrapped with [Create React App](https://github.com/facebook/create-react-app).

## Available Scripts

**Important!** You will need a local implementation of MongoDB. My database is called "poemsAPI" and my collection is called "poems".

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

The Git repository on the root folder is the one that synchs with github. We go to the "frontend" folder, and type "npm run build". This builds the frontend into static files, and redirects automatically (see prebuild and postbuild scripts on package.json) to the "public" folder of the "backend" folder. We also send there the favicon (poemunity.svg file). So we just have to serve the backend (that serves a static index; the whole frontend resumes into that static file)

In the "backend" folder we create another git repository (git init) that is necessary in order to connect with Heroku. Each time that we make a new build, we type from inside of the backend folder: git add --all, git commit -m "modify static files from frontend" and git push heroku master. Previously we have had to type heroku git:remote -a poemunity, in order to link the git repository to Heroku.

That's it, Heroku builds the backend and deploys.

The MongoDB database is in the cloud, so he just have to link it.

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