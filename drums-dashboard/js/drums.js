  $(document).ready(function() {
      var context = cubism.context()
      .serverDelay(1000)
      .step( 1 * 1000 )   // 1 minute
      .size(960);  // 1 * 960 = 4 hours
   
    var graphite = context.graphite("http://bluemax");
    var cpu = graphite.metric("sum(drums.bluemax.host.host.cpu_percent.*)")

      // var sigRoot = document.getElementById('sig');
      // var sigInst = sigma.init(sigRoot).drawingProperties({
      //   defaultLabelColor: '#ccc',
      //   font: 'Arial',
      //   edgeColor: 'source',
      //   defaultEdgeType: 'curve'
      // }).graphProperties({
      //   minNodeSize: 0.5,
      //  maxNodeSize: 5,
      //  minEdgeSize: 1,
      //  maxEdgeSize: 1,
      //  sideMargin: 50
      // });

      // sigInst.startForceAtlas2();

    var update_graph = function() {
      var host_regex = /drums\.(.*?)\.host/i;
      var pid_regex = /drums\.(.*?)\.pid\.(.*?)\./i;
      //socket.:listener_3983_1389124500051.topic.:chatter.from.bluemax:46660:.
      var socket_regex = /socket\.(.*?)\.topic\.(.*?)\.(from|to)\.(.*?)\./i;

      // var graphHasNode = function(id) {
      //   try {
      //     dummy = sigInst.getNodes(id);
      //     return true;
      //   } catch (TypeError) {
      //     return false
      //   }
      // }
      //graph.beginUpdate();

      graph = new myGraph("#svgdiv");
      var dummy = [];
      graphite.find("drums.*.host", function(error, results) {
        for (r in results){
          m = results[r].match(host_regex);
          host = m[1];
          graph.addNode(host);
          console.log("sum(" + results[r] + "host.cpu_percent.*)");
          dummy[r] = graphite.metric("sum(" + results[r] + "host.cpu_percent.*)")
          .on("change", function (start, end) {
            if (typeof this.valueAt !== "undefined") {
              p = this.valueAt(959);
              if (p) {
                m = this.toString().match(host_regex)[1];
                d3.selectAll("[id=Node"+m+"]")
                  .transition()
                  .attr("r", p * 0.25);
                console.log(m + ":" + p);
              }
            }
          });
          // if (!graphHasNode(host)) {
          //     sigInst.addNode(host, {color: 'red', label: host, x: r});
          //     console.log("added " + host);
          // }

          // if (sigInst.getNodes(results[r]) != 'undefined') {
          //   sigInst.addNode(results[r], {color: 'red', label: host, x: r});
          // }
          //sigInst.addEdge(r, results[r].match(host_regex)[1], results[r].match(host_regex)[1])
        }
        //console.log(results); // ["hosts.foo.cpu.0.", "hosts.bar.cpu.0.", etc.]

      });

      graphite.find("drums.*.pid.*", function(error, results) {
        for (r in results){
          //console.log(results[r].match(pid_regex)[2] + " @ " + results[r].match(pid_regex)[1]);
          m = results[r].match(pid_regex);
          parent_host = m[1];
          node = m[2];
          graph.addNode(node);
          graph.addLink(parent_host, node, '10');
          //graph.addNode(results[r].match(pid_regex)[2]);
          //graph.addNode(results[r].match(pid_regex)[1]);
          //console.log(node + "@" + parent_host);
          // if (!graphHasNode(node)) {
          //   sigInst.addNode(node, {color: 'green', label: node, x: r});
          //   sigInst.addEdge(host+":"+node, parent_host, node)
          // }
          // if (typeof(sigInst.graph.nodesIndex[results[r]]) != 'undefined') {
          //   sigInst.addNode(results[r], {color: 'green', label: node, x: r});
          //   //sigInst.addEdge(node, parent_host, node)
          // }
          //graph.addLink(results[r].match(pid_regex)[1], results[r].match(pid_regex)[2], '10')
        }
        //console.log(results); // ["hosts.foo.cpu.0.", "hosts.bar.cpu.0.", etc.]

      });

      graphite.find("drums.*.socket.*.topic.*.*.*", function(error, results) {
        for (r in results){
           m = results[r].match(socket_regex);
           node1 = m[1];
           node2 = m[4];
           //console.log(m);
           //console.log("from " + node1 + " to " + node2);
           //graph.addLink(node1);
           //graph.addLink(node2);
           //graph.addLink(node1, node2, '20');
          //console.log(results[r].match(socket_regex));
          //graph.addLink(results[r].match(socket_regex)[2], results[r].match(socket_regex)[4])
        }
        //console.log(results); // ["hosts.foo.cpu.0.", "hosts.bar.cpu.0.", etc.]
      });
      //graph.endUpdate();
      //console.log(sigInst);
      //sigInst.draw();
      //setTimeout(update_graph, 1000);
    }

    // cpu.on("change", function (start, end) {
    //       if (typeof this.valueAt !== "undefined") {
    //         console.log(this.valueAt(959));
    //       }
    // });

    update_graph();

  //   var horizon = context.horizon().metric(graphite.metric).height(100);
  //    
  //   var metrics = [
  //      'drums.bluemax.pid.:drumsros.get_cpu_percent',
  //     'drums.bluemax.latency.bluemax.avg'
  //   ]
  //    
  //   d3.select("#graphs").append("div")
  //       .attr("class", "axis")
  //       .call(context.axis().orient("top"));
  //    
  //   d3.select("#graphs").append("div")
  //       .attr("class", "rule")
  //       .call(context.rule());
  //    
  //   d3.select("#graphs").selectAll(".horizon")
  //       .data(metrics)
  //     .enter().append("div")
  //       .attr("class", "horizon")
  //       .call(horizon);

    // var poll = function (url){
    //   $.ajax({
    //     url: url,
    //     success: function(data){
    //       console.log(data)
    //     },
    //     dataType: "json",
    //     //complete: poll(url),
    //     timeout: 30000 });
    // }

    // poll("http://bluemax/render?target=drums.bluemax.pid.:drumsros.get_cpu_percent&from=-1s&format=json")


    // function g_poller(target_url, interval) {
    //   this.poll = function() {
    //     setTimeo$.ajax(this.ajax_options);
    //   };

    //   this.target_url = target_url;
    //   this.interval = interval;
    //   this.ajax_options = {
    //     url: this.target_url,
    //     success: function(data) {
    //       var n = new Date().getTime();
    //       var remaining = this.interval - (n - this.last_update);
    //       console.log(data)
    //       //console.log("sleeping for " + remaining);
    //       //while ( (new Date().getTime() - n) < remaining ) {;}
    //       this.last_update = new Date().getTime();
    //     },
    //     dataType: "json",
    //     complete: this.poll,
    //     timeout: this.interval,
    //     context: this,
    //     ifModified: true,
    //   };
    //   this.last_update = new Date();


    // };

    // g_poller.prototype.poll = function () {
    //   $.ajax(this.ajax_options);
    //     // url: //,
    //     // // success = function(data) {
    //     // //   console.log(data);
    //     // // },
    //     // // dataType: "json",
    //     // // complete: this.poll,
    //     // // timeout: this.interval
    //     // );
    // };

    // (function poll(){
    //   $.ajax({ url: "http://bluemax/render?target=drums.bluemax.pid.:drumsros.get_cpu_percent&from=-1s&format=json", success: function(data){
    //       //Update your dashboard gauge
    //        console.log(data);
    //   }, dataType: "json", complete: poll, timeout: 1000 });
    // })();
    console.log("here");
});


  //var renderer = Viva.Graph.View.renderer(graph);
  //renderer.run();
  //mani = new g_poller("http://bluemax/render?target=drums.bluemax.pid.:drumsros.get_cpu_percent&from=-1s&format=json", 1000)
  //mani.poll()
