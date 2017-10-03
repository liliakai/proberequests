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
  var created = false;
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
      if (!created) {
        created = true;
        $div = create(request);
        elements[request.name] = $div;
      }
    }
  }

  function create(request) {
    var $div = $(template).appendTo(body);
    update($div, request);
    return $div;
  }

  function update($div, request) {
    var macList = Object.keys(request.macs).sort();
    var seconds = Date.now()/1000 - request.lastSeen;
    var maxTop = $div.parent().outerHeight() - $div.outerHeight();
    var decayTop = maxTop*Math.log2(seconds*0.05)/10;
    var top = Math.max(0, Math.min(maxTop, decayTop));
    var opacity = Math.max(minOpacity, 1 - ((Date.now() - request.lastSeen*1000) * timeScalar));
    var fontSize = Math.min(maxFontSizePercent, 100 + sizeScalar*request.count);
    $div.css('top', top + 'px').css('opacity', opacity);
    $div.find('.name').text(request.name).css('font-size', fontSize + '%');
    $div.find('.stats').text(request.count + '/' + macList.length);

    $div.find('.macs').html('');
    macList.forEach(function(mac) {
      $div.find('.macs').append(macToColor(mac));
    });

    /*
    console.log(
      $div.text(),
      $div.css('font-size'),
      $div.css('top'),
      $div.css('opacity')
    );
    */
  }

  function macToColor(mac) {
    var $user = $('<div>');
    var octets = mac.split(':');
    var color = '#' + octets.splice(0,3).join('');
    $user.append(createColorSpan(color));
    var color = '#' + octets.splice(0,3).join('');
    $user.append(createColorSpan(color));
    return $user;
  }

  function createColorSpan(color) {
      var $span = $('<span class="color">').css('background-color', color);
      return $span;
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
        "macs" : {
          "84:fc:fe:8e:ea:da" : 49,
          "84:a1:34:e5:24:a7" : 8,
        },
      },
      "AndroidAP" : {
          "lastSeen" : 1507065161,
          "name" : "AndroidAP",
          "count" : 81,
          "macs" : {
            "10:0b:a9:73:38:00" : 81
          }
      },
      "FRITZ!Box7312 " : {
          "macs" : {
            "30:a8:db:1a:f9:68" : 7
          },
          "lastSeen" : 1507064946,
          "name" : "FRITZ!Box7312 ",
          "count" : 7
      },
      "iNEO.net-2Ghz" : {
          "lastSeen" : 1507065019,
          "name" : "iNEO.net-2Ghz",
          "count" : 3,
          "macs" : {
            "64:a7:69:9f:78:b0" : 3
          }
      },
      "verea" : {
          "lastSeen" : 1507062131,
          "count" : 6,
          "name" : "verea",
          "macs" : {
            "00:40:9d:67:55:37" : 6
          }
      },
      "BBS" : {
          "macs" : {
            "78:9f:70:7a:2e:d0" : 15,
            "bc:75:74:39:e8:b2" : 1153,
            "b0:ec:71:1a:39:4f" : 9
          },
          "name" : "BBS",
          "count" : 1177,
          "lastSeen" : 1507065247
      },
      "yoyo guest" : {
          "lastSeen" : 1507064722,
          "count" : 29,
          "name" : "yoyo guest",
          "macs" : {
            "da:a1:19:71:f3:a6" : 1,
            "da:a1:19:e1:52:10" : 2,
            "da:a1:19:9d:f2:0f" : 3,
            "da:a1:19:00:7d:ad" : 1,
            "da:a1:19:0e:84:37" : 1,
            "da:a1:19:91:f7:d5" : 3,
            "da:a1:19:50:c5:e2" : 1,
            "da:a1:19:db:ff:ba" : 5,
            "da:a1:19:42:14:72" : 1,
            "da:a1:19:ec:16:aa" : 1,
            "da:a1:19:18:06:22" : 1,
            "da:a1:19:02:15:24" : 1,
            "da:a1:19:db:0c:15" : 1,
            "da:a1:19:a6:c0:da" : 1,
            "da:a1:19:81:86:26" : 3,
            "da:a1:19:b3:07:c9" : 3
          }
      },
      "H369AB20C10" : {
          "name" : "H369AB20C10",
          "count" : 12,
          "lastSeen" : 1507061380,
          "macs" : {
            "24:92:0e:70:9d:ac" : 9,
            "b4:6d:83:ab:bc:24" : 3
          }
      },
      "iNEO.net-5Ghz" : {
          "name" : "iNEO.net-5Ghz",
          "count" : 43,
          "lastSeen" : 1507065026,
          "macs" : {
            "00:26:c6:26:21:96" : 22,
            "c0:bd:d1:b6:d7:e1" : 21
          }
      },
      "SitecomBE6B48" : {
          "count" : 32,
          "name" : "SitecomBE6B48",
          "lastSeen" : 1507064694,
          "macs" : {
            "18:2a:7b:54:ec:10" : 9,
            "88:83:22:99:8f:b6" : 14,
            "64:6c:b2:a9:42:71" : 9
          }
      },
      "Sitecom26F35E" : {
          "name" : "Sitecom26F35E",
          "count" : 2,
          "lastSeen" : 1507061831,
          "macs" : {
            "54:60:09:55:18:72" : 2
          }
      },
      "FRITZ!Box Fon WLAN 7360" : {
          "count" : 2,
          "name" : "FRITZ!Box Fon WLAN 7360",
          "lastSeen" : 1507060040,
          "macs" : {
            "00:23:14:1a:b4:e0" : 2
          }
      },
      "BBS-guest" : {
          "macs" : {
            "cc:61:e5:44:2c:dd" : 12,
            "f0:5b:7b:45:c4:83" : 5
          },
          "name" : "BBS-guest",
          "count" : 17,
          "lastSeen" : 1507064888
      },
      "UPC245312527" : {
          "name" : "UPC245312527",
          "count" : 46,
          "lastSeen" : 1507060825,
          "macs" : {
            "e0:9d:31:81:0a:60" : 46
          }
      },
      "SpeedTouch49B1E7" : {
          "name" : "SpeedTouch49B1E7",
          "count" : 1,
          "lastSeen" : 1507059638,
          "macs" : {
            "00:23:14:1a:b4:e0" : 1
          }
      },
      "LAG": {
        name: "LAG",
        lastSeen: 1506885284,
        count: 50,
        "macs" : {
          "84:fc:fe:8e:ea:da" : 49,
        },
      },
      "TechInc": {
        name: "TechInc",
        lastSeen: 1506882114,
        count: 100,
        macs : { "50:68:0a:03:94:3f" : 8 },
      },
      "Foo": {
        name: "Foo",
        lastSeen: 1506890491,
        count: 500,
        macs : { "50:68:0a:03:94:3f" : 8 },
      },
      "Bar": {
        name: "Bar",
        lastSeen: 1506885284,
        count: 50,
        macs : { "50:68:0a:03:94:3f" : 8 },
      },
      "Baz": {
        name: "Baz",
        lastSeen: 1506882114,
        count: 5,
        macs : { "50:68:0a:03:94:3f" : 8 },
      },
      "Bat": {
        name: "Bat",
        lastSeen: Date.now()/1000,
        count: 800,
        macs : { "50:68:0a:03:94:3f" : 8 },
      },
      "zero": {
        name: "zero",
        lastSeen: Date.now()/1000 - 5000,
        count: 0,
        macs : { "50:68:0a:03:94:3f" : 8 },
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
