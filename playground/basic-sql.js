var Sequelize = require('sequelize');
var sequelize = new Sequelize(undefined,undefined,undefined,{
    'dialect':'sqlite',
    'storage':__dirname + '/basic-sqlite-database.sqlite'
});

var Todo = sequelize.define('todo',{
    description:{
        type:Sequelize.STRING,
        allowNull:false,
        validate:{
            len:[1,250]
        }
    },
    completed:{
        type:Sequelize.BOOLEAN,
        allowNull:false,
        defaultValue:false
    }
});

sequelize.sync().then(function(){
    Todo.create({
        description:'play the piano'
    }).then(function(todo){
        return Todo.create({
            description:'eat chips'
        });
    }).then(function(todo){
        return Todo.findAll({
            where:{
                id:[11,12,13,14]
            }
        });
    }).then(function(todos){
        if(todos){
            todos.forEach(function(todo){
                console.log(todo.toJSON());
            })
        }else{
            console.log("not found")
        }
    },function(err){
        console.log(err)
    });
},function(err){
    console.log(err);
});

// sequelize.sync().then(function(){
//     console.log('Everything is synced');
//     Todo.create({
//         description:'take out trash',
//     }).then(function(todo){
//         return Todo.create({
//             description:"clean office"
//         });
//     }).then(function(){
//         return Todo.findAll({
//             where:{
//                 completed:false
//             }
//         });
//     }).then(function(todos){
//         if(todos){
//             todos.forEach(function(todo){
//                 console.log(todo.toJSON());
//             });
            
//         }else{
//             console.log('cant find id=1')
//         }
//     }).catch(function(err){
//         console.log(err);
//     });
// });