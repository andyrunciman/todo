var express = require('express');
var bodyParser = require('body-parser');
var _ = require('underscore');

var app = express();
var PORT = process.env.PORT || 3000; //Works for Horoko


app.use(bodyParser.json());

//model + collection
var todos = [{
	id:1,
	description:'pick up car',
	completed:false
},{
	id:2,
	description:'go to supermarket',
	completed:false
},{
	id:3,
	description:'make tea',
	completed:true
}];

var todoNextId = 4;

app.get('/',function(req,res){
	res.send('Todo API Root');
});

//GET /todos
app.get('/todos',function(req,res){
	res.json(todos);
});

//GET /todo/:id
app.get('/todos/:id',function(req,res){
	var index = parseInt(req.params.id);
	var matchedTodo = _.findWhere(todos,{id:index});
	if (matchedTodo){
		res.json(matchedTodo);
	}else{
		res.status(404).send();
	}
});

// POST /todos/
app.post('/todos',function(req,res){
    var body = _.pick(req.body,'description','completed'); //just gets the fields we are interested in 

	if(!_.isBoolean(body.completed) || !_.isString(body.description) || body.description.trim().length === 0){
		return res.status(400).send(); //400 bad data provided
	}

	
	body.id = todoNextId++ //sets the body id to the current num then increments
	body.description = body.description.trim();

	todos.push(body);
	res.send(body);	
});

//DELETE /todo/:id
app.delete('/todos/:id',function(req,res){
	var index = parseInt(req.params.id);
	//var item = _.find(todos,function(body){return body.id === index});
	var item = _.findWhere(todos,{id:index});
	
	if(item){
		//var itemPos = _.indexOf(todos,item)
		//todos.splice(itemPos,1);
		todos = _.without(todos,item); //refactored
		res.send(item);
	}else{
		return res.status(404).send();
	}
});

app.put('/todos/:id',function(req,res){

	var body = _.pick(req.body,'description','completed'); //just gets the fields we are interested in 
	var validAttributes = {};
	var index = parseInt(req.params.id);
	var matchedTodo = _.findWhere(todos,{id:index});

	if(!matchedTodo){
		return res.status(404).send();
		//404 not found
	}

	if(body.hasOwnProperty('completed') && _.isBoolean(body.completed)){
		validAttributes.completed = body.completed;
	}else if(body.hasOwnProperty('completed')){
		return res.status(400).send();
		//400 bad data
	}
	//seems to be open to SQL injection / Javascript injection

	if(body.hasOwnProperty('description') && _.isString(body.description) && body.description.trim().length > 0){
		validAttributes.description = body.description;
	}else if (body.hasOwnProperty('description')) {
		return res.status(400).send();
	}
	
	//this works as object passed by reference.
	_.extend(matchedTodo,validAttributes);

	//automatically sends 200
	res.json(matchedTodo);






	
});


app.listen(PORT,function(){
	console.log('Express listening on Port' + PORT + '!');
});
