onmessage = function(evt) {
	var nodes = evt.data;
	var newNodes = [];
		for (var i = 0; i < nodes.length; i++) {
			var currentNode = nodes[i];
			if (i == _selectedNode) {
				newNodes.push(currentNode);
				continue;
			}
			var net = [0, 0];
			
			for (var j = 0; j < nodes.length; j++) {
				if (i == j) { continue;	}
				net = vectoradd(net, coulomb(currentNode, nodes[j]));
			}
			
			for (var s = 0; s < currentNode["s"].length; s++) {
				net = vectoradd(net, hooke(currentNode, nodes[currentNode["s"][s]]));
			}

			// Calculate node velocity
			var newNode = $.extend(true, {}, currentNode);
			newNode["vx"] = (currentNode["vx"] + (_timeStep * net[0])) * _damping;
			newNode["vy"] = (currentNode["vy"] + (_timeStep * net[1])) * _damping;
			
			// Calculate node position
			newNode["x"] = currentNode["x"] + (_timeStep * newNode["vx"]);
			newNode["y"] = currentNode["y"] + (_timeStep * newNode["vy"]);
			
			newNodes.push(newNode);
		}
		//return newNodes;
		postMessage(newNodes);
};

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