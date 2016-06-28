var express = require('express');
var bodyParser = require('body-parser');
var cors = require('cors');

var app = express(); 

app.use(function(req, res, next) {
	console.log(`${req.method} request for '${req.url}' - ${JSON.stringify(req.body)}`);
	next();
});

app.use(express.static("./public"));

app.use(bodyParser());

app.use(cors());

var request = require('request');

/* the host and port for the neo4j database */
var host = 'localhost', port = 7474; 

/* this is the http url for the neo4j database */
var httpUrlForTransaction = 'http://' + "neo4j:gendb@" + host + ':' + port + '/db/data/transaction/commit';


/* 
* 'run_cypher_query' runs a query in the neo4j database
* upon completion, it runs a callback function
*/
function run_cypher_query(query, params, callback) {
  request.post({
      uri: httpUrlForTransaction,
      json: {statements: [{statement: query, parameters: params}]}
    },
    function (err, res, body) {
      callback(err, body);
    })
}

/* 
* this function returns the names of graphs previously saved in neo4j
* these names fill the options of graphs to select on the front-end
*/
app.get('/retrieve', function(req,res,next) {

	console.log("retrieving option names...");

	var received_graph_names = 0;

	var graph_names_to_send = [];

	var found = false; 

	var name = '';

	params = {}; 

	run_cypher_query( 
		'MATCH (n) RETURN n.graph', 
		params, 
		function (err, resp) {
			if (err) {
					console.log(err);
			} else {

				received_graph_names = resp['results'][0]['data']; 

				for(i = 0; i < received_graph_names.length; i++){

					name = received_graph_names[i]['row'][0]; 

					for(j = 0; j < graph_names_to_send.length; j++){

						if(name == graph_names_to_send[j]){
							found = true; 
						}
					}

					if(found == false){
						graph_names_to_send.push(name);
					}
					else{
						found = false;
					}
				}

				console.log(graph_names_to_send);

				if(graph_names_to_send.length > 0){
					res.end(JSON.stringify(graph_names_to_send));
				}
				else{
					//res.sendStatus(200);
				}

			}
		}
	);
});


app.post('/delete', function (req, res, next) {

	var graph_name = req.body['name'];

	console.log("graph to delete: " + graph_name);

	params = { graph_name : graph_name };

	run_cypher_query( 
		// 'MATCH (n {graph: {graph_name}})-->(m) DETACH DELETE m', 
		'MATCH (n {graph: {graph_name}}) DETACH DELETE n', 
		params, 
		function (err, resp) {
			if (err) {
					console.log(err);
			} else {

				console.log(resp);
				res.sendStatus(200);
			}
		}
	);
}); 



app.post('/graph', function (req, res, next) {

	console.log("retrieving graph...");

	var graph_name = req.body['name'];

	var graph_json = { cells : [] }
	var cells = [];

	var params = { graph_name : graph_name};

	var link_info = 0;
	var link_weight = '';
	var link_id = '';
	var link_source = ''; 
	var link_target = '';

	var node_info = 0;
	var node_color = '';
	var node_name = '';
	var node_x = 0;
	var node_y = 0; 
	var node_id = ''; 
	var node_text = '';
	var node_value = '';
	var is_prim_node = false; 

	var acquired_nodes = false; 
	var acquired_links = false; 

	// get nodes from neo4j
	run_cypher_query(
		'MATCH (n {graph: {graph_name}}) RETURN n', 
		params,
		function (err, resp) {
    		if (err) {
      			console.log(err);
    		} else {

    			//console.log(resp['results'][0]['data']);

    			var node_list = resp['results'][0]['data'];

    			for(i = 0; i < node_list.length; i++) {

    				node_info = node_list[i]['row'][0];

    				node_color = node_info['color'];
    				node_name = node_info['name'];
    				node_x = node_info['x'];
    				node_y = node_info['y'];
    				node_id = node_info['id']; 
    				node_text = node_info['text'];
    				node_value = node_info['value'];
    				node_z = node_info['z'];

    				if(node_color == 'orange'){
    					is_prim_node = true;
    				}
    				else {
    					is_prim_node = false;
    				}

    				var node_json = { 'type' : 'basic.Rect', 
    								  'position' : { 'x' : node_x, 'y': node_y },
    								  'size' : { 'width' : 100, 'height' : 30 },
    								  'angle' : 0, 
    								  'id' : node_id, 
    								  'z' : node_z,
    								  'attrs' : { 'rect' : { 'fill' : node_color }, 
    								  			  'text' : { 'fill' : 'white', 'text' : node_text}, 
    								  			  'value' : node_value, 
    								  			  'name' : node_name,
    								  			  'prim_node' : is_prim_node	
    								  			} 
    								}

    				cells.push(node_json);

    				console.log(node_json);

    			}
    			acquired_nodes = true; 

    			if(acquired_links == true){
    				console.log("LINKS DONE FIRST");
    				var graph = { 'cells' : cells };
					// console.log(graph);
					res.end(JSON.stringify(graph));
    			}
    		}
  		}
	);

	// get links from neo4j
	run_cypher_query(
  		'MATCH ((n1:Node)-[r:AFFECTS]->(n2:Node)) WHERE r.graph = {graph_name} RETURN r.weight, r.id, r.source, r.target, r.z',
  		params, 
  		function (err, resp) {
    		if (err) {
      			console.log(err);
    		} else {

      			link_list = resp['results'][0]['data']; 

      			for(i = 0; i < link_list.length; i++) { 

	      			link_info = link_list[i]['row'];

	      			// console.log(link_info);

	      			link_weight = link_info[0]; 
	      			// console.log("WEIGHT: " + link_weight);
	      			link_id = link_info[1];
	      			// console.log("ID: " + link_id);
	      			link_source = link_info[2];
	      			// console.log("SOURCE: " + link_source);
	      			link_target = link_info[3];
	      			// console.log("TARGET: " + link_target);
	      			link_z = link_info[4];
	      			// console.log("Z: " + link_z);

	      			var link_json = { 'type' : 'fsa.Arrow',
	      							  'smooth' : 'true',
	      							  'source' : { 'id' : link_source },
	      							  'target' : { 'id' : link_target },
	      							  'labels' : [{ 'position': 0.5, 'attrs' : { 'text' : {'text' : link_weight, 'font-weight': 'bold' } } }],
	      							  'id' : link_id, 
	      							  'z' : link_z, 
	      							  'attrs': { 'weight' : link_weight }
									}

					cells.push(link_json);

					// console.log(link_json);
				}

				acquired_links = true;

				if(acquired_nodes == true) {
					console.log("NODES DONE FIRST");
					var graph = { 'cells' : cells };
					// console.log(graph);
					res.end(JSON.stringify(graph));
				}

    		}
  		}
	);
}); 

