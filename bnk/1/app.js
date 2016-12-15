var login = require("facebook-chat-api");

// Create simple echo bot
login({email: "real.smart.alert@gmail.com", password: "REAL161101"},{pageID: 1833282246920785}, function callback (err, api) {
    if(err) return console.error(err);

    var learnFlag = false;
    var learnStep = 0;
    var learnMessage = "";
    var insertID = "";

    var listVarThread = {};

    api.listen(function callback(err, message) {

    	if (listVarThread.hasOwnProperty(message.threadID) === false) {
    		listVarThread[message.threadID] = {learnFlag:false,
    										   learnStep:0,
    										   learnMessage:"",
    										   insertID:""};
    	}

    	var mysql      = require('mysql');
		var connection = mysql.createConnection({
		  host     : 'localhost',
		  user     : 'root',
		  password : '9B215ffa',
		  database : 'bot'
		});

		connection.connect();

		var msgBody = message.body;
		

		if ((msgBody.toLowerCase() === "y"|| 
			msgBody.toLowerCase() === "yes" || 
			msgBody.toLowerCase() === "yep" || 
			msgBody === "ได้") && (listVarThread[message.threadID].learnFlag === true) && (listVarThread[message.threadID].learnStep === 0)) {
			api.sendMessage('ฉันควรจะตอบอย่างไร? ถ้ามีการกล่าวถึง "'+listVarThread[message.threadID].learnMessage+'"', message.threadID);
			listVarThread[message.threadID].learnStep = listVarThread[message.threadID].learnStep + 1;

		}else if((msgBody === "N"|| 
			msgBody === "n" || 
			msgBody === "no" || 
			msgBody === "NO" || 
			msgBody === "ไม่") && (listVarThread[message.threadID].learnFlag === true) && (listVarThread[message.threadID].learnStep === 0)){

			api.sendMessage('U_U เสียใจจุงเบย', message.threadID);
			listVarThread[message.threadID].learnStep = 0;
			listVarThread[message.threadID].learnFlag = false;
		}else if(listVarThread[message.threadID].learnStep === 1)
		{
			var post  = {question_msg: listVarThread[message.threadID].learnMessage};
			var query = connection.query('INSERT INTO tb_general_question SET ?', post, function(err, result) {

				var postAns  = {ans_msg: msgBody,question_id_ref: result.insertId};
				var queryAns = connection.query('INSERT INTO tb_ans_message SET ?', postAns, function(err, result) {
				  	api.sendMessage('^^ ขอบใจจ้า', message.threadID);
				  	listVarThread[message.threadID].learnStep = 0;
				  	listVarThread[message.threadID].learnFlag = false;
				});

			  	// api.sendMessage('ช่วยใส่คำตอบของ "'+msgBody+'" ให้หน่อย', message.threadID);
			  	// listVarThread[message.threadID].insertID = result.insertId;
			  	// listVarThread[message.threadID].learnStep = listVarThread[message.threadID].learnStep + 1;
			});
		}
		// else if(listVarThread[message.threadID].learnStep === 2)
		// {
		// 	var post  = {ans_msg: msgBody,question_id_ref: listVarThread[message.threadID].insertID};
		// 	var query = connection.query('INSERT INTO tb_ans_message SET ?', post, function(err, result) {
		// 	  	api.sendMessage('^^ ขอบใจจ้า', message.threadID);
		// 	  	listVarThread[message.threadID].learnStep = 0;
		// 	  	listVarThread[message.threadID].learnFlag = false;
		// 	});
		// }
		else
		{
				//select * from tb_ans_message, (select * from tb_general_question WHERE question_msg = "หิวจัง") tb_join WHERE question_id = question_id_ref ORDER BY rand() limit 1
				var query = 'select * from tb_ans_message, (select * from tb_general_question WHERE question_msg LIKE "%'+msgBody+'%") tb_join WHERE question_id = question_id_ref ORDER BY rand() limit 1';
				connection.query(query, 
					function(err, rows, fields) {
				  if (err) throw query;

				  // console.log('The solution is: ', rows[0].solution);
				  if (rows.length > 0) {
				  	api.sendMessage(rows[0].ans_msg, message.threadID);
				  	listVarThread[message.threadID].learnStep = 0;
					listVarThread[message.threadID].learnFlag = false;
				  	connection.end();
				  }else{
				  	api.sendMessage("ขอโทษด้วย ฉันไม่เข้าใจ สอนฉันได้ไหม? yes or no", message.threadID);
				  	listVarThread[message.threadID].learnFlag = true;
				  	listVarThread[message.threadID].learnStep = 0;
				  	listVarThread[message.threadID].learnMessage = msgBody;
				  	connection.end();
				  }
				  
				  
				});
		}
        	
        

		

        
    });
});
