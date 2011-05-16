$(function() {
	var engine = Object.create(nodular.computePrototype);
	var graphics = Object.create(nodular.graphicsPrototype);
	var timeout = null;
	
	var quadtree;
	var nodes = [{x: 0.0,y: 0.0,vx: 0.0,vy: 0.0,m: 1.0, c: "#000000"}];
	var links = [];
	var forces = [];
	var interval = 20;
	var nodeRadius = 10;
	var selectedNode = -1;
	var width = 1000;
	var height = 500;
	var xscale = 1;
	var yscale = 1;
	var offsetx = 0;
	var offsety = 0;
	var previousLocation = null;
	var canvas = $('#canvas')[0];
	var canvaswidth = $(canvas).width();
	var canvasheight = $(canvas).height();
	var graphconfig = {coulombConstant: 250000, damping: .02, springConstant: 2, theta: 1, timeStep: 1, width: 100 * width, height: 100 * height};
	var canvasconfig = {canvas: canvas, width: width, height: height, canvaswidth: canvaswidth, canvasheight: canvasheight, xscale: xscale, yscale: yscale};
	
	function setup_controls() {
		function panCanvas(evt) {
			var offset = $(this).offset();
			var x = evt.pageX - offset.left;
			var y = evt.pageY - offset.top;
			var coords = graphics.getWorldCoords(x, y);
			graphics.pan(coords.x - previousLocation.x, coords.y - previousLocation.y);
			$('#links').html("x: " + graphics.offsetx + ", y: " + graphics.offsety);
			previousLocation = coords;
		}
	
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
		
		$(canvas).attr('width', width.toString());
		$(canvas).attr('height', height.toString());
		
		$(canvas).mousedown(function(evt) {
			evt.preventDefault();
			var offset = $(this).offset();
			var x = evt.pageX - offset.left;
			var y = evt.pageY - offset.top;
			var coords = graphics.getWorldCoords(x, y);
			previousLocation = coords;
			$('#links').html("x: " + coords.x + ", y: " + coords.y);
			selectedNode = engine.get_node_at_location(coords.x, coords.y);
			if (selectedNode == -1) {
				$(canvas).bind('mousemove', panCanvas);
				return;
			}
			var url = nodes[selectedNode]["data"];
			if (url) {
				$('#links').html('<a href="' + url + '" target="_blank">' + url + '</a>');
			}
			engine.select_node(selectedNode);
		});
		
		$(window).mouseup(function(evt) {
			$(canvas).unbind('mousemove', panCanvas);
			if (selectedNode !== -1) {
				selectedNode = -1;
				engine.deselect_node();
			}
		});
		
		$(canvas).mousemove(function(evt) {
			if (selectedNode !== -1) {
				var offset = $(this).offset();
				var x = evt.pageX - offset.left;
				var y = evt.pageY - offset.top;
				var coords = graphics.getWorldCoords(x, y);
				engine.move_node(selectedNode, coords.x, coords.y);
			}
		});
		
		$('#canvas').bind('mousewheel', function(evt, delta) {
			clearTimeout(timeout);
			var offset = $(this).offset();
			var x = evt.pageX - offset.left;
			var y = evt.pageY - offset.top;
			//var coords = graphics.getWorldCoords(x, y);
			if (delta > 0) {
				graphics.zoomIn(x, y);
			} else {
				graphics.zoomOut(x, y);
			}
			
			update_graph();
		});
		
		$('#loaddata').bind('click', function(evt) {
			$.ajax({
				cache: false,
				url: 'buildlinks.xqy?searches=osama|obama&minshares=3',
				dataType: 'json',
				success: function(data) {
					$('#logo').hide();
					clearTimeout(timeout);
					load_json(data);
					update_graph();
				}
			});
		});
	}
	
	function load_json_orig(data) {
		var usermap = {};
		for (var i = 0; i < data.length; i++) {
			var url = data[i]["url"];
			var loc = pick_random_location();
			nodes.push({x: loc[0],y: loc[1],vx: 0.0,vy: 0.0,m: 1.0, c: "#FFFFFF", data: url});
			var nodeid = nodes.length - 1;
			links.push({a: 0, b: nodeid, c: "#000000"});
			var users = data[i]["users"];
			for (var j = 0; j < users.length; j++) {
				if (!usermap[users[j]]) {
					usermap[users[j]] = [];
				}
				usermap[users[j]].push(nodeid);
			}
		}
		for (var key in usermap) {
			var urls = usermap[key];
			var l2 = pick_random_location();
			nodes.push({x: l2[0],y: l2[1],vx: 0.0,vy: 0.0,m: 1.0, c: "#555555"});
			var nodeid = nodes.length - 1;
			for (var i=0; i < urls.length; i++) {
				links.push({a: urls[i], b: nodeid, c: "#000000"});
			}
		}
		
		engine.nodes = nodes;
		engine.links = links;
	}
	
	function load_json(data) {
		nodes = [];
		links = [];
		var itemmap = {};
		var searches = data["nodes"]["searches"];
		var urls = data["nodes"]["urls"];
		var users = data["nodes"]["users"];
		var datalinks = data["links"];
		
		if (searches.constructor != Array) { searches = [searches]; }
		
		for (var i = 0; i < searches.length; i++) {
			var nodeid = nodes.length;
			var loc = pick_random_location();
			nodes.push({x: loc[0],y: loc[1],vx: 0.0,vy: 0.0,m: 1.0, c: "#000000", t: "search", data: searches[i]});
			itemmap[searches[i]] = nodeid;
		}
		
		for (var i = 0; i < urls.length; i++) {
			var nodeid = nodes.length;
			var loc = pick_random_location();
			nodes.push({x: loc[0],y: loc[1],vx: 0.0,vy: 0.0,m: 1.0, c: "#FFFFFF", t: "url", data: urls[i]});
			itemmap[urls[i]] = nodeid;
		}
		
		for (var i = 0; i < users.length; i++) {
			var nodeid = nodes.length;
			var loc = pick_random_location();
			nodes.push({x: loc[0],y: loc[1],vx: 0.0,vy: 0.0,m: 1.0, c: "#555555", t: "user", data: users[i]});
			itemmap[users[i]] = nodeid;
		}
		
		for (var key in datalinks) {
			for (var item in datalinks[key]) {
				links.push({a: itemmap[key], b: itemmap[datalinks[key][item]], c: "#000000"});
			}
		}
		engine.nodes = nodes;
		engine.links = links;
	}
	
	function update_graph() {
		timenow = (new Date()).getTime();
		engine.compute_graph();
		graphics.render(nodes, links);
		var wait = 17 - ((new Date()).getTime() - timenow);
		timeout = setTimeout(update_graph, wait);
	}
	
	function pick_random_location() {
		return [Math.floor(Math.random() * (width / xscale)) - ((width / 2) / xscale - 1), Math.floor(Math.random() * (height / yscale)) - ((height / 2) / yscale - 1)];
	}
	
	var timenow;

	setup_controls();

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
	
	//Set up the engine with our universe parameters
	engine.init(graphconfig);
	
	var that = this;
	
	/*engine.render = function() {
		graphics.render(nodes, links);
		var wait = 17 - ((new Date()).getTime() - timenow);
		timeout = setTimeout(update_graph, wait);
	}*/

	//Set up the graphics engine with our canvas config
	graphics.init(canvasconfig);
});