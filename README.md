# graph_editor
graph_editor is a web application which enables the user to create nodes, define the relationships (or links) between them, perform calculations, and save. 

## Dependencies
1. Node.js, v4.4.5 (https://nodejs.org/en/download/)
2. npm, 2.15.5 
3. Angular.js, 1.5.6
4. Express, 4.13.4
5. Joint.js
6. cors, 2.7.1
7. body-parser, 1.14.1

## Setup
1. First download Node.js, version 4.4.5. (https://nodejs.org/en/download/). Node now comes with npm. 
2. Create a directory where you'd like to contain this project, init a new git repository, and pull this one.
```
$ mkdir name_for_this_project
$ cd ./name_for_this_project
$ git init
$ git pull https://github.com/savvaspetridis/graph_editor/
```
3. Then run npm install to get the remaining dependencies
```
$ npm install
```

## How to run graph_editor
1. In the directory with app.js, run node app
```
$ node app
Express app running on port: 3000
```
2. Point your preferred browser to localhost:3000

## Usage
1. On the top you'll see the option to view a saved graph. Obviously there won't be any options there if you've just started.
2. Right below you'll find two toggles, one for node type and the other for deleting select nodes. 

###Types of nodes: 
1. Primary: You can add edit the value of these nodes. They represent the initial inputs. The values of these primary nodes affect the values of all the 'regular' nodes through the relationships, or links, between them. 
2. Regular: You can only edit the names of these nodes. Each one of these nodes is connected to a primary node. The links between these nodes and the primary nodes determine the values they hold. 

###Links:
Connections between nodes can be made by simply selecting one, by clicking, and then clicking another node. Later, one will be able to choose the exact mathematical relationship between nodes. As of right now, one can only add a Link Weight in the menu above. A link weight must be a number. The value of a regular node is currently calculated as follows: 

R : Target Regular Node
SN : Source Nodes

```
R.value = 0; 
for each source_node in source_nodes:
  R.value += source_node.value * source_node.link.weight
```

The value of each node is calculated upon pressing the 'calc' button. 

###Saving: 
You can save a graph you're working on by simply giving it a name and pressing 'save'. The graph will appear on the list of options right after, and every time you start this application.

###Deletion: 
You can remove all the nodes from the graph by pressing 'delete all'. 
You can remove select nodes (and all their links) by toggling 'delete select' and then clicking on nodes. 
