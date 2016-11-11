var express = require('express');
var bodyParser = require('body-parser');
var _ = require('underscore');
var db = require('./db.js');
var app = express();
var PORT = process.env.PORT || 3000; //Works for Horoko

app.use(bodyParser.json());

app.get('/', function (req, res) {
	res.send('Todo API Root');
});

//GET /todos
app.get('/todos', function (req, res) {
	var query = req.query;
	var where = {};
	if (query.hasOwnProperty('completed') && query.completed === "true"){
		where.completed = true;
	} else if (query.hasOwnProperty('completed') && query.completed === "false"){
		where.completed = false;
	}
	if (query.hasOwnProperty('q') && query.q.length > 0) {
		where.description = {
			$like:'%' + query.q + '%'
		};
	}
	db.todo.findAll({where:where}).then(function(todos){
		res.json(todos);
	}).catch(function(err){
		res.status(500).send(err);
	});;
});

//GET /todo/:id
app.get('/todos/:id', function (req, res) {
	var index = parseInt(req.params.id);
	db.todo.findById(index).then(function(todo){
		if(todo){
			res.json(todo.toJSON());
		}else{
			res.status(404).send();
		}
	}).catch(function(err){
		res.status(500).send(err);
	})

});

// POST /todos/
app.post('/todos', function (req, res) {
	var body = _.pick(req.body, 'description', 'completed'); //just gets the fields we are interested in 

	if(!_.isString(body.description) || body.description.trim().length < 1 || (body.completed && !_.isBoolean(body.completed))){
		return res.status('400').send("Invalid data");
	}

	db.todo.create({
		description: body.description,
		completed: body.completed || false
	}).then(function(todo){
		res.json(todo.toJSON());
	}).catch(function(err){
		res.json(err);
	});

});

//DELETE /todo/:id
app.delete('/todos/:id', function (req, res) {
	// var index = parseInt(req.params.id);
	// //var item = _.find(todos,function(body){return body.id === index});
	// var item = _.findWhere(todos, { id: index });

	// if (item) {
	// 	//var itemPos = _.indexOf(todos,item)
	// 	//todos.splice(itemPos,1);
	// 	todos = _.without(todos, item); //refactored
	// 	res.send(item);
	// } else {
	// 	return res.status(404).send();
	// }
});

app.put('/todos/:id', function (req, res) {

	var body = _.pick(req.body, 'description', 'completed'); //just gets the fields we are interested in 
	// var validAttributes = {};
	// var index = parseInt(req.params.id);
	// var matchedTodo = _.findWhere(todos, { id: index });

	// if (!matchedTodo) {
	// 	return res.status(404).send();
	// 	//404 not found
	// }

	// if (body.hasOwnProperty('completed') && _.isBoolean(body.completed)) {
	// 	validAttributes.completed = body.completed;
	// } else if (body.hasOwnProperty('completed')) {
	// 	return res.status(400).send();
	// 	//400 bad data
	// }
	// //seems to be open to SQL injection / Javascript injection

	// if (body.hasOwnProperty('description') && _.isString(body.description) && body.description.trim().length > 0) {
	// 	validAttributes.description = body.description;
	// } else if (body.hasOwnProperty('description')) {
	// 	return res.status(400).send();
	// }

	// //this works as object passed by reference.
	// _.extend(matchedTodo, validAttributes);

	// //automatically sends 200
	// res.json(matchedTodo);

});

console.log(db);

db.sequelize.sync().then(function () {
	app.listen(PORT, function () {
		console.log('Express listening on Port ' + PORT + '!');
	});
});


