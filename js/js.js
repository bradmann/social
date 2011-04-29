$(function() {
	var engine = Object.create(nodular.computePrototype);
	var graphics = Object.create(nodular.graphicsPrototype);

	var quadtree;
	var nodes = [{x: 0.0,y: 0.0,vx: 0.0,vy: 0.0,m: 1.0, c: "#FFFFFF"}];
	var links = [];
	var forces = [];
	var config = {coulombConstant: 1000000, damping: .02, springConstant: .7, theta: 1, timeStep: 1.5};
	var interval = 20;
	var nodeRadius = 10;
	var selectedNode = -1;
	var canvas = $('#canvas')[0];
	var ctx = canvas.getContext('2d');
	
	function update_graph() {
		engine.compute_graph();
		graphics.render(nodes, links);
	}

	$('#canvas').attr('width', '1000');
	$('#canvas').attr('height', '1000');
	
	$('#canvas').mousedown(function(evt) {
		evt.preventDefault();
		var x = evt.pageX - this.offsetLeft - 500;
		var y = -(evt.pageY - this.offsetTop - 500);
		selectedNode = engine.get_node_at_location(x, y);
		engine.select_node(selectedNode);
	});
	
	$('#canvas').mouseup(function(evt) {
		selectedNode = -1;
		engine.deselect_node();
	});
	
	$('#canvas').mousemove(function(evt) {
		if (selectedNode !== -1) {
			var x = evt.pageX - this.offsetLeft - 500;
			var y = -(evt.pageY - this.offsetTop - 500);
			engine.move_node(selectedNode, x, y);
		}
	});

	//Make some nodes here
	for (var i=0; i < 50; i++) {
		var x = Math.floor(Math.random() * 1000) - 499;
		var y = Math.floor(Math.random() * 1000) - 499;
		var n = {x: x, y: y, vx: 0.0, vy: 0.0, m: 1.0, c: "#555555"};
		nodes.push(n);
	}

	//Make some links here
	for (var i=1; i < 51; i++) {
		var link = {a: 0, b: i, c: "#000000"};
		links.push(link);
	}
	
	//Set up the engine with our universe parameters
	engine.init(config);
	engine.nodes = nodes;
	engine.links = links;
	//Set up the graphics engine with our canvas context
	graphics.init(ctx);

	setInterval(update_graph, 20);
});