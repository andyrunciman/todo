function doWork(data,callback){
    data = data + " processing..."
    callback(data); 
}

doWork('important work',function(data){
    console.log(data + "I'm cool!")
})

function doWorkPromise(data){
    return new Promise(function(res,rej){
        // setTimeout(function(){
        //     res('everything worked');
        // },2000);
        
        rej({
            error:'fucking broke!'
        })
    });
}

doWorkPromise('some data').then(function(data){
    console.log(data);
},function(error){
    console.log(error.error);
});