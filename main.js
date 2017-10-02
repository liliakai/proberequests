var elements = {};
var dynamicScaleMinCount = 5000;        // Min count for dynamic scale
var maxFontSizePercent = 2000;          // percent
var minOpacity = 0.1;                   // [0, 1]
var msTilFadeAway = 1000 * 60 * 60 * 3; // 3 hours in ms

var timeScalar = (1 - minOpacity) / msTilFadeAway; // % opacity per ms
var sizeScalar = (maxFontSizePercent - 100) / dynamicScaleMinCount;
function processRequests(requests) {
  var body = $('body');
  var template = $('#template').html();
  var totalRequests = Object.keys(requests).length;
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

    if ($div) {
      update($div, request);
    } else {
      $div = create(request);
      elements[request.name] = $div;
    }
  }

  function create(request) {
    var $div = $(template).appendTo(body);
    update($div, request);
    return $div;
  }

  function update($div, request) {
    var seconds = Date.now()/1000 - request.lastSeen;
    var maxTop = $div.parent().outerHeight() - $div.outerHeight();
    var decayTop = maxTop*Math.log2(seconds*0.05)/10;
    var top = Math.max(0, Math.min(maxTop, decayTop));
    var opacity = Math.max(minOpacity, 1 - ((Date.now() - request.lastSeen*1000) * timeScalar));
    var fontSize = Math.min(maxFontSizePercent, 100 + sizeScalar*request.count);
    $div.css('top', top + 'px').css('opacity', opacity);
    $div.find('.name').text(request.name).css('font-size', fontSize + '%');
    $div.find('.stats').text(request.count + '/' + Object.keys(request.macs).length);

    console.log(
      $div.text(),
      $div.css('font-size'),
      $div.css('top'),
      $div.css('opacity')
    );
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
        lastSeen: Date.now()/1000,
        count: 800,
        macs : { "50:68:0a:03:94:3f" : 8 },
        users: 2
      },
      "zero": {
        name: "zero",
        lastSeen: Date.now()/1000 - 5000,
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
          lastSeen: Date.now()/1000 - 250,
      },
      "Dolhuis" : {
          "name" : "Dolhuis",
          lastSeen: Date.now()/1000 - 500,
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
          lastSeen: Date.now()/1000 - 2000,
          "name" : "budapest"
      },
      "UPC1920526" : {
          "count" : 1,
          "macs" : {
            "a4:77:33:ca:c4:b0" : 1
          },
          lastSeen: Date.now()/1000 - 100000,
          "name" : "UPC1920526"
      },
      "HG655D-86090D" : {
          lastSeen: Date.now()/1000 - 10000,
          "name" : "HG655D-86090D",
          "count" : 9,
          "macs" : {
            "00:27:10:61:7d:f4" : 9
          }
      },
      "@TOP-160-5G" : {
          lastSeen: Date.now()/1000 - 1000,
          "name" : "@TOP-160-5G",
          "count" : 4,
          "macs" : {
            "a4:77:33:ca:c4:b0" : 4
          }
      },
      "FdF 1992" : {
          "name" : "FdF 1992",
          lastSeen: Date.now()/1000 - 100,
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
        request.lastSeen = Date.now() / 1000;
        request.count += 1;
    }
    increment(testRequests[names[names.length - 1]]);
    setInterval(function() {
        if (Math.random() < 0.1) {
          increment(testRequests.ADM);
        }

/*
        if (Math.random() > 0.01) {
          increment(testRequests.TechInc);
        }

        if (Math.random() > 0.1) {
          increment(testRequests.LAG);
        }

*/
        if (Math.random() < 0.1) {
          var randomName = names[Math.floor(Math.random() * names.length/2)];
          increment(testRequests[randomName]);
        }

        var name = names[counter % names.length];
        requests[name] = testRequests[name];

        processRequests(requests);
        counter += 1;
    }, 1000);
  }

});
