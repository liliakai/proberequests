var maxElements = 100;
var dynamicScaleMinCount = 100;        // Min count for dynamic scale
var maxFontSizePercent = 2000;          // percent
var minOpacity = 0.1;                   // [0, 1]
var msTilFadeAway = 1000 * 60 * 60 * 3; // 3 hours in ms
var startTime = Date.now() / 1000;

var elements = {};
var data = {};
var timeScalar = (1 - minOpacity) / msTilFadeAway; // % opacity per ms
var sizeScalar = (maxFontSizePercent - 100) / dynamicScaleMinCount;
function processRequests(requests) {
  var body = $('body');
  var template = $('#template').html();
  var totalRequests = Object.keys(requests).length;

  console.log('processing', totalRequests, 'ssids');

  var maxCount = 0;
  var maxLastSeen = 0;
  var created = false;

  $.each(requests, render);
  startTime = maxLastSeen;

  var allNames = Object.keys(data);

  var recent = allNames.sort(function(a, b) {
    return data[a].lastSeen - data[b].lastSeen;
  }).slice(-1 * maxElements);

  $.each(elements, function(name, element) {
    if (recent.indexOf(name) < 0) {
      if (element.parent().length > 0) {
        element.remove();
      }
    } else {
      if (elements[name].parent().length === 0) {
        body.append(elements[name]);
      }
    }
  });

  // dynamically compute a new sizeScalar such that the most seen entry is
  // assigned the maxFontSizePercent.
  // sizeScalar*maxCount + 100 = maxFontSizePercent
  //sizeScalar = Math.min(1, (maxFontSizePercent - 100) / maxCount);

  function render(name, request) {
    if (request.lastSeen > maxLastSeen) {
      maxLastSeen = request.lastSeen;
    }
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
    var seconds = startTime - request.lastSeen;
    var maxTop = body.outerHeight() - $div.outerHeight();
    var decayTop = maxTop*Math.log2(seconds*0.05)/10;
    var top = Math.max(0, Math.min(maxTop, decayTop));
    var opacity = Math.max(minOpacity, 1 - ((startTime - request.lastSeen) * timeScalar));
    var fontSize = Math.min(maxFontSizePercent, 100 + sizeScalar*macList.length);

    var current = {
      fontSize: fontSize,
      opacity: opacity,
      top: top,
      count: request.count,
      users: macList.length,
      lastSeen: request.lastSeen,
    };

    var changed = false;
    var prev = data[request.name] || {};

    for (prop in current) {
      if (prev[prop] !== current[prop]) {
        changed = true;
      }
    }

    if (changed) {
      data[request.name] = current;
      $div.css({
        top: top + 'px',
        opacity: opacity
      });
      $div.find('.name').text(request.name).css('font-size', fontSize + '%');
      $div.find('.stats').text(
        request.count + '/' + macList.length
      );

      $div.find('.macs').html('');

      var $users = $div.find('.macs');
      macList.forEach(function(mac) {
        if ($users.find('.' + mac).length === 0) {
          $users.append(macToColor(mac));
        }
      });
    }
  }

  function macToColor(mac) {
    var $user = $('<div>').addClass('user').addClass(mac);
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

  //poll('probereq.json');
  test('probereq.json');

  function poll(url) {
    $.getJSON(url, function(data) {
      processRequests(data);
      setTimeout(poll.bind(null, url), 1000);
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

          processRequests(testRequests);
          setTimeout(run, 1000);
      };

      function increment(request) {
          request.lastSeen = Date.now() / 1000;
          request.count += 1;
          console.log('simulating probe request', request.name);
      }
    });
  }
});
