const express = require('express');
const path = require('path');

//Import des routes
const userRoutes = require('./routes/userRoute')
// const routesPosts = require('./routes/routesPosts');
// const routesUsers = require('./routes/routesUsers');
// const routesMod = require('./routes/routesMod');

const app = express();

app.use((req, res, next) => {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content, Accept, Content-Type, Authorization');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, PATCH, OPTIONS');
    next();
});
// Middleware qui donne acces au corps de la requete permet d'utiliser les données de la base de données
app.use(express.json());
// Dossier statique images ,lorsque une image ajoutée elle est envoyée à /images
app.use('/images', express.static(path.join(__dirname, 'images')));

// utilisation des routes
app.use('/api/auth', userRoutes);
// app.use('/api/posts', routesPosts);
// app.use('/api/auth', routesUsers);
// app.use('/api/moderation', routesMod);

module.exports = app;