const express = require('express');
const debug = require('debug')('app');
const mongoose = require('mongoose');
const bodyParser = require('body-parser')

const app = express();
const port = process.env.PORT || 8080;
const Poem = require('./src/models/poemModel');

if (process.env.NODE_ENV === 'production') {
app.use(express.static('public'));
}
app.use(bodyParser.urlencoded({ extended: true}));
app.use(bodyParser.json());


const db = mongoose.connect('mongodb+srv://daniamcode:daniamcode@cluster0.m6ejn.mongodb.net/poemsAPI?retryWrites=true&w=majority');

const poemRouter = require('./src/routes/poemRouter')(Poem)

app.use('/api/poems', poemRouter)

app.listen(port, () => debug(`running on port ${port}`));

const path = require('path');
if (process.env.NODE_ENV === 'production') {
app.get('*', (req, res) => {
	res.sendFile(path.resolve(__dirname, 'public', 'index.html'));
});
} else {
	app.get('/', (req, res) => {
		res.send('Server is ok')
	});
}
