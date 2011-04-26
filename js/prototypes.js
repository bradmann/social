_graphicsPrototype = {
	drawCircle: function(ctx, x, y, radius, stroke, fill) {
		ctx.beginPath();
		ctx.arc(x, y, radius, 0, Math.PI * 2, false);
		ctx.strokeStyle = stroke;
		ctx.lineWidth = 3;
		ctx.fillStyle = fill;
		ctx.stroke();
		ctx.fill();
	},

	drawSpring: function(ctx, n1, n2, weight) {
		ctx.lineWidth = weight;
		ctx.beginPath();
		ctx.moveTo(n1["x"], n1["y"]);
		ctx.lineTo(n2["x"], n2["y"]);
		ctx.closePath();
		ctx.stroke();
	},

	render: function(ctx) {
		var _nodes = this._nodes;
		var _links = this._links;
		var _nodeRadius = this._nodeRadius;
		ctx.clearRect(0, 0, 1000, 1000);
		ctx.save()
		ctx.translate(500, 500);
		ctx.scale(1, -1);
		var total_kinectic = 0;
		
		//_nodes = calculate();
		
		//var vel = Math.pow(nodes[i]["v"][0], 2) + Math.pow(nodes[i]["v"][1], 2);
		//total_kinetic = total_kinetic + (nodes[i]["m"] * vel);
		
		for (var i=0; i < _nodes.length; i++) {
			var node = _nodes[i];
			this.drawCircle(ctx, node["x"], node["y"], node["m"] * _nodeRadius, '#000000', node["c"]);
		}
		
		for (var i=0; i < _links.length; i++) {
			var link = _links[i];
			this.drawSpring(ctx, _nodes[link["a"]], _nodes[link["b"]], 1);
		}
		ctx.restore();
	}
}

