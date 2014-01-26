$(document).ready(function() {
      var sigRoot = document.getElementById('sig');
      var sigInst = sigma.init(sigRoot).drawingProperties({
        defaultLabelColor: '#ccc',
        font: 'Arial',
        edgeColor: 'source',
        defaultEdgeType: 'curve'
      }).graphProperties({
        minNodeSize: 1,
        maxNodeSize: 10
      });

      sigInst.addNode('hello',{
        label: 'Hello',
        color: '#ff0000',
        x: 1
      }).addNode('world',{
        label: 'World !',
        color: '#00ff00',
        x: 2
      });//.addEdge('hello_world','hello','world');
      sigInst.draw();
    });
