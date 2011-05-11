nodes = [];
forces = [];
quadtree = {};
theta = null;
coulombConstant = null;

onmessage = function(evt) {
	nodes = evt.data["nodes"];
	forces = evt.data["forces"];
	quadtree = evt.data["quadtree"];
	theta = evt.data["theta"];
	range = evt.data["range"];
	coulombConstant = evt.data["coulombConstant"];
	
	for (var i = range[0]; i < range[1]; i++) {
		forces[i] = [0,0];
		tree_force(i, quadtree);
	}
	
	postMessage({range: range, forces: forces});
	close();
};

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

function coulomb(node1, node2) {
	var x = node1["x"] - node2["x"];
	var y = node1["y"] - node2["y"];
	var r = Math.sqrt(Math.pow(x, 2) + Math.pow(y, 2));
	if (r == 0) {return [0,0];};
	
	var force = coulombConstant * ((node1["m"] * node2["m"]) / Math.pow(r, 2));
	
	return [(force * (x/r)), (force * (y/r))];
}