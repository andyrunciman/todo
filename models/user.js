var bcrypt = require('bcrypt');
var _ = require('underscore');
var cryptojs = require('crypto-js');
var jwt = require('jsonwebtoken');

module.exports = function(sequelize,DataTypes){
    var user =  sequelize.define('user',{
        email:{
            type:DataTypes.STRING,
            allowNull:false,
            unique:true,
            validate:{
                isEmail:true
            }
        },
        salt:{
            type:DataTypes.STRING
        },
        password_hash:{
            type:DataTypes.STRING
        },
        password:{
            type:DataTypes.VIRTUAL, //doesnt save
            allowNull:false,
            validate:{
                len:[7,100]
            },
            set:function(value){
                var salt = bcrypt.genSaltSync(10);
                var hashedPassword = bcrypt.hashSync(value,salt);
                this.setDataValue('password',value);
                this.setDataValue('salt',salt);
                this.setDataValue('password_hash',hashedPassword);
            }
        }  
    },{
        hooks:{
            beforeValidate:function(user,options){
                //user.email -> convert to lower
                //only if it is a STRING
                if(user.email && user.email && (typeof user.email === 'string') && user.email.length > 0){
                    user.email = user.email.toLowerCase();
                }
            }
        },
        classMethods:{
            authenticate:function(body){
                return new Promise(function(resolve,reject){
                    if(typeof body.password != 'string' || typeof body.email != 'string' ){
		                return reject();
                    }else{
                        user.findOne({
                            where: {
                            email: body.email
                            }
                        }).then(function(user){
                            if(!user || !bcrypt.compareSync(body.password,user.get('password_hash'))){
                                return reject();
                            }
                            resolve(user);

                        },function(err){
                            return reject();
                        }).catch(function(e){
                            console.log(e);
                        });
                    }
                });
            },
            findByToken:function(token){
                return new Promise(function(resolve,reject){
                    try{
                        var decodedJWT = jwt.verify(token,'qwerty098');
                        console.log("here" + decodedJWT);
                        var bytes = cryptojs.AES.decrypt(decodedJWT.token,'abc123!@');
                        var tokenData = JSON.parse(bytes.toString(cryptojs.enc.Utf8));
                        
                        console.log("token data "+ tokenData.id);
                        user.findById(tokenData.id).then(function(user){
                            if(user){
                                resolve(user);
                            }else{
                                reject();
                            }
                        },function(err){
                            reject();
                        })

                    }catch(e){
                        reject();
                    }
                });
            }
        },
        instanceMethods:{
            toPublicJSON:function(){
                var json = this.toJSON();
                return _.pick(json,'id','email','createdAt','updatedAt');
            },
            validatePassword:function(password){
                var salt = this.salt;
                var usersHashedPassword = this.password_hash;
                var providedHashedPassword = bcrypt.hashSync(password,salt);
                return (usersHashedPassword == providedHashedPassword);

            },
            generateToken:function(type){
                if(!_.isString(type)){
                    return undefined;
                }
                try{
                    var stringData = JSON.stringify({id:this.get('id'),type:type});
                    var encryptedData = cryptojs.AES.encrypt(stringData,'abc123!@').toString();
                    var token = jwt.sign({
                        token:encryptedData

                    },'qwerty098');
                    return token;
                }catch(e){
                    console.log(e);
                }

            }
        }
    });

    return user;
}
