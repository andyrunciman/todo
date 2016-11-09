var express = require('express');
var bodyParser = require('body-parser')

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
	
	// var index = parseInt(req.params.id);
	// if (Number.isInteger(index) && index >= 0 && index < todos.length){
	// 	res.json(todos[index]);
	// }else
	// {
	// 	res.send({});
	// }
	
	var index = parseInt(req.params.id);
	if(Number.isInteger(index)) {
		for (var i = todos.length - 1; i >= 0; i--) {
		  if (todos[i].id === index) {
		  	res.json(todos[i]);
		  	return;
		  }
		}
	}
	res.status(404).send();

});

// POST /todos/

app.post('/todos',function(req,res){
	
	// var body = req.body;

	// if(body.description && body.completed){ //make sure we have a description and completed field
	// 	var todo = {
	// 		id: todoNextId,
	// 		description: body.description,
	// 		completed: (body.completed == 'true')
	// 	};
	// 	todos.push(todo);
	// 	todoNextId++;
	// 	res.json({message:'added to the database'});
	// }else{
	// 	res.status(404).send()
	// }

	var body = req.body;
	body.id = todoNextId++ //sets the body id to the current num then increments
	todos.push(body);
	res.send(body);	

});


app.listen(PORT,function(){
	console.log('Express listening on Port' + PORT + '!');
});
