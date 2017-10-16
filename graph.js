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
};

var body = $('body');
var width = body.outerWidth();
var height = body.outerHeight();

var svg = d3.select("#graph").append("svg")
    .attr("width", width)
    .attr("height", height);
var g = svg.append("g");

var zoom = d3.zoom().on("zoom", function() {
  g.attr("transform", d3.event.transform);
});
svg.call(zoom)
   .call(zoom.transform, d3.zoomIdentity.translate(width/2, height/2));

var macs = {};
var ssids = {};
var simulation = d3.forceSimulation()
    .force("charge", d3.forceManyBody().strength(-25))
    .force("link", d3.forceLink().distance(100).strength(0.05))
    .force("center", d3.forceCenter())
    .force("gravity", d3.forceY(0).strength(0.01))
    .force("balance", d3.forceX(0).strength(0.01))
    .alphaDecay(0);

var drag = d3.drag().on("drag", function dragmove(d, i) {
  d.fx = d3.event.x;
  d.fy = d3.event.y;
}).on("start", function() {
  console.log('drag start');
}).on("end", function(d, i) {
  console.log('drag end');
  d.fx = null;
  d.fy = null;
});

var maxAdded = 0;
var maxLastSeen = 0;
function handleJSON(json) {
  var nodes = simulation.nodes();
  var links = simulation.force("link").links();
  var added = 0;

  $.each(json, function(name, request){
    if (maxAdded && added > maxAdded) {
      return false;
    }
    var ssid = ssids[request.name];
    if (!ssid) {
      added++;
      console.log('adding ssid', request.name);
      ssid = {
        name: request.name,
        lastSeen: request.lastSeen,
        count: request.count,
        macs: {},
        changed: true,
        addedAt: Date.now()
      };
      nodes.push(ssid);
      ssids[ssid.name] = ssid;
    } else {
      if (ssid.lastSeen !== request.lastSeen
          || ssid.count !== request.count ) {
        ssid.changed = true;
      }

      // update stats
      ssid.lastSeen = request.lastSeen;
      ssid.count = request.count;

      if (ssid.lastSeen > maxLastSeen) {
        maxLastSeen = ssid.lastSeen
      }

    }
    $.each(request.macs, function(address, count) {
      var mac = macs[address];
      if (!mac) {
        console.log('adding mac', address);
        mac = {
          address: address,
          count: count,
          changed: true
        };
        nodes.push(mac);
        macs[address] = mac;
        ssid.changed = true;
      } else {
        if (mac.count !== count) {
          mac.changed = true;
        }
        mac.count = count;
      }
      if (!ssid.macs[address]) {
        console.log('adding link', mac.address, ssid.name);
        links.push({ source: mac, target: ssid, addedAt: Date.now() });
      }
      ssid.macs[address] = count;
    });
    ssid.numMacs = d3.keys(ssid.macs).length;
  });
  simulation.nodes(nodes);
  simulation.force("link").links(links);

  var line = g.selectAll(".line").data(links);
  var lineEnter = line.enter().append("line").attr("class", "line")
    .attr("x1", function(d) { return d.source.x })
    .attr("y1", function(d) { return d.source.y })
    .attr("x2", function(d) { return d.target.x })
    .attr("y2", function(d) { return d.target.y })
    .style("stroke", "rgb(6,120,155)");

  var mac = g.selectAll(".mac").data(d3.values(macs));
  var macEnter = mac.enter().append("g").attr("class", "mac");
  var macInner = macEnter.append("g").attr("transform", "translate(-" + rectWidth/2 + ",-" + rectWidth/2 + ")");
  macInner.append("svg:rect")
    .attr("width", rectWidth + 2)
    .attr("height", rectWidth + 2)
    .attr("x", -1)
    .attr("y", -1)
    .attr("fill", "#666666")
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

  var ssid = g.selectAll(".ssid").data(d3.values(ssids));
  var ssidEnter = ssid.enter().append("g").attr("class", "ssid");
  //CIRCLE
  ssidEnter.append("svg:circle")
    .attr("cx", function(d) { return 0; })
    .attr("cy", function(d) { return 0; })
    .attr("r", function(d) { return circleWidth; })
    .attr("fill", function(d, i) { return  palette.pink; });
  //TEXT
  ssidEnter.append("text")
    .text(                function(d, i) { return d.name; })
    .attr("x",            function(d, i) { return 10; })
    .attr("y",            function(d, i) { return 5; })
    .attr("fill",         function(d, i) { return palette.paleryellow; })
    .attr("font-size",    function(d, i) { return  (1 + 0.1*(d.numMacs)) + 'em'; })
    .attr("font-family",  "monospace");

  ssid.select("text")
    .attr("opacity", function(d) {
      return Math.max(0.5, 1 - (Date.now()/1000 - d.lastSeen) * 0.00001);
    });

  mac = macEnter.merge(mac);
  ssid = ssidEnter.merge(ssid);
  line = lineEnter.merge(line);

  mac.call(drag);
  ssid.call(drag);

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
}

$('body').keydown(function(e) {
  if (e.which === 37) { // left arrow
    svg.transition().call(zoom.translateBy, 100, 0);
  }
  if (e.which === 39) { // right arrow
    svg.transition().call(zoom.translateBy, -100, 0);
  }
  if (e.which === 38) { // up arrow
    svg.transition().call(zoom.translateBy, 0, 100);
  }
  if (e.which === 40) { // down arrow
    svg.transition().call(zoom.translateBy, 0, -100);
  }
});

//poll('probereq.json');
poll('probereq-test.json');

function poll(url) {
  $.getJSON(url, function(json) {
    handleJSON(json);
    setTimeout(function() { poll(url); }, 2000);
  });
}

function test(url) {
  $.getJSON(url, function(testRequests) {
    var names = Object.keys(testRequests);
    run();

    function run() {
        if (Math.random() < 0.1) {
          var randomName = names[Math.floor(Math.random() * names.length/2)];
          increment(testRequests[randomName]);
        }

        handleJSON(testRequests);
        setTimeout(run, 1000);
    };

    function increment(request) {
        request.lastSeen = Date.now() / 1000;
        request.count += 1;
        console.log('simulating probe request', request.name);
    }
  });
}
