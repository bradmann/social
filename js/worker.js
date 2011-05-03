onmessage = function(evt) {
	var engine = evt.data;
	engine.compute_graph();
	postMessage(engine);
};