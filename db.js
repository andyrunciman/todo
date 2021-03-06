var Sequelize = require('sequelize');
var env = process.env.NODE_ENV || 'development';
var sequelize;

if (env == 'production') {
    sequelize = new Sequelize(process.env.DATABASE_URL, {
        dialect: 'postgres'
    });
} else {
    sequelize = new Sequelize(undefined, undefined, undefined, {
        'dialect': 'sqlite',
        'storage': __dirname + '/data/dev-data-todo.sqlite'
    });
}


var db = {};
db.todo = sequelize.import(__dirname + '/models/todo.js');
db.user = sequelize.import(__dirname + '/models/user.js');
db.Sequelize = Sequelize;
db.sequelize = sequelize;

db.todo.belongsTo(db.user);
db.user.hasMany(db.todo);

module.exports = db;

