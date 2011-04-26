$(function() {
	var _engine = Object.create(_computePrototype);
	var _graphics = Object.create(_graphicsPrototype);

	var _quadtree;
	var _nodes = [{x: 0.0,y: 0.0,vx: 0.0,vy: 0.0,m: 1.0, c: "#FFFFFF"}];
	var _links = [];
	var _forces = [];
	var _theta = 1;
	var _coulombConstant = 1000000;
	var _springConstant = .5;
	var _timeStep = 1;
	var _damping = .07;
	var _interval = 20;
	var _nodeRadius = 10;
	var _selectedNode = -1;
	var _canvas = $('#canvas')[0];
	var _ctx = _canvas.getContext('2d');

	$('#canvas').attr('width', '1000');
	$('#canvas').attr('height', '1000');

	for (var i=0; i < 21; i++) {
		var x = Math.floor(Math.random() * 1000) - 499;
		var y = Math.floor(Math.random() * 1000) - 499;
		var n = {x: x, y: y, vx: 0.0, vy: 0.0, m: 1.0, c: "#555555"};
		_nodes.push(n);
	}

	for (var i=1; i < 22; i++) {
		var link = {a: 0, b: i, c: "#000000"};
		_links.push(link);
	}

	setInterval(update_graph, 20);
	
	function update_graph() {
		_engine._nodes = _nodes;
		_engine._links = _links;
		_engine.compute_graph();
		_graphics._nodes = _nodes;
		_graphics._links = _links;
		_graphics._nodeRadius = _nodeRadius;
		_graphics.render(_ctx);
	}
});