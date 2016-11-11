function doWork(data,callback){
    data = data + " processing..."
    callback(data); 
}

doWork('important work',function(data){
    console.log(data + "I'm cool!")
})

function doWorkPromise(data){
    return new Promise(function(res,rej){
        
        if(data){
            setTimeout(function(){
                res('everything worked');
            } ,2000);
        }else{
            rej({
                error:'fucking broke!'
            })
        }
    });
}

doWorkPromise(true).then(function(data){
    console.log(data);
},function(error){
    console.log(error.error);
});