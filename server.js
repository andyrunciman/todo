var express = require('express');
var app = express();
var PORT = process.env.PORT || 3000; //Works for Horoko


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


app.listen(PORT,function(){
	console.log('Express listening on Port' + PORT + '!');
});
