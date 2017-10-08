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
      .call(zoom);


var circleWidth = 5;
var rectWidth = 10;

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

var macs = {};
var ssids = {};
var simulation = d3.forceSimulation()
    .force("charge", d3.forceManyBody().strength(-25))
    .force("link", d3.forceLink().distance(100).strength(0.05))
    .force("center", d3.forceCenter())
    .force("gravity", d3.forceY(0).strength(0.01))
    .force("balance", d3.forceX(0).strength(0.01))
    .alphaDecay(0);

var nodes = simulation.nodes();
var links = simulation.force("link").links();

function test(url) {
  $.getJSON(url, function(requests) {
    $.each(requests, function(name, request){
      var ssid = ssids[request.name];
      if (!ssid) {
        ssid = {
          name: request.name,
          lastSeen: request.lastSeen,
          count: request.count,
          macs: []
        };
        nodes.push(ssid);
        ssids[ssid.name] = ssid;
        //ssid.y = 0;
        //ssid.y = 0.0001 * body.outerHeight() * (Date.now()/1000 - request.lastSeen)
      } else {
        // update stats
        ssid.lastSeen = request.lastSeen;
        ssid.count = request.count;
      }
      $.each(request.macs, function(address, count) {
        mac = macs[address];
        if (!mac) {
          mac = { address: address, count: count };
          nodes.push(mac);
          macs[address] = mac;
        } else {
          mac.count = count;
        }
        if (!ssid.macs[address]) {
          links.push({ source: mac, target: ssid });
        }
        ssid.macs[address] = count;
      });
    });

    var line = g.selectAll(".line")
       .data(links)
          .enter()
              .append("line")
                  .attr("x1", function(d) { return d.source.x })
                  .attr("y1", function(d) { return d.source.y })
                  .attr("x2", function(d) { return d.target.x })
                  .attr("y2", function(d) { return d.target.y })
                  .style("stroke", "rgb(6,120,155)");

    var mac = g.selectAll(".mac")
          .data(d3.values(macs))
          .enter().append("g")
          .attr("class", "node");
    var macInner = mac.attr("class", "mac").append("g")
          .attr("transform", "translate(-" + rectWidth/2 + ",-" + rectWidth/2 + ")");
    macInner.append("svg:rect")
          .attr("width", rectWidth + 2)
          .attr("height", rectWidth + 2)
          .attr("x", -1)
          .attr("y", -1)
          .attr("fill", palette.green)
    macInner.append("svg:polygon")
          .attr("points", function(d) {
            return [
              [0,0], [0,rectWidth], [rectWidth,0]
            ].map(function(p) { return p.toString(); }).join(' ');
          })
          .attr("fill", function(d, i) {
            var octets = d.address.split(':');
            var color = '#' + octets.slice(0,3).join('');
            return color;
          });
    macInner.append("svg:polygon")
          .attr("points", function(d) {
            return [
              [rectWidth,0], [rectWidth,rectWidth], [0, rectWidth]
            ].map(function(p) { return p.toString(); }).join(' ');
          })
          .attr("fill", function(d, i) {
            var octets = d.address.split(':');
            var color = '#' + octets.slice(3).join('');
            return color;
          });

    var ssid = g.selectAll("circle.ssid")
          .data(d3.values(ssids))
          .enter().append("g")
          .attr("class", "node")
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


    simulation.nodes(nodes);
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

