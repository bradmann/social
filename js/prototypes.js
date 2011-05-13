(function(){
	nodular = {};
	nodular.graphicsPrototype = {
		ctx: null,
		canvas: null,
		nodeImages: {},
		width: 1000,
		height: 1000,
		xscale: 1,
		yscale: 1,
		offsetx: 0,
		offsety: 0,
		lineWidth: 1,
		strokeColor: '#000000',
		init: function(config) {
			this.canvas = config.canvas;
			this.memcanvas = this.canvas.cloneNode(false);
			this.width = config.width;
			this.height = config.height;
			this.xscale = config.xscale;
			this.yscale = config.yscale;
			this.offsetx = this.width / 2;
			this.offsety = -this.height / 2;
			this.memcanvas.width = this.width;
			this.memcanvas.height = this.height;
			this.ctx = this.canvas.getContext('2d');
			this.memctx = this.memcanvas.getContext('2d');
			this.memctx.save();
			this.memctx.scale(this.xscale, -this.yscale);
			this.memctx.translate(this.offsetx, this.offsety);
		},
		
		zoomIn: function(x, y) {
			this.memctx.restore();
			this.memctx.save();
			this.xscale = this.xscale * 2;
			this.yscale = this.yscale * 2;
			this.memctx.translate(this.width / 2, this.height / 2);
			this.memctx.scale(this.xscale, -this.yscale);
		},
		
		zoomOut: function(x, y) {
			this.memctx.restore();
			this.memctx.save();
			this.xscale = this.xscale / 2;
			this.yscale = this.yscale / 2;
			this.memctx.translate(this.width / 2, this.height / 2);
			this.memctx.scale(this.xscale, -this.yscale);
		},
		
		panTo: function(x, y) {
		
		},
		
		getWorldCoords: function(x, y) {
			return {x: (x - (this.width / 2)) / this.xscale, y: -(y - (this.height / 2)) / this.yscale};
		},

		render: function(nodes, links) {
			var nodeRadius = 5;
			var memcanvas = this.memcanvas;
			var memctx = this.memctx;
			var ctx = this.ctx;
			var width = this.width;
			var height = this.height
			var nodeImages = this.nodeImages;
			var lineWidth = this.lineWidth;
			var strokeColor = this.strokeColor;
			var xscale = this.xscale;
			var yscale = this.yscale;
			memctx.clearRect(-((width/xscale)), -((height/yscale)), width * 2/xscale, height *2/yscale);
			
			ctx.clearRect(0, 0, width, height);
			
			function createNodeCanvas(radius, linewidth, strokecolor, fill) {
				var canvas = document.createElement('canvas');
				canvas.setAttribute('width', (radius + linewidth) * 2);
				canvas.setAttribute('height', (radius + linewidth) * 2);
				var context = canvas.getContext('2d');
				context.beginPath();
				context.arc(radius + linewidth, radius + linewidth, radius, 0, Math.PI * 2, true);
				context.strokeStyle = strokecolor;
				context.lineWidth = linewidth;
				context.fillStyle = fill;
				context.fill();
				context.stroke();
				if (!nodeImages[radius]) {
					nodeImages[radius] = {};
					nodeImages[radius][fill] = {};
					nodeImages[radius][fill][linewidth] = canvas;
				} else if (!nodeImages[radius][fill]) {
					nodeImages[radius][fill] = {};
					nodeImages[radius][fill][linewidth] = canvas;
				} else {
					nodeImages[radius][fill][linewidth] = canvas;
				}
				return canvas;
			}
			
			function makeNode(radius, fillcolor) {
				if (nodeImages[radius] && nodeImages[radius][fillcolor]) {
					return nodeImages[radius][fillcolor];
				}
			
				if (!nodeImages[radius]) {
					nodeImages[radius] = {};
				}
				
				return nodeImages[radius][fillcolor] = createNodeCanvas(radius, lineWidth, strokeColor, fillcolor);
			}
			
			function drawNode(x, y, node) {
				x = parseInt(x - (node.width/2));
				y = parseInt(y - (node.height/2));
				memctx.drawImage(node, x, y);
			}
			
			function drawSpring(n1, n2) {
				memctx.moveTo(n1["x"], n1["y"]);
				memctx.lineTo(n2["x"], n2["y"]);
			}
			
			//memctx.save();
			memctx.lineWidth = 1;
			memctx.beginPath();
			for (var i=0; i < links.length; i++) {
				var link = links[i];
				drawSpring(nodes[link["a"]], nodes[link["b"]]);
			}
			memctx.closePath();
			memctx.stroke();
			//memctx.restore();
			
			var maxX = width / xscale;
			var maxY = height / yscale;
			for (var i=0; i < nodes.length; i++) {
				var node = nodes[i];
				if (node["x"] < maxX && node["x"] > -maxX && node["y"] < maxY && node["y"] > -maxY) {
					var radius = node["m"] * nodeRadius;
					var nodeImage = makeNode(radius, node["c"]);
					drawNode(node["x"], node["y"], nodeImage);
				}
			}
			
			ctx.drawImage(memcanvas, 0, 0);
		}
	}

	nodular.computePrototype = {
		theta: 1,
		coulombConstant: 1000000,
		springConstant: .5,
		timeStep: 1,
		damping: .02,
		selectedNode: -1,
		nodes: [],
		links: [],
		threads: [],
		thread_data: [],
		width: 1000,
		heigth: 1000,
		init: function(config) {
			this.coulombConstant = config.coulombConstant;
			this.damping = config.damping;
			this.springConstant = config.springConstant;
			this.theta = config.theta;
			this.timeStep = config.timeStep;
			this.width = config.width;
			this.height = config.height;
			this.nodeRadius = 10;
			
			/*var threadCount = 4;
			for (var i = 0; i < 4; i++) {
				this.threads[i] = new Worker('js/worker.js');
			}*/
		},
		select_node: function(idx) {
			this.selectedNode = idx;
		},
		deselect_node: function(){
			this.selectedNode = -1;
		},
		get_node_at_location: function(x, y) {
			var nodes = this.nodes;
			var nodeRadius = this.nodeRadius;
			for (var i=0; i < nodes.length; i++) {
				var node = nodes[i];
				
				if ((x < (node["x"] + (node["m"] * nodeRadius))) && (x > (node["x"] - (node["m"] * nodeRadius))) && (y < (node["y"] + (node["m"] * nodeRadius))) && (y > (node["y"] - (node["m"] * nodeRadius)))) {
					return i;
				}
			}
			return -1;
		},
		move_node: function(idx, x, y) {
			this.nodes[idx]["x"] = x;
			this.nodes[idx]["y"] = y;
		},
		compute_graph: function() {
			var nodes = this.nodes;
			var links = this.links;
			var forces = [];
			var theta = this.theta;
			var coulombConstant = this.coulombConstant;
			var springConstant = this.springConstant;
			var timeStep = this.timeStep;
			var damping = this.damping;
			var quadtree;
			var width = this.width;
			var height = this.height;
			
			function coulomb(node1, node2) {
				var x = node1["x"] - node2["x"];
				var y = node1["y"] - node2["y"];
				var r = Math.sqrt(Math.pow(x, 2) + Math.pow(y, 2));
				if (r == 0) {return [0,0];};
				
				var force = coulombConstant * ((node1["m"] * node2["m"]) / Math.pow(r, 2));
				
				return [(force * (x/r)), (force * (y/r))];
			}

			function hooke(node1, node2) {
				var x = node1["x"] - node2["x"];
				var y = node1["y"] - node2["y"];
				var d = Math.sqrt(Math.pow(x, 2) + Math.pow(y, 2));
				var force = - springConstant * d;
				
				return [(force * (x/d)), (force * (y/d))];
			}
		
			function quadtree_build() {
				quadtree = {x:0, y:0, w: width + 10, h: height + 10};
				for (var i = 0; i < nodes.length; i++) {
					quad_insert(nodes[i], quadtree);
				}
				
				prune(quadtree);
				compute_mass(quadtree);
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
					
					try {
						quad_insert(i, get_child(i, n));
					} catch (e) {
						alert("whoops!");
					}
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
				var particle = nodes[i];
				if (node["val"]) {
					var force = coulomb(particle, node["val"]);
					forces[i] = vector_add(forces[i], force);
				} else {
					var r = Math.sqrt(Math.pow((particle["x"] - node["cm"][0]), 2) + Math.pow((particle["y"] - node["cm"][1]), 2));
					var D = node["w"];
					if (D / r < theta) {
						var tmpnode = {x: node["cm"][0], y: node["cm"][1], m: node["m"]};
						var force = coulomb(particle, tmpnode);
						forces[i] = vector_add(forces[i], force);
					} else {
						if (node["a"]) { tree_force(i, node["a"]); }
						if (node["b"]) { tree_force(i, node["b"]); }
						if (node["c"]) { tree_force(i, node["c"]); }
						if (node["d"]) { tree_force(i, node["d"]); }
					}
				}
			}
			
			function thread_complete(evt) {
				threadCount -= 1;
				var id = evt.data["id"];
				self.thread_data[id] = evt.data["forces"];
				
				if (threadCount == 0) {
				
					forces = [];
					forces = forces.concat(self.thread_data[0], self.thread_data[1], self.thread_data[2], self.thread_data[3]);
				
					//Delete the quadtree
					delete quadtree;

					//Calculate the forces on each of the nodes from the springs
					for (var i=0; i < links.length; i++) {
						var link = links[i];
						var nodeA = link["a"];
						var nodeB = link["b"];
						if (nodeA !== this.selectedNode && nodes[nodeA]["t"] !== "search") {
							forces[nodeA] = vector_add(forces[nodeA], hooke(nodes[nodeA], nodes[nodeB]));
						}
						if (nodeB !== this.selectedNode && nodes[nodeB]["t"] !== "search") {
							forces[nodeB] = vector_add(forces[nodeB], hooke(nodes[nodeB], nodes[nodeA]));
						}
					}

					//Use the forces to calculate the velocity/position of the nodes
					for (var i=0; i < nodes.length; i++) {
						var node = nodes[i];
						var net = forces[i];
						// Calculate node velocity
						node["vx"] = (node["vx"] + (timeStep * net[0])) * damping;
						node["vy"] = (node["vy"] + (timeStep * net[1])) * damping;
						
						// Calculate node position
						node["x"] = node["x"] + (timeStep * node["vx"]);
						if (node["x"] > width / 2) {node["x"] = width / 2;}
						if (node["x"] < -(width / 2)) {node["x"] = -(width / 2);}
						
						node["y"] = node["y"] + (timeStep * node["vy"]);
						if (node["y"] > height / 2) {node["y"] = height / 2;}
						if (node["y"] < -(height / 2)) {node["y"] = -(height / 2);}
					}
					
					self.render();
				}
			}
			
			//Build the quadtree
			quadtree_build();
			/*var self = this;
			var count = Math.ceil(nodes.length / 4);
			var threadCount = 4;
			for (var i = 0; i < 4; i++) {
				var min = count * i;
				var max = (i < 3) ? (count * i)  + count : nodes.length;
				var thread = this.threads[i];
				thread.postMessage({nodes: nodes, range: [min, max], forces: forces, quadtree: quadtree, theta: theta, coulombConstant: coulombConstant, id: i});
				thread.onmessage = thread_complete;
			}*/
			
			
			
			//Loop through the nodes and compute the force on each node
			for (var i=0; i < nodes.length; i++) {
				forces[i] = [0,0];
				if (i == this.selectedNode || nodes[i]["t"] == "search") {continue; };
				tree_force(i, quadtree);
			}
			
			//Delete the quadtree
			delete quadtree;

			//Calculate the forces on each of the nodes from the springs
			for (var i=0; i < links.length; i++) {
				var link = links[i];
				var nodeA = link["a"];
				var nodeB = link["b"];
				if (nodeA !== this.selectedNode && nodes[nodeA]["t"] !== "search") {
					forces[nodeA] = vector_add(forces[nodeA], hooke(nodes[nodeA], nodes[nodeB]));
				}
				if (nodeB !== this.selectedNode && nodes[nodeB]["t"] !== "search") {
					forces[nodeB] = vector_add(forces[nodeB], hooke(nodes[nodeB], nodes[nodeA]));
				}
			}

			var maxX = width / 2;
			var maxY = height / 2;
			//Use the forces to calculate the velocity/position of the nodes
			for (var i=0; i < nodes.length; i++) {
				var node = nodes[i];
				var net = forces[i];
				// Calculate node velocity
				node["vx"] = (node["vx"] + (timeStep * net[0])) * damping;
				node["vy"] = (node["vy"] + (timeStep * net[1])) * damping;
				
				// Calculate node position
				node["x"] = node["x"] + (timeStep * node["vx"]);
				if (node["x"] > maxX || node["x"] < -maxX) {
					this.width = Math.abs(node["x"]) * 2;
				}
				//if (node["x"] > width / 2) {node["x"] = width / 2;}
				//if (node["x"] < -(width / 2)) {node["x"] = -(width / 2);}
				
				node["y"] = node["y"] + (timeStep * node["vy"]);
				if (node["y"] > maxY || node["y"] < -maxY) {
					this.height = Math.abs(node["y"]) * 2;
				}
				//if (node["y"] > height / 2) {node["y"] = height / 2;}
				//if (node["y"] < -(height / 2)) {node["y"] = -(height / 2);}
			}
		}
	}
})();