_computePrototype = {
	_theta: 1,
	_coulombConstant: 1000000,
	_springConstant: .5,
	_timeStep: 1,
	_damping: .07,
	compute_graph: function() {
		var _nodes = this._nodes;
		var _links = this._links;
		var _forces = [];
		var _theta = this._theta;
		var _coulombConstant = this._coulombConstant;
		var _springConstant = this._springConstant;
		var _timeStep = this._timeStep;
		var _damping = this._damping;
		var quadtree;
		
		quadtree_build();

		for (var i=0; i < _nodes.length; i++) {
			_forces[i] = [0,0];
			tree_force(i, _quadtree);
		}
		
		delete _quadtree;

		for (var i=0; i < _links.length; i++) {
			var link = _links[i];
			var nodeA = link["a"];
			var nodeB = link["b"];
			_forces[nodeA] = vector_add(_forces[nodeA], hooke(_nodes[nodeA], _nodes[nodeB]));
			_forces[nodeB] = vector_add(_forces[nodeB], hooke(_nodes[nodeB], _nodes[nodeA]));
		}

		for (var i=0; i < _nodes.length; i++) {
			var node = _nodes[i];
			var net = _forces[i];
			// Calculate node velocity
			node["vx"] = (node["vx"] + (_timeStep * net[0])) * _damping;
			node["vy"] = (node["vy"] + (_timeStep * net[1])) * _damping;
			
			// Calculate node position
			node["x"] = node["x"] + (_timeStep * node["vx"]);
			node["y"] = node["y"] + (_timeStep * node["vy"]);
		}
		
		function coulomb(node1, node2) {
			var x = node1["x"] - node2["x"];
			var y = node1["y"] - node2["y"];
			var r = Math.sqrt(Math.pow(x, 2) + Math.pow(y, 2));
			if (r == 0) {return [0,0];};
			
			var force = _coulombConstant * ((node1["m"] * node2["m"]) / Math.pow(r, 2));
			
			return [(force * (x/r)), (force * (y/r))];
		}

		function hooke(node1, node2) {
			var x = node1["x"] - node2["x"];
			var y = node1["y"] - node2["y"];
			var d = Math.sqrt(Math.pow(x, 2) + Math.pow(y, 2));
			var force = - _springConstant * d;
			
			return [(force * (x/d)), (force * (y/d))];
		}
	
		function quadtree_build() {
			_quadtree = {x:0, y:0, w:10000, h:10000};
			for (var i = 0; i < _nodes.length; i++) {
				quad_insert(_nodes[i], _quadtree);
			}
			
			prune(_quadtree);
			compute_mass(_quadtree);
		}

		function prune(n) {
			if (n && n["a"]) {
				if (!n["a"]["a"] && !n["a"]["val"]) {
					delete n["a"];
				}
				if (!n["b"]["a"] && !n["b"]["val"]) {
					delete n["b"];
				}
				if (!n["c"]["a"] && !n["c"]["val"]) {
					delete n["c"];
				}
				if (!n["d"]["a"] && !n["d"]["val"]) {
					delete n["d"];
				}
				prune(n["a"]);
				prune(n["b"]);
				prune(n["c"]);
				prune(n["d"]);
			}
		}

		function quad_insert(i, n) {
			if (n["a"]) {
				quad_insert(i, get_child(i, n));
			} else if (n["val"]) {
				var newWidth = n["w"]/2;
				var newHeight = n["h"]/2;
				var offsetX = n["w"]/4;
				var offsetY = n["h"]/4;
				n["a"] = {x: (n["x"]-offsetX), y: (n["y"]+offsetY), w: newWidth, h: newHeight};
				n["b"] = {x: (n["x"]+offsetX), y: (n["y"]+offsetY), w: newWidth, h: newHeight};
				n["c"] = {x: (n["x"]-offsetX), y: (n["y"]-offsetY), w: newWidth, h: newHeight};
				n["d"] = {x: (n["x"]+offsetX), y: (n["y"]-offsetY), w: newWidth, h: newHeight};
				
				var node = n["val"];
				get_child(node, n)["val"] = node;
				
				delete n["val"];
				
				quad_insert(i, get_child(i, n));
			} else {
				n["val"] = i;
			}
		}

		function get_child(i, n) {
			var newWidth = n["w"]/2;
			var newHeight = n["h"]/2;
			var offsetX = n["w"]/4;
			var offsetY = n["h"]/4;
			
			if (i["x"] >= (n["a"]["x"] - offsetX) && i["x"] < (n["a"]["x"] + offsetX) && i["y"] >= (n["a"]["y"] - offsetY) && i["y"] < (n["a"]["y"] + offsetY)) {
				return n["a"];
			} else if (i["x"] >= (n["b"]["x"] - offsetX) && i["x"] < (n["b"]["x"] + offsetX) && i["y"] >= (n["b"]["y"] - offsetY) && i["y"] < (n["b"]["y"] + offsetY)) {
				return n["b"];
			} else if (i["x"] >= (n["c"]["x"] - offsetX) && i["x"] < (n["c"]["x"] + offsetX) && i["y"] >= (n["c"]["y"] - offsetY) && i["y"] < (n["c"]["y"] + offsetY)) {
				return n["c"];
			} else {
				return n["d"];
			}
		}

		function compute_mass(n) {
			if (n && n["val"]) {
				node = n["val"];
				n["m"] = node["m"];
				n["cm"] = [node["x"], node["y"]];
				return [n["m"], n["cm"]];
			} else if (n) {
				var amass = compute_mass(n["a"]);
				var bmass = compute_mass(n["b"]);
				var cmass = compute_mass(n["c"]);
				var dmass = compute_mass(n["d"]);
				
				var mass = amass[0] + bmass[0] + cmass[0] + dmass[0];
				var cm = vector_add([amass[0]*amass[1][0], amass[0]*amass[1][1]], [bmass[0]*bmass[1][0], bmass[0]*bmass[1][1]], [cmass[0]*cmass[1][0], cmass[0]*cmass[1][1]], [dmass[0]*dmass[1][0], dmass[0]*dmass[1][1]]);
				cm = [cm[0] / mass, cm[1] / mass];
				n["m"] = mass;
				n["cm"] = cm;
				return [mass, cm];
			} else {
				return [0, [0, 0]];
			}
		}

		function vector_add() {
			var vectorLength = arguments[0].length;
			var out = [];
			for (var i=0; i < vectorLength; i++) {
				var sum = 0;
				for (var j=0; j < arguments.length; j++) {
					sum += arguments[j][i];
				}
				out.push(sum);
			}
			return out;
		}

		function tree_force(i, node) {
			var particle = _nodes[i];
			if (node["val"]) {
				var force = coulomb(particle, node["val"]);
				_forces[i] = vector_add(_forces[i], force);
			} else {
				var r = Math.sqrt(Math.pow((particle["x"] - node["cm"][0]), 2) + Math.pow((particle["y"] - node["cm"][1]), 2));
				var D = node["w"];
				if (D / r < _theta) {
					var tmpnode = {x: node["cm"][0], y: node["cm"][1], m: node["m"]};
					var force = coulomb(particle, tmpnode);
					_forces[i] = vector_add(_forces[i], force);
				} else {
					if (node["a"]) { tree_force(i, node["a"]); }
					if (node["b"]) { tree_force(i, node["b"]); }
					if (node["c"]) { tree_force(i, node["c"]); }
					if (node["d"]) { tree_force(i, node["d"]); }
				}
			}
		}
	}
}