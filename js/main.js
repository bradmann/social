$(function(){
	var canvas = $('#canvas')[0];
	var ctx = canvas.getContext('2d');
	
	var _nodes = [{"x": 0.0,"y": 0.0,"vx": 0.0,"vy": 0.0, "m": 1.0,"c": "#FFFFFF"}];
	var _links = [];
	
	for (var i=0; i < 20; i++) {
		var x = Math.floor(Math.random() * 1001) - 500;
		var y = Math.floor(Math.random() * 501) - 250;
		var n = {x: x, y: y, vx: 0.0, vy: 0.0, m: 1.0, c: "#555555"};
		_nodes.push(n);
	}
	
	for (var i=1; i < 20; i++) {
		_links.push({a: 0, b: i, c: '#000000'});
	}
	
	var _coulombConstant = 1000000;
	var _springConstant = .5;
	var _timeStep = 1;
	var _damping = .01;
	var _interval = 20;
	var _nodeRadius = 10;
	var _selectedNode = -1;
	$('#canvas').attr('width', '1000');
	$('#canvas').attr('height', '500');
	$('#speed').val(_timeStep * 10);
	$('#speed_val').html(_timeStep);
	$('#repulsion').val(_coulombConstant);
	$('#rep_val').html(_coulombConstant);
	$('#springs').val(_springConstant * 100);
	$('#spring_val').html(_springConstant);
	
	$('#canvas').bind('mousedown', function(e){
		e.preventDefault();
		e.stopPropagation();
		var x = e.pageX - this.offsetLeft - 500;
		var y = -(e.pageY - this.offsetTop -250);
		_selectedNode = get_selectedNode(x, y);
		console.log(_selectedNode);
	});
	
	$('#canvas').bind('mousemove', function(e){
		if (_selectedNode != -1) {
			var x = e.pageX - this.offsetLeft - 500;
			var y = -(e.pageY - this.offsetTop -250);
			
			_nodes[_selectedNode]["x"] = x;
			_nodes[_selectedNode]["y"] = y;
		}
	});
	
	$('#canvas').bind('mouseup', function(e){
		_selectedNode = -1;
	});
	
	$('#speed').change(function(e){
		_timeStep = this.value / 10;
		$('#speed_val').html(_timeStep);
	});
	
	$('#repulsion').change(function(e){
		_coulombConstant = this.value;
		$('#rep_val').html(_coulombConstant);
	});
	
	$('#springs').change(function(e){
		_springConstant = this.value / 100;
		$('#spring_val').html(_springConstant);
	});
	
	setInterval(render, _interval);
	
	function render() {
		ctx.clearRect(0, 0, 1000, 500);
		ctx.save()
		ctx.translate(500, 250);
		ctx.scale(1, -1);
		var total_kinectic = 0;
		
		_nodes = calculate();
		
		//var vel = Math.pow(nodes[i]["v"][0], 2) + Math.pow(nodes[i]["v"][1], 2);
		//total_kinetic = total_kinetic + (nodes[i]["m"] * vel);
		
		for (var i=0; i < _nodes.length; i++) {
			var node = _nodes[i];
			drawCircle(node["x"], node["y"], node["m"] * _nodeRadius, '#000000', node["c"]);
			
			//for (var j=0; j < node["s"].length; j++) {
			//	drawSpring(node, _nodes[node["s"][j]], 2);
			//}
		}
		ctx.restore();
	}
	
	function calculate() {
		var netForces = [];
		var newNodes = [];
		for (var i = 0; i < _nodes.length; i++) {
			var currentNode = _nodes[i];
			if (i == _selectedNode) {
				netForces.push([currentNode["vx"], currentNode["vy"]]);
				continue;
			}
			var net = [0, 0];
			
			for (var j = 0; j < _nodes.length; j++) {
				if (i == j) { continue;	}
				net = vectoradd(net, coulomb(currentNode, _nodes[j]));
			}
			
			netForces.push(net);
		}
		
		for (var i = 0; i < _links.length; i++) {
			var aidx = _links[i]["a"];
			var bidx = _links[i]["b"];
			var nodeA = _nodes[aidx];
			var nodeB = _nodes[bidx];
			
			netForces[aidx] = vectoradd(netForces[aidx], hooke(nodeA, nodeB));
			netForces[bidx] = vectoradd(netForces[bidx], hooke(nodeB, nodeA));
		}
		
		for (var i = 0; i < netForces.length; i++) {
			if (i == _selectedNode) { continue; };
			var net = netForces[i];
			var newNode = $.extend(true, {}, _nodes[i]);
			
			// Calculate node velocity
			newNode["vx"] = (newNode["vx"] + (_timeStep * net[0])) * _damping;
			newNode["vy"] = (newNode["vy"] + (_timeStep * net[1])) * _damping;
			
			// Calculate node position
			newNode["x"] = newNode["x"] + (_timeStep * newNode["vx"]);
			newNode["y"] = newNode["y"] + (_timeStep * newNode["vy"]);
			
			newNodes.push(newNode);
		}
		
		return newNodes;
	}
	
	function vectoradd(vec1, vec2) {
		var out = [];
		for (var i=0; i < vec1.length; i++) {
			out.push(vec1[i] + vec2[i]);
		}
		return out;
	}
	
	function coulomb(node1, node2) {
		var x = node1["x"] - node2["x"];
		var y = node1["y"] - node2["y"];
		var r = Math.sqrt(Math.pow(x, 2) + Math.pow(y, 2));
		
		var force = _coulombConstant * ((node1["m"] * node2["m"]) / Math.pow(r, 2));
		
		return [(force * (x/r)), (force * (y/r))];
	}
	
	function hooke(node1, node2) {
		var x = node1["x"] - node2["x"];
		var y = node1["y"] - node2["y"];
		var d = Math.sqrt(Math.pow(x, 2) + Math.pow(y, 2));
		var force = -_springConstant * d;
		
		return [(force * (x/d)), (force * (y/d))];
	}
	
	function get_selectedNode(x, y) {
		for (var i=0; i < _nodes.length; i++) {
			var node = _nodes[i];
			
			if ((x < (node["x"] + (node["m"] * _nodeRadius))) && (x > (node["x"] - (node["m"] * _nodeRadius))) && (y < (node["y"] + (node["m"] * _nodeRadius))) && (y > (node["y"] - (node["m"] * _nodeRadius)))) {
				return i;
			}
		}
		return -1;
	}
	
	function drawCircle(x, y, radius, stroke, fill) {
		ctx.beginPath();
		ctx.arc(x, y, radius, 0, Math.PI * 2, false);
		ctx.strokeStyle = stroke;
		ctx.lineWidth = 3;
		ctx.fillStyle = fill;
		ctx.stroke();
		ctx.fill();
	}
	
	function drawSpring(n1, n2, weight) {
		ctx.lineWidth = weight;
		ctx.beginPath();
		ctx.moveTo(n1["x"], n1["y"]);
		ctx.lineTo(n2["x"], n2["y"]);
		ctx.closePath();
		ctx.stroke();
	}
});