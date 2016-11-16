var express = require('express');
var bodyParser = require('body-parser');
var _ = require('underscore');
var db = require('./db.js');
var app = express();
var middleware = require('./middleware.js')(db);


var PORT = process.env.PORT || 3000; //Works for Horoko

app.use(bodyParser.json());

app.get('/', function (req, res) {
	res.send('Todo API Root');
});

//GET /todos
app.get('/todos',middleware.requireAuthentication, function (req, res) {
	var query = req.query;
	var where = {};
	
	where.userId = req.user.get('id');
	
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
app.get('/todos/:id',middleware.requireAuthentication, function (req, res) {
	var index = parseInt(req.params.id);
	db.todo.findOne({where:{
		userId:req.user.get('id'),
		id:index
	}}).then(function(todo){
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
app.post('/todos', middleware.requireAuthentication,function (req, res) {
	var body = _.pick(req.body, 'description', 'completed'); //just gets the fields we are interested in 

	if(!_.isString(body.description) || body.description.trim().length < 1 || (body.completed && !_.isBoolean(body.completed))){
		return res.status('400').send("Invalid data");
	}
	db.todo.create({
		description: body.description,
		completed: body.completed || false
	}).then(function(todo){
		//res.json(todo.toJSON());
		req.user.addTodo(todo).then(function(){
			console.log('todo info' + todo);
			return todo.reload();
		}).then(function(todo){
			return res.json(todo.toJSON());
		});
	}).catch(function(err){
		res.json(err);
	});

});

//DELETE /todo/:id
app.delete('/todos/:id', middleware.requireAuthentication, function (req, res) {
	var index = parseInt(req.params.id);
	db.todo.destroy({where:{
		id:index,
		userId:req.user.get('id')
	}}).then(function(rowsDeleted){
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

app.put('/todos/:id',middleware.requireAuthentication, function (req, res) {

	var body = _.pick(req.body, 'description', 'completed'); //just gets the fields we are interested in 
	var index = parseInt(req.params.id);
	var attributes = {};

	if (body.hasOwnProperty('completed')){
	 	attributes.completed = body.completed;
	} 

	if (body.hasOwnProperty('description')) {
		attributes.description = body.description;
	}

	db.todo.update(attributes,{where:{
		id:index,
		userId:req.user.get('id')
	}
	}).then(function(affectedRows){
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
		res.json(user.toPublicJSON());
	},function(err){
		res.status(400).send(err);
	}).catch(function(err){
		console.log(err);
		res.status(500).send();
	})
	
});

app.post('/users/login',function(req,res){
	var body = _.pick(req.body,'email','password');

	db.user.authenticate(body).then(function(user){
		res.header('Auth',user.generateToken('authentication')).json(user.toJSON());
	},function(err){
		res.status(401).send();	
	})
	// if(typeof body.password != 'string' || typeof body.email != 'string' ){
	// 	return res.status('400').send();
	// }
    // db.user.findOne({
    //     where: {
    //         email: body.email
    //     }
    // }).then(function(user) {
    //     if (!user) {
    //         return res.status(401).send();
	// 		//AUTHENTICATION FAIL
    //     }		
	// 	if(user.validatePassword(body.password)){
	// 		return res.json(user.toJSON());
	// 	}else{
	// 		 return res.status(401).send();
	// 	}
    // }, function(e) {
    //     return res.status(500).send();
    // });
})
//{force:true}
db.sequelize.sync().then(function () {
	app.listen(PORT, function () {
		console.log('Express listening on Port ' + PORT + '!');
	});
});


