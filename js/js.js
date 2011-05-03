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
	var graphconfig = {coulombConstant: 250000, damping: .02, springConstant: 2, theta: 1, timeStep: 1, width: width, height: height};
	var canvasconfig = {canvas: canvas, width: width, height: height};
	
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
	
	function load_json(data) {
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
	
	/*$.ajax({
			url: 'links.xqy',
			dataType: 'json',
			async: false,
			success: load_json
	});*/
	
	var json = '[{"url": "http://bit.ly/gckpQj", "users": ["Rona441", "Mathilde667"]}, {"url": "http://su.pr/1OSbEv", "users": ["ramblingepicure", "MeetaWFLH", "ockstyle"]}, {"url": "http://4sq.com/hITFR7", "users": ["bradyfrady", "Kochloffel_TR"]}, {"url": "http://bit.ly/e3PwnZ", "users": ["NewsBing", "NewLadyGagaHere"]}, {"url": "http://bit.ly/gfItCs", "users": ["Reeseqwdn23219", "oapfKevin27801"]}, {"url": "http://ow.ly/i/axdW", "users": ["samisgyros", "InnerSpaceAZ"]}, {"url": "http://bit.ly/ht4R1g", "users": ["NewsBing", "NewLadyGagaHere"]}, {"url": "http://plixi.com/p/93794226", "users": ["rossvinazaret", "AngelQuezadaI"]}, {"url": "http://plixi.com/p/93754750", "users": ["UVAMensLacrosse", "dolphinslaxer"]}, {"url": "http://yfrog.com/h2moafaj", "users": ["MissKerokbae", "yuki_endah", "naynaya"]}, {"url": "http://t.co/A6YxY40", "users": ["againstthedick", "MuscleSF"]}, {"url": "http://bit.ly/hGCSYK", "users": ["NewsBing", "NewLadyGagaHere"]}, {"url": "http://plixi.com/p/93780153", "users": ["LadyPink2525", "NiKKi_DaTcRaK"]}, {"url": "http://bit.ly/gTUZc4", "users": ["ihub_2UZ", "ihub_1UZ"]}, {"url": "http://t.co/ZLvy8DE", "users": ["lorencondron", "styadrma"]}, {"url": "http://amzn.to/hzCDmB", "users": ["Wurst_RT", "fleischwaren"]}, {"url": "http://tumblr.com/xwq26aez5p", "users": ["jbieber_ingrid", "justinbonelove"]}, {"url": "http://bit.ly/dUPnur", "users": ["BennyHollywood", "sexycelebstweet", "amyparsnews"]}, {"url": "http://bit.ly/eTubn8", "users": ["Britneyxxxxx", "brigetlaura"]}, {"url": "http://bit.ly/fMMoHT", "users": ["NewsBing", "NewLadyGagaHere"]}, {"url": "http://bit.ly/hksGL7", "users": ["CaleSomething", "vesper7"]}, {"url": "http://fb.me/VQysQSv3", "users": ["AJBombers", "alteredduck"]}, {"url": "http://tumblr.com/xmd26a3u9l", "users": ["Luuhzecchini", "leoo_g"]}, {"url": "http://tout.com/u/tomhallett/moments/4Hh8h9mhTSg", "users": ["ErikLindsley", "gregmc2555", "DarrenBarbera", "cstagg1239", "jsatcher1512", "AllanVizcaino", "kellycranor01", "mjock12582", "jamiecoloma01", "MathewRemer", "dailybarking", "NelsonHynd"]}, {"url": "http://tl.gd/9ua37q", "users": ["RAPnPRD_YNMVABP", "itskapboy"]}, {"url": "http://bit.ly/fm008x", "users": ["BennyHollywood", "sexycelebstweet"]}, {"url": "http://t.co/rhLEICO", "users": ["___Dagger___", "varek"]}, {"url": "http://amzn.to/gXuLne", "users": ["Wurst_RT", "fleischwaren"]}, {"url": "http://t.co/hXZ7GQZ", "users": ["MikeMDesign", "twotart"]}, {"url": "http://bit.ly/fSCear", "users": ["anitainindy", "mikeinindy"]}, {"url": "http://cot.ag/gNdi9C", "users": ["rockinsider", "goddess8008S"]}, {"url": "http://yfrog.com/h3yw1afj", "users": ["GotMilkATL", "xShannonE"]}, {"url": "http://t.co/PpT7cFE", "users": ["BBQAddictsJason", "Food_Newz"]}, {"url": "http://bit.ly/fBEy0k", "users": ["NewsBing", "NewLadyGagaHere"]}, {"url": "http://bit.ly/hJi9BB", "users": ["BennyHollywood", "sexycelebstweet", "tialpovi"]}, {"url": "http://twitpic.com/4mmuoa", "users": ["CSautter", "TommyRocket"]}]';
	load_json(eval(json));
	
	//Set up the engine with our universe parameters
	engine.init(graphconfig);
	engine.nodes = nodes;
	engine.links = links;
	//Set up the graphics engine with our canvas config
	graphics.init(canvasconfig);

	setInterval(update_graph, 16);
});