define("markline/0.6.0/timeline-debug", ["jquery/2.1.1/jquery-debug"], function(require, exports, module) {
  var $ = require("jquery/2.1.1/jquery-debug");
  var offset_left = 30; // offset left for group name.
  var offset_top = 20; // offset top for date header.
  var year_width = 100; // width per date (year).
  function Markline(element, data) {
    this._element = $(element);
    this.title = data.title || "";
    this.meta = data.meta || {};
    this.body = data.body || {};
  }
  // @param {Number} distance, two date distance milliseconds.
  // @return {Number} line width.
  function calcLength(distance) {
    return parseInt((distance / (24 * 60 * 60 * 1000)) * year_width / 365.24, 10);
  }

  function isFunction(object) {
    return Object.prototype.toString.call(object) === "[object Function]";
  }
  Markline.prototype._process = function(data, handlers) {
    if (!handlers) {
      return;
    }
    for (var group_name in data) {
      if (!data.hasOwnProperty(group_name)) {
        continue;
      }
      var lines = data[group_name];
      if (isFunction(handlers["group:start"])) {
        handlers["group:start"].call(this, group_name, lines);
      }
      for (var i = 0, l = lines.length; i < l; i++) {
        var line = lines[i];
        if (isFunction(handlers["line:start"])) {
          handlers["line:start"].call(this, line);
        }
        if (line.events) {
          for (var j = 0, m = line.events.length; j < m; j++) {
            if (isFunction(handlers["event"])) {
              handlers["event"].call(this, line.events[j]);
            }
          }
        }
        if (isFunction(handlers["line:stop"])) {
          handlers["line:stop"].call(this, line);
        }
      }
      if (isFunction(handlers["group:stop"])) {
        handlers["group:stop"].call(this, group_name, lines);
      }
    }
  }
  Markline.prototype.render = function() {
    var min_date;
    var max_date;
    this._process(this.body, {
      "line:start": function(line) {
        var date_start = line["date-start"];
        var date_end = line["date-end"];
        if (!min_date || date_start < min_date) {
          min_date = date_start;
        }
        if (!max_date || max_date < date_end) {
          max_date = date_end;
        }
      }
    });
    var first_year = min_date.getFullYear();
    var last_year = max_date.getFullYear() + 2;
    min_date = new Date(first_year, 0, 1);
    // HEAD: dates
    var head_dates = ['<div class="dates">', '<ol>'];
    for (var year = first_year, age = 0; year <= last_year; year++, age++) {
      head_dates.push('<li><label>', year, this.meta.age === "show" ? ' (' + age + ')' : '', '</label></li>')
    }
    head_dates.push('</ol>', '</div>');
    // BODY: events groups, and events.
    var body_events = ['<div class="events" id="events">'];
    var current_line_offset_left = 0;
    this._process(this.body, {
      "group:start": function(group_name) {
        body_events.push('<div class="groups">', '<label>', group_name, '</label>', '<ol>');
      },
      "group:stop": function() {
        body_events.push('</ol>', '</div>');
      },
      "line:start": function(line) {
        var date_start = line["date-start"];
        var date_end = line["date-end"];
        var line_start = calcLength(date_start - min_date) + offset_left;
        current_line_offset_left = date_start;
        var line_length = calcLength(date_end - date_start);
        if (line_length < 8) {
          line_length = 8;
          //line_start -= 4;
        }
        body_events.push('<li style="margin-left:', line_start, 'px;">', '<div>', '<ol style="width:', line_length, 'px;">');
      },
      "line:stop": function(line) {
        body_events.push('</ol>', '<time>', line["date"], '</time>', '<label>', line.name, '</label>', '</div>', '</li>');
      },
      "event": function(event) {
        var event_start = calcLength(event["date-start"] - current_line_offset_left);
        var event_width = calcLength(event["date-end"] - event["date-start"]);
        if (event_width < 8) {
          event_width = 8;
          event_start -= 4;
        }
        body_events.push('<li style="left:', event_start, 'px;width:', event_width, 'px" title="', event.date, ' ', event.name, '"></li>');
      }
    });
    var me = this;
    this._element.addClass("markline");
    this.title = $(['<header>', this.title, '</header>'].join("")).appendTo(this._element);
    this.footer = $(['<footer><a class="forkme" href="https://github.com/hotoo/markline" target="_blank">Markline</a></footer>'].join("")).appendTo(this._element);
    this.container = $('<section></section>').appendTo(this._element);
    this.header = $(head_dates.join("")).appendTo(this.container);
    this.body = $(body_events.join("")).appendTo(this.container);
    this.body.on("scroll", function(evt) {
      var that = $(this);
      //var head = $(".dates", me._element);
      //head.css({"left": -that.scrollLeft()});
      me.header.css({
        "left": -me.body.scrollLeft()
      });
      var groups = $(".groups > label", me._element);
      groups.css({
        "left": that.scrollLeft() - 90
      });
    });
    // scroll via mouse drag and drop.
    var startingMousePostition;
    var startingPagePosition;
    this.container.on('mousedown', function(event) {
      startingMousePostition = {
        x: event.clientX,
        y: event.clientY
      };
      startingPagePosition = {
        x: me.body.scrollLeft(),
        y: me.body.scrollTop()
      };
      me.container.on('mousemove', drag);
    });
    this.container.on('mouseup', function(event) {
      me.container.off('mousemove', drag);
    });

    function drag(event) {
      event.preventDefault();
      var x = startingPagePosition.x + (startingMousePostition.x - event.clientX);
      var y = startingPagePosition.y + (startingMousePostition.y - event.clientY);
      me.body.scrollLeft(x);
      me.body.scrollTop(y);
    }
  };
  module.exports = Markline;
});