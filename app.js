var express = require("express");
var bodyParser = require('body-parser');
var cors = require("cors");
var app = express(); 

app.use(function(req, res, next) {
	console.log(`${req.method} request for '${req.url}' - ${JSON.stringify(req.body)}`);
	next();
});

app.use(express.static("./public"));

app.use(bodyParser());

var fs = require('fs');

app.use(cors());

var file_name = "./graph_data.json";


app.get('/retrieve', function(req,res,next) {

	fs.readFile(file_name, { encoding: 'utf8' }, function (err, data) {

		if(err){
			console.log("could not read: " + file_name);
		}
		else{
			if(data.length != 0) {
				
				try{ 
					var graph_list = JSON.parse(data);

					var graph_names = [];

					for(i = 0; i < graph_list.length; i++){
						graph_names.push(graph_list[i].graph_json.name);
					}

					console.log(graph_names);

					res.end(JSON.stringify(graph_names));
				}
				catch(e){
					console.log("empty file!");
				}
			}
			else{
				//res.sendStatus(200);
			}
		}

	}); 
});

app.post('/graph', function (req, res, next) {

	console.log(req.body);

	var selected_graph_name = req.body['name'];

	fs.readFile(file_name, { encoding: 'utf8' }, function (err, data) {

		if(err){
			console.log("could not read: " + file_name);
		}
		else{
			var graph_list = JSON.parse(data);
			console.log(graph_list);

			for(i = 0; i < graph_list.length; i++){

				// console.log(graph_list[0].graph_json);

				var graph_name = (graph_list[i]).graph_json.name;

				if(graph_name == selected_graph_name){
					// res.writeHead(200, {"Content-Type": "application/json"});

					// console.log(JSON.stringify(graph_list[i]));

					res.end(JSON.stringify(graph_list[i].graph_json));
					// console.log("great!");
				}
			}

		}


	}); 

}); 

app.post('/', function (req, res, next) {

	var new_graph = req.body; 

	fs.readFile(file_name, { encoding: 'utf8' }, function (err, data) {

		if(err){
			console.log("could not read: " + file_name);
		}

		else { 
			try{
				
				var graph_list = JSON.parse(data); 
				graph_list.push(new_graph);
				var stringified = JSON.stringify(graph_list);
				fs.writeFile(file_name, stringified, function(err) 
				{
					if(err)
					{
						console.log("can't write to graph_data.");
					}
				});
				console.log(graph_list);
			}
			catch(e)
			{

				// create new list in json, for list of saved graphs
				var graph_array = [];
				graph_array.push(new_graph);
				graph_array = JSON.stringify(graph_array);
				fs.writeFile(file_name, graph_array, function(err) 
				{
					if(err)
					{
						console.log("can't write to graph_data.");
					}
				});
				console.log(graph_list);
			}
		}

	});

	res.sendStatus(200);
}); 


var port = 3000; 
app.listen(port);

console.log(`Express app running on port: ${port}`);

module.exports = app;