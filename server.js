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
	var index = parseInt(req.params.id);
	db.todo.destroy({where:{id:index}}).then(function(rowsDeleted){
		if(rowsDeleted===0){
			res.status(404).send({error:'no todo with this id'})
		}else{
			res.status(204).send();
		}	
	},function(){
		res.status(404).send({error:'no todo with this id'})
	}).catch(function(err){
		res.status(500).send(err);
	});
});

app.put('/todos/:id', function (req, res) {

	var body = _.pick(req.body, 'description', 'completed'); //just gets the fields we are interested in 
	var index = parseInt(req.params.id);
	var attributes = {};

	if (body.hasOwnProperty('completed')){
	 	attributes.completed = body.completed;
	} 

	if (body.hasOwnProperty('description')) {
		attributes.description = body.description;
	}

	db.todo.update(attributes,{where:{id:index}}).then(function(affectedRows){
		if(affectedRows[0]===0){
			res.status(404).send({error:'No records were updated'});
		}else{
			res.status(204).send();
		}
	},function(){
		res.status(404).send({error:'Update failed'});
	}).catch(function(err){
		res.status(500).send(err);
	});
	
});

app.post('/users',function(req,res){
	var body = _.pick(req.body,'email','password');
	db.user.create(body).then(function(user){
		res.json(user);
	},function(err){
		res.status(400).send(err);
	}).catch(function(err){
		console.log(err);
		res.status(500).send();
	})
	
});


db.sequelize.sync().then(function () {
	app.listen(PORT, function () {
		console.log('Express listening on Port ' + PORT + '!');
	});
});


