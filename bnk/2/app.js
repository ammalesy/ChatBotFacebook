
var login = require("facebook-chat-api");

login({email: "real.smart.alert@gmail.com", password: "REAL161101"},{pageID: 1833282246920785}, function callback (err, api) {
   if(err) return console.error(err);

    api.listen(function callback(err, message) {
    	// api.sendMessage("sendText", message.threadID);
    	var msgBody = message.body;
    	var MongoClient = require('mongodb').MongoClient
    	, assert = require('assert');

		// Connection URL
		var url = 'mongodb://localhost:27017/TheBot2';
		MongoClient.connect(url, function(err, db) {

			if (msgBody.toLowerCase() === "hi" ||
				msgBody.toLowerCase() === "hello" ||
				msgBody === "สวัสดี") {

				msgBody = "startnode";

			}else{
				msgBody = msgBody.toLowerCase();
			}

			findKeyword(msgBody,db, function(docs) {
			  	if (docs.length === 0) {
			  		api.sendMessage("Not found", message.threadID);
			  	}else{
			  		var sendText = "";
			  		for (i = 0; i < docs.length; i++) { 
				    	sendText += docs[i].message + "\n";
					}
					if (msgBody !== "StartNode"){
						sendText += "_______________________\n[พิมพ์ \"Hello\" เริมต้นใหม่]\n_______________________";
					}
					
					
					api.sendMessage(sendText, message.threadID);
			  	}  	
			    db.close();
			});
		});		 
    });
});

var findKeyword = function(keyword, db, callback) {
	if (keyword !== null) {
		var cursor = db.collection('CallCenterTree').find({parent: keyword}).toArray(function(err, docs) {
	    	callback(docs);
		});
	}else{
		callback([]);
	}
};
