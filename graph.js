var vis = d3.select("#graph").append("svg");
var body = $('body');

vis.attr("width", "100%").attr("height", "100%");
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
  $.getJSON(url, function(requests) {
    var nodes = [];
    var links = [];
    $.each(requests, function(name, request){
      var newNode = request;
      newNode.x = Math.random()*body.outerWidth();
      newNode.y = Math.random()*body.outerHeight();
      $.each(request.macs, function(mac, count) {
        nodes.forEach(function(node) {
          if (node.macs[mac]) {
            links.push({ source: newNode, target: node });
          }
        });
      });
      nodes.push(newNode);
    });
    vis.selectAll(".line")
       .data(links)
          .enter()
          .append("line")
          .attr("x1", function(d) { return d.source.x })
          .attr("y1", function(d) { return d.source.y })
          .attr("x2", function(d) { return d.target.x })
          .attr("y2", function(d) { return d.target.y })
          .style("stroke", "rgb(6,120,155)");

/*
    var force = d3.layout.force()
        .nodes(nodes)
        .links([])
        .gravity(0.1)
        .charge(-1000)
        .size(["100%", "100%"]);
*/
    var node = vis.selectAll("circle.node")
          .data(nodes)
          .enter().append("g")
          .attr("class", "node")

          //.call(force.drag);

    //CIRCLE
    node.append("svg:circle")
      .attr("cx", function(d) { return d.x; })
      .attr("cy", function(d) { return d.y; })
      .attr("r", circleWidth)
      .attr("fill", function(d, i) { return  palette.pink; });

    //TEXT
    node.append("text")
      .text(                function(d, i) { return d.name; })
      .attr("x",            function(d, i) { return d.x + 10; })
      .attr("y",            function(d, i) { return d.y + 5; })
      .attr("fill",         function(d, i) {  return  palette.paleryellow;  })
      .attr("font-size",    function(d, i) {  return  "1em"; })
      .attr("font-family",  "Bree Serif")

  });
}

test('probereq-test.json');

