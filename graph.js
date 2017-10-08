var body = $('body');
var svg = d3.select("#graph").append("svg");
svg.attr("width", body.outerWidth()).attr("height", body.outerHeight());
var width = +svg.attr("width");
var height = +svg.attr("height");

var g = svg.append("g");
g.attr("transform", "translate(" + width/2 + "," + height/2 + ")");

var zoom = d3.zoom().on("zoom", function() {
  g.attr("transform", d3.event.transform);
});
svg.append("rect")
      .attr("width", width)
      .attr("height", height)
      .style("fill", "none")
      .style("pointer-events", "all")
      .call(zoom.scaleExtent([1 / 2, 4]));


var circleWidth = 5;

var fontFamily = 'Bree Serif',
    fontSizeHighlight = '1.5em',
    fontSizeNormal = '1em';

var palette = {
      "lightgray": "#819090",
      "gray": "#708284",
      "mediumgray": "#536870",
      "darkgray": "#475B62",

      "darkblue": "#0A2933",
      "darkerblue": "#042029",

      "paleryellow": "#FCF4DC",
      "paleyellow": "#EAE3CB",
      "yellow": "#A57706",
      "orange": "#BD3613",
      "red": "#D11C24",
      "pink": "#C61C6F",
      "purple": "#595AB7",
      "blue": "#2176C7",
      "green": "#259286",
      "yellowgreen": "#738A05"
  }


function test(url) {
  var macs = {};
  var ssids = {};
  var nodes = [];
  var links = [];
  $.getJSON(url, function(requests) {
    $.each(requests, function(name, request){
      var ssid = request;
      ssid.x = Math.random()*body.outerWidth();
      ssid.y = Math.random()*body.outerHeight();
      //ssid.y = 0;
      //ssid.y = 0.0001 * body.outerHeight() * (Date.now()/1000 - request.lastSeen)
      $.each(request.macs, function(address, count) {
        mac = macs[address];
        if (!mac) {
          mac = { address: address, count: count };
          macs[address] = mac;
          nodes.push(mac);
        }
        links.push({ source: mac, target: ssid });
      });
      nodes.push(ssid);
      ssids[ssid.name] = ssid;
    });

    var simulation = d3.forceSimulation()
        .nodes(nodes)
        .force("charge", d3.forceManyBody().strength(-15))
        .force("link", d3.forceLink(links).strength(0.05))
        .force("center", d3.forceCenter())
        //.force("gravity", d3.forceY(2000).strength(0.000001))
        .alphaDecay(0);

    var line = g.selectAll(".line")
       .data(links)
          .enter()
              .append("line")
                  .attr("x1", function(d) { return d.source.x })
                  .attr("y1", function(d) { return d.source.y })
                  .attr("x2", function(d) { return d.target.x })
                  .attr("y2", function(d) { return d.target.y })
                  .style("stroke", "rgb(6,120,155)");

    var mac = g.selectAll("circle.mac")
          .data(d3.values(macs))
          .enter().append("g")
          .attr("class", "mac")
          .append("svg:circle")
            .attr("cx", function(d) { return 0; })
            .attr("cy", function(d) { return 0; })
            .attr("r", circleWidth)
            .attr("fill", function(d, i) { return  palette.green; });

    var ssid = g.selectAll("circle.ssid")
          .data(d3.values(ssids))
          .enter().append("g")
          .attr("class", "ssid");

    //CIRCLE
    ssid.append("svg:circle")
      .attr("cx", function(d) { return 0; })
      .attr("cy", function(d) { return 0; })
      .attr("r", circleWidth)
      .attr("fill", function(d, i) { return  palette.pink; });

    //TEXT
    ssid.append("text")
      .text(                function(d, i) { return d.name; })
      .attr("x",            function(d, i) { return 10; })
      .attr("y",            function(d, i) { return  5; })
      .attr("fill",         function(d, i) {  return  palette.paleryellow;  })
      .attr("font-size",    function(d, i) {  return  "1em"; })
      .attr("font-family",  "Bree Serif")


    simulation.on("tick", function(e, alpha) {
       mac.attr("transform", function(d, i) {
            return "translate(" + d.x + "," + d.y + ")";
        });
       ssid.attr("transform", function(d, i) {
            return "translate(" + d.x + "," + d.y + ")";
        });

        line.attr("x1", function(d) { return d.source.x; })
            .attr("y1", function(d) { return d.source.y; })
            .attr("x2", function(d) { return d.target.x; })
            .attr("y2", function(d) { return d.target.y; })

    });

  });
}

test('probereq.json');

