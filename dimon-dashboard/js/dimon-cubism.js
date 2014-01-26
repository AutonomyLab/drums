$(document).ready(function() {
    var context = cubism.context()
      .serverDelay(5 * 1000)
      .step( 2 * 1e3 )   // 1 sec
      .size(1440);  // 1 * 960 = 4 hours

    var graphite = context.graphite("http://bluemax");
    var metrics = [];

    var redraw = function () {
        d3.select("body").selectAll(".axis")
            .data(["top", "bottom"])
            .enter().append("div")
                .attr("class", function(d) { return d + " axis"; })
                .each(function(d) { d3.select(this).call(context.axis().ticks(12).orient(d)); });

        d3.select("#pids").call(function(div) {
        // div.append("div")
        //     .attr("class", "axis")
        //     .call(context.axis().orient("top"));

        div.selectAll(".horizon")
            .data(metrics)
            .enter().append("div")
            .attr("class", "horizon")
            .call(
                context.horizon()
                .metric(function(d) {return d.d;})
                .height(30)
                .title(function(d) {return d.t;})
                .format(d3.format(".2f"))
                .extent(function (d) {return [d.min, d.max]})
            );

        div.append("div")
            .attr("class", "rule")
            .call(context.rule());
        });
    }

    var update_graph = function() {
        var host_regex = /dimon\.(.*?)\.host/i;
        var pid_regex = /dimon\.(.*?)\.pid\.(.*?)\./i;
        var socket_regex = /socket\.(.*?)\.topic\.(.*?)\.(from|to)\.(.*?)\./i;

        graphite.find("dimon.*.host", function(error, results) {
            for (r in results){
                m = results[r].match(host_regex);
                host = m[1];
                console.log("sum(" + results[r] + "host.cpu_percent.*)");
            }
        });

        graphite.find("dimon.*.pid.*", function(error, results) {
            for (r in results){
                m = results[r].match(pid_regex);
                parent_host = m[1];
                node_str = m[2];
                metric_str = results[r] + "get_cpu_percent";
                console.log(metric_str);
                metric = graphite.metric(metric_str);
                metric.on("change", function (start, stop){
                    if (typeof this.valueAt !== "undefined") {
                        p = this.valueAt(1439);
                        t = "cpu." + this.toString().match(pid_regex)[2];
                        if (p) {
                            console.log("adding " + this.toString());
                            metrics.push({"t": t, "d": this, "min": 0, "max": 100});
                            redraw();
                        } else {
                            console.log("removing" + this.toString());
                        }
                        this.on("change", null);
                    }
                });
                //setTimeout(metric.on("change"), 5);
            }
        });

        graphite.find("dimon.*.socket.*.topic.*.*.*", function(error, results) {
            for (r in results){
                m = results[r].match(socket_regex);

                metric_str = "derivative("+results[r] + "bytes)";
                //dimon.bluemax.socket.:rosout.topic.:rosout.from.kitt:58097:.get_cpu_percent
                console.log(metric_str);
                metric = graphite.metric(metric_str);
                metric.on("change", function (start, stop){
                    if (typeof this.valueAt !== "undefined") {
                        m = this.toString().match(socket_regex);
                        node1 = m[1];
                        node2 = m[4];
                        topic = m[2];
                        title = "sock."+topic+"."+node1+"."+node2;
                        p = this.valueAt(1439);
                        if (p) {
                            console.log("adding " + this.toString());
                            metrics.push({"t": title, "d": this, "min": 0, "max": 20000});
                            redraw();
                        } else {
                            //console.log("removing" + this.toString());
                        }
                        this.on("change", null);
                    }
                });
            }
        });
    }

    update_graph();

    console.log("Dimon World!");
});
