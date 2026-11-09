GraphDiff = {

        edgekey: function (edge) {
    var ids = [edge.v1.id, edge.v2.id];

    if (Graph.Edgetype.Symmetric[edge.directed]) {
        ids.sort();
    }

    return [ids[0], ids[1], edge.directed].join("\0");
    },
    compare: function (graph1, graph2) {
        var oldNodes = graph1.getVertexIDs();
        var newNodes = graph2.getVertexIDs();
        
        var oldEdges = _.map(graph1.getEdges(), GraphDiff.edgekey);
        var newEdges = _.map(graph2.getEdges(), GraphDiff.edgekey);
        return {
            added: _.difference(newNodes, oldNodes),
            removed: _.difference(oldNodes, newNodes),
            addedEdges: _.difference(newEdges, oldEdges),
            removedEdges: _.difference(oldEdges, newEdges)
        };
    }

}