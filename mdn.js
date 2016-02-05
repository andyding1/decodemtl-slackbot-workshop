var request = require('request');
function doMDNSearch(keyword, callback){
    var mdnURL = 'https://developer.mozilla.org/en-US/search.json?q=';
   
        request(mdnURL+keyword, function(err,mdnResponse){
            if(err){
                console.log("Can't make request");
            }
            else{
                try{
                    var mdnObject = JSON.parse(mdnResponse.body);
                    callback(mdnObject);
                }
                catch(err){
                    throw new Error(err);
                }
            }
    });
    
}

doMDNSearch('indexOf',console.log);