var elements = {};
var dynamicScaleMinCount = 5000;        // Min count for dynamic scale
var maxFontSizePercent = 2000;          // percent
var minOpacity = 0.1;                   // [0, 1]
var msTilFadeAway = 1000 * 60 * 60 * 3; // 3 hours in ms

var timeScalar = (1 - minOpacity) / msTilFadeAway; // % opacity per ms
var sizeScalar = (maxFontSizePercent - 100) / dynamicScaleMinCount;
function processRequests(requests) {
  var body = $('body');
  var totalRequests = Object.keys(requests).length;
  var index = 0;
  var maxCount = 0;
  $.each(requests, render);

  // dynamically compute a new sizeScalar such that the most seen entry is
  // assigned the maxFontSizePercent.
  // sizeScalar*maxCount + 100 = maxFontSizePercent
  sizeScalar = Math.min(2, (maxFontSizePercent - 100) / maxCount);

  function render(name, request) {
    if (request.count > maxCount) {
      maxCount = request.count;
    }

    var $div = elements[request.name];
    var top = 100 * index / totalRequests;

    if (!$div) {
      $div = create(request, index);
      $div.css('top', top + '%');

      $div.appendTo(body);

      elements[request.name] = $div;
      console.log(request.name, 'y', top);
    }

    update($div, request, top);

    index += 1;
  }

  function create(request) {
    var $div = $('<div>');
    $div.addClass('container')
      .addClass('drift-left')
      .attr('id', request.name);

    $div[0].addEventListener('animationiteration', function(e) {
      if (e.animationName === 'scroll-left') {
        $div.css('top', $div.data('top') + '%');
      }
    });

    return $div;
  }

  function update($div, request, top) {
    $div.css('font-size', Math.min(maxFontSizePercent, 100 + sizeScalar*request.count) + '%')
      .css('opacity', Math.max(minOpacity, 1 - ((Date.now() - request.lastSeen*1000) * timeScalar)))
      .text(request.name + ' ' + request.count + '/' + Object.keys(request.macs).length)
      .data('top', top);
  }
}

$(function() {

  //poll();
  test();

  function poll() {
    setInterval(function() {
        $.getJSON('http://192.168.11.99/probereq.json', processRequests);
    }, 1000);
  }

  function test() {
    var testRequests = {
      "ADM": {
        name: "ADM",
        lastSeen: 1506890491,
        count: 5000,
        macs: { 'mac1': 1, 'mac2': 2 },
        users: 300
      },
      "LAG": {
        name: "LAG",
        lastSeen: 1506885284,
        count: 50,
        macs: { 'mac1': 1, 'mac2': 2 },
        users: 12
      },
      "TechInc": {
        name: "TechInc",
        lastSeen: 1506882114,
        count: 100,
        macs : { "50:68:0a:03:94:3f" : 8 },
        users: 22
      },
      "Foo": {
        name: "Foo",
        lastSeen: 1506890491,
        count: 500,
        macs : { "50:68:0a:03:94:3f" : 8 },
        users: 30
      },
      "Bar": {
        name: "Bar",
        lastSeen: 1506885284,
        count: 50,
        macs : { "50:68:0a:03:94:3f" : 8 },
        users: 12
      },
      "Baz": {
        name: "Baz",
        lastSeen: 1506882114,
        count: 5,
        macs : { "50:68:0a:03:94:3f" : 8 },
        users: 2
      },
      "Bat": {
        name: "Bat",
        lastSeen: 100,
        count: 800,
        macs : { "50:68:0a:03:94:3f" : 8 },
        users: 2
      },
      "zero": {
        name: "zero",
        lastSeen: 0,
        count: 0,
        macs : { "50:68:0a:03:94:3f" : 8 },
        users: 0
      },
      "wolf" : {
          "count" : 5,
          "macs" : {
            "a4:d1:d2:7e:a7:a5" : 5
          },
          "name" : "wolf",
          "lastSeen" : 1506895762
      },
      "Dolhuis" : {
          "name" : "Dolhuis",
          "lastSeen" : 1506895962,
          "macs" : {
            "84:fc:fe:8e:ea:da" : 49,
            "84:a1:34:e5:24:a7" : 8,
            "00:0a:f5:2f:b2:1c" : 5
          },
          "count" : 62
      },
      "budapest" : {
          "macs" : {
            "50:68:0a:03:94:3f" : 8
          },
          "count" : 8,
          "lastSeen" : 1506895538,
          "name" : "budapest"
      },
      "UPC1920526" : {
          "count" : 1,
          "macs" : {
            "a4:77:33:ca:c4:b0" : 1
          },
          "lastSeen" : 1506895801,
          "name" : "UPC1920526"
      },
      "HG655D-86090D" : {
          "lastSeen" : 1506895796,
          "name" : "HG655D-86090D",
          "count" : 9,
          "macs" : {
            "00:27:10:61:7d:f4" : 9
          }
      },
      "@TOP-160-5G" : {
          "lastSeen" : 1506895801,
          "name" : "@TOP-160-5G",
          "count" : 4,
          "macs" : {
            "a4:77:33:ca:c4:b0" : 4
          }
      },
      "FdF 1992" : {
          "name" : "FdF 1992",
          "lastSeen" : 1506895527,
          "count" : 6,
          "macs" : {
            "a4:d1:d2:7e:a7:a5" : 6
          }
      }

    };
    var counter = 0;
    var names = Object.keys(testRequests);
    var requests = {};
    function increment(request) {
        request.lastSeen = Date.now();
        request.count += 1;
    }
    setInterval(function() {
        increment(testRequests.ADM);

        if (counter % 5 === 0) {
          increment(testRequests.LAG);
        }

        if (counter % 10 === 0) {
          increment(testRequests.TechInc);
        }

        var name = names[counter % names.length];
        requests[name] = testRequests[name];

        processRequests(requests);
        counter += 1;
    }, 1000);
  }

});