json_array_to_string = function(json_array) {
	var str = "";
	var array_length = Object.keys(json_array).length;

	console.log("weight_length: " + array_length);

	for(j = 0; j < array_length; j++){
		str += String(json_array[j]);
	}

	return str; 

};

insert_graph = function(graph_json , i) {

	var graph_json_specified = graph_json['graph_json'];
	var graph_name = graph_json_specified['name'];
	var cell_list = graph_json_specified['cells'];

	var current_cell = 0;

	var id = 0;

	// node variables
	var x = 0;
	var y = 0; 
	var color = 0;
	var text = 0;
	var value = 0; 
	var name = 0;
	var z = 0;

	// console.log("I: " + i);

	current_cell = cell_list[i];

	// node
	if(current_cell['type'] == "basic.Rect")
	{

		// console.log("~~~~ NODE ~~~~");

		x = current_cell['position']['x']; 
		// console.log("X: " + x);
		y = current_cell['position']['y'];
		// console.log("Y: " + y);
		id = current_cell['id'];
		// console.log("ID: " + id);
		color = current_cell['attrs']['rect']['fill'];
		// console.log("COLOR: " + color);
		text = current_cell['attrs']['text']['text'];
		// console.log("TEXT: " + text);
		var name_value_combo = text.split("\n");
		name = name_value_combo[0];
		// console.log("NAME: " + name);
		value = name_value_combo[1];
		// console.log("VALUE: " + value);
		z = current_cell['z'];

		var params = {graph_name: graph_name, x: x, y: y, id: id, color: color, text: text, name: name, value: value, z: z}; 

		run_cypher_query(
			'CREATE (node:Node {graph: {graph_name}, x: {x}, y: {y}, id: {id}, color: {color}, text: {text}, name: {name}, value: {value}, z: {z}})', 
			params, 
			function (err, resp) {
				if (err) {
  					console.log(err);
				} else {
  					// console.log(resp);
  					console.log("node added");
  					i = i + 1;
  					if(i < cell_list.length) {
  						insert_graph(graph_json, i);
  					}
				}
			}
		);

	}

	else {
		// console.log("~~~~ LINK ~~~~");
		id = current_cell['id'];
		// console.log("ID: " + id);
		source = current_cell['source']['id'];
		// console.log("SOURCE_ID: " + source);
		target = current_cell['target']['id'];
		// console.log("TARGET_ID: " + target);
		weight = json_array_to_string(current_cell['attrs']['weight']);
		// console.log("WEIGHT: " + weight);
		z = current_cell['z'];

		var params = {graph_name: graph_name, id: id, source: source, target: target, weight: weight, z: z};

		run_cypher_query(
			'MATCH (source_node:Node {id: {source}}) WITH source_node MATCH (target_node:Node {id: {target}}) CREATE (source_node)-[r:AFFECTS {graph: {graph_name}, id: {id}, weight: {weight}, source: {source}, target: {target}, z: {z}}]->(target_node)',
			params, 
			function (err, resp) {
				if (err) {
  					console.log(err);
				} else {
  					console.log(resp);
  					console.log("link added");
  					i = i + 1;
  					if(i < cell_list.length) {
  						insert_graph(graph_json, i);
  					}
				}
			}
		);
	}

}

app.post('/', function (req, res, next) {
	var new_graph = req.body; 
	insert_graph(new_graph, 0);
}); 


var port = 3000; 
app.listen(port);

console.log(`Express app running on port: ${port}`);

module.exports = app;