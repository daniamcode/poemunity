# Poemunity

This App is online at https://poemunity.com 

I'M ON AMAZON WEB SERVICES, I DO CI/CD WITH GITHUB ACTIONS AND I MANAGE AUTHENTICATION MYSELF WITH TOKENS

I made the frontend with React, and the backend with Node.js

There are three folders: flux, Poemunity-React-Query and poemunity-redux (this last one is the only one valid right now). 

## Flux 
In the flux folder we have the original project, made during the bootcamp and deployed afterwards. 

This Fullstack Bootcamp took place at _Skylab Coders Academy_ (Barcelona) from the 6th of July to the 25th of September of 2020.

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

## React-Query
Then, I created the Poemunity-React-Query folder and continued from there, managing Server State (cache) with Poemunity-React-Query and Client State with useContext (a Global State Manager like Flux or Redux is not needed anymore with this approach since we divide it into these two differenciated parts (Server State (asynchronous) and Client State)). By the way, a middleware like Thunk manages asynchrony for Redux, and all that becomes transparent to me with React Query.

## Redux
Finally, I implemented Redux. The other two folders (Flux and React-Query) are now deprecated.