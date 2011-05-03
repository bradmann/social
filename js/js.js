$(function() {
	var engine = Object.create(nodular.computePrototype);
	var graphics = Object.create(nodular.graphicsPrototype);
	
	var quadtree;
	var nodes = [{x: 0.0,y: 0.0,vx: 0.0,vy: 0.0,m: 1.0, c: "#000000"}];
	var links = [];
	var forces = [];
	var interval = 20;
	var nodeRadius = 10;
	var selectedNode = -1;
	var width = 2000;
	var height = 1000;
	var canvas = $('#canvas')[0];
	var canvaswidth = $(canvas).width();
	var canvasheight = $(canvas).height();
	var ctx = canvas.getContext('2d');
	var graphconfig = {coulombConstant: 1000000, damping: .02, springConstant: .7, theta: 1, timeStep: 1, width: width, height: height};
	var canvasconfig = {context: ctx, width: width, height: height};
	
	function setup_controls() {
		$('#speed_val').html(graphconfig.timeStep);
		$('#damping_val').html(graphconfig.damping);
		$('#rep_val').html(graphconfig.coulombConstant);
		$('#spring_val').html(graphconfig.springConstant);
		$('#speed').bind('change', function(evt) {
			var val = $(this).val() / 10;
			engine.timeStep = val;
			$('#speed_val').html(val);
		});
		$('#damping').bind('change', function(evt) {
			var val = $(this).val() / 1000;
			engine.damping = val;
			$('#damping_val').html(val);
		});
		$('#repulsion').bind('change', function(evt) {
			var val = $(this).val();
			engine.coulombConstant = val;
			$('#rep_val').html(val);
		});
		$('#springs').bind('change', function(evt) {
			var val = $(this).val() / 100;
			engine.springConstant = val;
			$('#spring_val').html(val);
		});
	}
	
	function update_graph() {
		engine.compute_graph();
		graphics.render(nodes, links);
	}
	
	function pick_random_location() {
		return [Math.floor(Math.random() * width) - ((width / 2) - 1), Math.floor(Math.random() * height) - ((height / 2) - 1)];
	}

	setup_controls();
	
	$(canvas).attr('width', width.toString());
	$(canvas).attr('height', height.toString());
	
	$(canvas).mousedown(function(evt) {
		evt.preventDefault();
		var x = (evt.pageX - this.offsetLeft - (canvaswidth / 2)) * (width/canvaswidth);
		var y = -(evt.pageY - this.offsetTop - (canvasheight / 2)) * (height/canvasheight);
		selectedNode = engine.get_node_at_location(x, y);
		var url = nodes[selectedNode]["data"];
		if (url) {
			$('#links').html('<a href="' + url + '" target="_blank">' + url + '</a>');
		}
		engine.select_node(selectedNode);
	});
	
	$(window).mouseup(function(evt) {
		if (selectedNode !== -1) {
			selectedNode = -1;
			engine.deselect_node();
		}
	});
	
	$(canvas).mousemove(function(evt) {
		if (selectedNode !== -1) {
			var x = (evt.pageX - this.offsetLeft - (canvaswidth / 2)) * (width/canvaswidth);
			var y = -(evt.pageY - this.offsetTop - (canvasheight / 2)) * (height/canvasheight);
			engine.move_node(selectedNode, x, y);
		}
	});

	//Make some nodes here
	/*for (var i=0; i < 19; i++) {
		var x = Math.floor(Math.random() * width) - ((width / 2) - 1);
		var y = Math.floor(Math.random() * height) - ((height / 2) - 1);
		var n = {x: x, y: y, vx: 0.0, vy: 0.0, m: 1.0, c: "#555555"};
		nodes.push(n);
	}

	//Make some links here
	for (var i=1; i < 20; i++) {
		var link = {a: 0, b: i, c: "#000000"};
		links.push(link);
	}
	
	links.push({a: 1, b: 5, c: "#000000"});
	links.push({a: 4, b: 7, c: "#000000"});
	links.push({a: 3, b: 4, c: "#000000"});
	links.push({a: 5, b: 8, c: "#000000"});
	links.push({a: 4, b: 6, c: "#000000"});*/
	
	$.ajax({
			url: 'links.xqy',
			dataType: 'json',
			async: false,
			success: function(data) {
				for (var i = 0; i < data.length; i++) {
					var url = data[i]["url"];
					var loc = pick_random_location();
					nodes.push({x: loc[0],y: loc[1],vx: 0.0,vy: 0.0,m: 1.0, c: "#FFFFFF", data: url});
					var nodeid = nodes.length - 1;
					links.push({a: 0, b: nodeid, c: "#000000"});
					var users = data[i]["users"];
					for (var j = 0; j < users.length; j++) {
						var l2 = pick_random_location();
						nodes.push({x: l2[0],y: l2[1],vx: 0.0,vy: 0.0,m: 1.0, c: "#555555"});
						var newid = nodes.length - 1;
						links.push({a: nodeid, b: newid, c: "#000000"});
					}
				}
			}
});
	
	//Set up the engine with our universe parameters
	engine.init(graphconfig);
	engine.nodes = nodes;
	engine.links = links;
	//Set up the graphics engine with our canvas config
	graphics.init(canvasconfig);

	setInterval(update_graph, 20);
});