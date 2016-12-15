
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

			findSession(message.threadID, db, function(docs){
				if (docs.length === 0) {
					//NO SESSION
					if (msgBody !== "startnode") {
						api.sendMessage("Not found", message.threadID);
					}else{
						makeSession(message.threadID, msgBody, [], db, function(){
						findKeyword(msgBody,db, [], function(_docs) {
							console.log(_docs);
						  	if (_docs.length === 0) {
						  		api.sendMessage("Not found", message.threadID);
						  	}else{
						  		var sendText = "";
						  		for (i = 0; i < _docs.length; i++) { 
							    	sendText += _docs[i].message + "\n";
								}
								api.sendMessage(sendText, message.threadID);
						  	}  

						  	db.close(); 
						});
					  	
					});
					}
				}else{
					if (msgBody === "/back") {

						backwardTree(message.threadID, db, function(result){

							findSession(message.threadID, db, function(docs){ 
								findKeyword(docs[0].keyword, db, docs[0].currentAncestors, function(_docs) {
									//DISPLAY
									console.log(_docs.length);
									var sendText = "";
							  		for (i = 0; i < _docs.length; i++) { 
								    	sendText += _docs[i].message + "\n";
									}
									
									sendText += "---------[Command]---------" + "\n";
									sendText += "[/back] ย้อนกลับ" + "\n";
									sendText += "[/back-root] เริ่มต้นใหม่" + "\n";
									api.sendMessage(sendText, message.threadID);
									db.close();
								})
							})

						})

					}else if(msgBody === "/back-root") {

						backToRoot(message.threadID, db, function(){

							findSession(message.threadID, db, function(docs){ 
								findKeyword(docs[0].keyword, db, docs[0].currentAncestors, function(_docs) {
									//DISPLAY
									console.log(_docs.length);
									var sendText = "";
							  		for (i = 0; i < _docs.length; i++) { 
								    	sendText += _docs[i].message + "\n";
									}

									api.sendMessage(sendText, message.threadID);
									db.close();
								})
							})

						})

					}else{

					console.log("HAVE SESSION = "+docs[0].keyword);
					console.log("HAVE SESSION = "+docs[0].currentAncestors);
					findKeyword(docs[0].keyword, db, docs[0].currentAncestors, function(_docs) {
							
						  	if (_docs.length === 0) {
						  		api.sendMessage("Not found", message.threadID);
						  	}else{
						  		// var sendText = "";
						  		var isContain = false;
						  		for (i = 0; i < _docs.length; i++) { 
							    	if (_docs[i]._id === msgBody) {
							    		isContain = true;
							    	}
								}
								if (isContain) {
									var newAncestors = docs[0].currentAncestors;
									newAncestors.push(docs[0].keyword);

									findKeyword(msgBody, db, newAncestors, function(__docs) { 

										var cursor = db.collection('CallCenterTree').find({_id: msgBody}).toArray(function(err, docs) {

								    		db.collection('session').update({_id:message.threadID},{$set: {lastModifiedDate:new Date()}});
											db.collection('session').update({_id:message.threadID},{$set: {keyword:msgBody}});
											db.collection('session').update({_id:message.threadID},{$set: {currentAncestors:docs[0].ancestors}});

											//DISPLAY
											console.log(__docs.length);
											var sendText = "";
									  		for (i = 0; i < __docs.length; i++) { 
										    	sendText += __docs[i].message + "\n";
											}
											sendText += "---------[Command]---------" + "\n";
											sendText += "[/back] ย้อนกลับ" + "\n";
											sendText += "[/back-root] เริ่มต้นใหม่" + "\n";
											api.sendMessage(sendText, message.threadID);
											db.close();
										});

									})

								}else{
									//DISPLAY
									console.log(_docs.length);
									var sendText = "";
							  		for (i = 0; i < _docs.length; i++) { 
								    	sendText += _docs[i].message + "\n";
									}
									sendText += "---------[Command]---------" + "\n";
									sendText += "[/back] ย้อนกลับ" + "\n";
									sendText += "[/back-root] เริ่มต้นใหม่" + "\n";
									api.sendMessage(sendText, message.threadID);
									db.close();
								}
								// api.sendMessage(sendText, message.threadID);
						  	}  

						  	
					});
					}
					
				}
			})

			// findKeyword(msgBody,db, function(docs) {
			//   	if (docs.length === 0) {
			//   		api.sendMessage("Not found", message.threadID);
			//   	}else{
			//   		var sendText = "";
			//   		for (i = 0; i < docs.length; i++) { 
			// 	    	sendText += docs[i].message + "\n";
			// 		}
			// 		if (msgBody !== "StartNode"){
			// 			sendText += "_______________________\n[พิมพ์ \"Hello\" เริมต้นใหม่]\n_______________________";
			// 		}
					
					
			// 		api.sendMessage(sendText, message.threadID);
			//   	}  	
			//     db.close();
			// });
		});		 
    });
});
var makeSession = function(threadID, keyword, ancestors ,db, callback) {
	db.collection('session').insert({_id:threadID, keyword:keyword, lastModifiedDate:new Date() ,currentAncestors:ancestors});
	callback();
};
var findSession = function(threadID, db, callback) {
	if (threadID !== null) {
		var cursor = db.collection('session').find({_id: threadID}).toArray(function(err, docs) {
	    	callback(docs);
		});
	}else{
		callback([]);
	}
};
var backToRoot = function(threadID, db, callback) {
	if (threadID !== null) {
		db.collection('session').update({_id:threadID},{$set: {lastModifiedDate:new Date()}});
		db.collection('session').update({_id:threadID},{$set: {keyword:"startnode"}});
		db.collection('session').update({_id:threadID},{$set: {currentAncestors:[]}});
		callback();
	}else{
		callback();
	}
};
var backwardTree = function(threadID, db, callback) {
	if (threadID !== null) {
		var cursor = db.collection('session').find({_id: threadID}).toArray(function(err, docs) {
			
			var newKeyword = docs[0].currentAncestors.slice(-1)[0];
			if (typeof newKeyword === 'undefined' || !newKeyword) { 
				newKeyword = "startnode";
			}

	    	db.collection('session').update({_id:threadID},{$set: {lastModifiedDate:new Date()}});
			db.collection('session').update({_id:threadID},{$set: {keyword:newKeyword}});
			docs[0].currentAncestors.pop();
			db.collection('session').update({_id:threadID},{$set: {currentAncestors:docs[0].currentAncestors}});

			callback(true);
		});
	}else{
		callback(false);
	}
};
var hasChild = function(keyword, ancestors , db, callback) {
	console.log("HAS CHILD METHOD keyword "+keyword);
	console.log("HAS CHILD METHOD ancestors "+ancestors);
	if (keyword !== null) {

		var cursor = db.collection('CallCenterTree').find({parent: keyword.toLowerCase(), ancestors: ancestors}).toArray(function(err, docs) {
			console.log("HAS CHILD METHOD "+docs);
			if (docs.length > 0) {
				callback(true);
			}else{
				callback(false);
			}
	    	
		});
	}else{
		callback(false);
	}
};
var findKeyword = function(keyword, db, ancestors, callback) {

	console.log("keyword = "+keyword);
	console.log("db = "+db);
	console.log("ancestors = "+ancestors);

	if (keyword !== null) {

		db.collection('CallCenterTree').findOne( {_id:keyword, ancestors: ancestors}, function(err, result) { 

			if (err) { callback([]); }

		    if (result) {
		        var cursor = db.collection('CallCenterTree').find({parent: result._id}).toArray(function(err, docs) {
		    		callback(docs);
				});
		    } else {
		        callback([]);
		    }

		})
	}
	else{
		callback([]);
	}
};
