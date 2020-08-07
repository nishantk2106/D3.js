
/**  @type {dict} The margins of the plot container */
var margin = {top: 70, right: 50, bottom: 10, left: 70};
/** @type {number} The width of the plot container */
var width = document.body.clientWidth - margin.left - margin.right;
/** @type {number} The height of the plot container */
var height = 500 - margin.top - margin.bottom;
/** @type {number} The inner height used for plotting the axes */
var innerHeight = height - 2;

/**
 * @type {number}
 * Ratio of the resolution in physical pixels to the resolution in CSS pixels.
 * this tells the browser how many of the screen's actual pixels should be used
 * to draw a single CSS pixel.
 */
var devicePixelRatio = window.devicePixelRatio || 1;

var color = d3.scaleOrdinal()
  .domain(["0", "1", "2", "3", "4", "5", "6", "7", "8"])
  .range(["#D27F8A", "#50A9D4", "#4CFC86", "#C97D0B", "#459248", "#D26FA7", "#E1525A", "#5DB5B3", "#785D82"]);
var types = {
    "Number": {
      key: "Number",
      coerce: function(d) { return +d; }, // convert the input to number +d
      extent: d3.extent,  // return (min, max) to set in the domain
      within: function(d, extent, dim) { return extent[0] <= dim.scale(d) && dim.scale(d) <= extent[1]; },
      // use a linear function (y = m * x + b) to map the domain values to a specified and allowed range
      defaultScale: d3.scaleLinear().range([innerHeight, 0])
    },
    "String": {
      key: "String",
      coerce: String,
      extent: function (data) { return data.sort(); },  // sort alphabetically the strings to set in the domain
      within: function(d, extent, dim) { return extent[0] <= dim.scale(d) && dim.scale(d) <= extent[1]; },
      // map the domain value with one point each in the allowed range, no padding, no rounding and center alignment
      defaultScale: d3.scalePoint().range([0, innerHeight])
    }
  };

var dimensions = [
    {
      key: "time",
      description: "time",
      type: types["Number"],
      axis: d3.axisLeft()
        .tickFormat(function(d,i) {
          return d;
        })
    },
    {
      key: "event_type",
      description: "event_type",
      type: types["Number"]
    },
    {
      key: "cpu_id",
      description: "cpu_id",
      type: types["Number"]
    },
    {
      key: "disk_usage",
      description: "disk_usage",
      type: types["Number"]
    },
    {
      key: "memory_usage",
      description: "memory_usage",
      type: types["Number"]
    }

  ];

var xscale = d3.scalePoint()  /** map every value in the domain to one point, s.t. they are equidistant */
  .domain(d3.range(dimensions.length))  /** input domain: one point per dimension */
  .range([0, width]);

var yAxis = d3.axisLeft();

var container = d3.select("body").append("div")
    .attr("class", "parcoords")  /** the div tag will have a class "parcoords" */
    .style("width", width + margin.left + margin.right + "px")  /** set the width of the container */
    .style("height", height + margin.top + margin.bottom + "px");  /** set the height of the container */

var svg = container.append("svg")
    .attr("width", width + margin.left + margin.right)  /** set the width of the SVG element */
    .attr("height", height + margin.top + margin.bottom)  /** set the height of the SVG element */
    .append("g")  /** append one group <g> element inside */
    .attr("transform", "translate(" + margin.left + "," + margin.top + ")"); 

var canvas = container.append("canvas")
    .attr("width", width * devicePixelRatio)
    .attr("height", height * devicePixelRatio)
    .style("width", width + "px")
    .style("height", height + "px")
    .style("margin-top", margin.top + "px")
    .style("margin-left", margin.left + "px");


var columns = [
        { head: 'time', cl: 'title', key: 'time' },
        { head: 'event_type', cl: 'num', key: 'event_type'},
        { head: 'cpu_id', cl: 'num', key: 'cpu_id'},
        { head: 'disk_usage', cl: 'num', key: 'disk_usage'},
        { head: 'memory_usage', cl: 'num', key: 'memory_usage'}
    ];

var table = d3.select("body")
            .append("table")
            .attr("id", "grid");
            table.append('thead')
            .append('tr')  /** append one row */
            .selectAll('th')  /** select all header cells */
            .data(columns)  /** attach the columns list as data */
            .enter()
            .append('th')  /** for each entry in the columns list create one <th> element */
            .attr('class', function(col){return col.cl; })  /** set the <th> element class as specified in the current column */
            .text(function(col){return col.head;});

var ctx = canvas.node().getContext("2d");
ctx.globalCompositeOperation = 'darken';
ctx.globalAlpha = 0.25;  /** Set the transparency level between 0.0 and 1.0 */
ctx.lineWidth = 1.5;  /** Set the width of the line in coordinate space unit */
ctx.scale(devicePixelRatio, devicePixelRatio);

var axes = svg.selectAll(".axis")  /** create an axis element inside the svg tag */
.data(dimensions)  /** bound the dimensions to the .axis element */
.enter().append("g")  /** for each entry in the dimensions append one <g> tag in the svg */
.attr("class", function(d) { return "axis " + d.key.replace(/ /g, "_"); })  /** the class of each <g> tag is axis_dimension_key_name */
.attr("transform", function(d,i) { return "translate(" + xscale(i) + ")"; });
/**
 * Loads the data at the specified path and plots it. The callback function takes the loaded data.
 * @param {list} data: a list of dictionaries with a keys same as column names in the loaded .csv file
 */
d3.csv("part1.csv", function(error, data) {
    if (error) throw error;
    /**
     * Iterate through each data row.
     * @param {dict} d: one entry in the list of data points
     */
    data.forEach(function(d) {
      /**
       * Iterate through each dimension.
       * @param {dict} p: one entry in the list of dimensions
       */
      dimensions.forEach(function(p) {
        /**
         * Check if the data entry belongs to the current dimension:
         * if not belong set it null, otherwise coerce it to the specified type;
        */
        d[p.key] = !d[p.key] ? null : p.type.coerce(d[p.key]);
      });
    });
  
    dimensions.forEach(function(dim) {
      /** If the current dimension does not define its own input domain */
      if (!("domain" in dim)) {
        /** set domain using dimension type's extent function */
        dim.domain = d3_functor(dim.type.extent)(data.map(function(d) { return d[dim.key]; }));
      }
      /** If the current dimension does not define its own scale */
      if (!("scale" in dim)) {
        /** use dimension type's default scale */
        dim.scale = dim.type.defaultScale.copy();
      }
      dim.scale.domain(dim.domain);
    });

    var render = renderQueue(draw).rate(30);
  
    ctx.clearRect(0,0,width,height); /** erase the pixels in a rectangular area */
    ctx.globalAlpha = d3.min([1.15/Math.pow(data.length,0.3),1]); /** set the transparency according to how much data is selected */
    render(data);  /** render the selected data by calling the 'draw' function */
  
    /** Render each axis associated with one dimension */
    axes.append("g")
      .each(function(d) {
          var renderAxis = "axis" in d ? d.axis.scale(d.scale) : yAxis.scale(d.scale); /** custom or default axis */
          d3.select(this).call(renderAxis);
      })
      .append("text")
      .attr("class", "title")
      .attr("text-anchor", "start")
      .text(function(d) { return "time" in d ? d.time : d.key; });
      axes.append("g")
      .attr("class", "brush")
      .each(function(d) {
        d3.select(this).call(d.brush = d3.brushY()
          .extent([[-10,0], [10,height]])
          .on("start", brushstart)
          .on("brush", brush)
          .on("end", brush)
        )
      })
    .selectAll("rect")
    .attr("x", -8)
    .attr("width", 16);
    d3.selectAll(".axis.time .tick text")
      .style("fill", color);
      var tbody = table.append('tbody')
      .selectAll('tr')  /** Select all rows in the table's body */
      .data(data.sort(function(d1, d2){  /** sort the data in ascending order according to the price */
          return d3.ascending(d1['event_type'], d2['event_type']);
      }).slice(0, 5))  /** select the first five entries with lowest price */
      .enter()
      .append('tr')  /** for each of the 5 selected data entries create one row */
      .selectAll('td')  /** select all cells in the created rows */
      .data(function(row, i) {  /** insert data in each cell in the rows, @param {dict} row: selected data entry */
          return columns.map(function(c) {  /** map every entry in the list of columns, @param {dict} c: column specification */
              /** compute cell values for this specific row */
              var cell = {};
              d3.keys(c).forEach(function(k) {  /** iterate over the keys of the current column,  @param {string} k: key */
                  cell[k] = k == 'key' ? row[c[k]] : c[k];  /** if specifying the content of the cell or something else */
              });
              return cell;
          });
      }).enter()
      .append('td')  /** for each of the selected data entries create one table cell */
      .html(function(cell){ return cell.key; })
      .attr('class', function(cell){ return cell.cl; });
      function project(d) {
        /**
         * Run the callback function on every element in the list
         * @param {dict} p: one element in the list
         * @param {number} i: the index of the element
         */
        return dimensions.map(function(p,i) {
          /** check if the data element d has the current dimension key and contains a value */
          if (!(p.key in d) || d[p.key] === null) return null;
          return [xscale(i),p.scale(d[p.key])];
        });
      };
    function draw(d) {
        ctx.strokeStyle = color(d.event_type);  /** Set the color of the poly-line */
        ctx.beginPath();  /** Start a new path by emptying the list of sub-paths */
        var coords = project(d);  /** Take the (x, y) coordinates for each dimension of the current data point */
    /**
     * Drawing the poly-line following the coordinates.
     * @param {list} p: (x, y) coordinates for each element in the data point
     * @param {number} i: the index of the element
     */
    coords.forEach(function(p,i) {
      /** Initialize the line for the first element */
      if (i == 0) {
        ctx.moveTo(p[0],p[1]);  /** Begin a new sub-path at the specified point */
        return;
      }

      ctx.lineTo(p[0],p[1]);  /** Connect the sub-path's last point to the specified point */
    });

    ctx.stroke(); /**  Stroke the current path with the current stroke style */
  }

  /** Event listener to activate the brush */
  function brushstart() {
    d3.event.sourceEvent.stopPropagation();
  }

  /**
   * Handles a brush event, toggling the display of foreground lines and updates the table.
   */
  function brush() {
    render.invalidate(); /**  stop rendering the data points */

    /** Select the axis with an active brush on them */
    var actives = [];
    svg.selectAll(".axis .brush")
      .filter(function(d) {
        return d3.brushSelection(this);
      })
      .each(function(d) {
        actives.push({
          dimension: d,
          extent: d3.brushSelection(this)
        });
      });

    /** Get the selected data */
    var selected = data.filter(function(d) {
      if (actives.every(function(active) {
          var dim = active.dimension;
          /** test if point is within extents for each active brush */
          return dim.type.within(d[dim.key], active.extent, dim);
        })) {
        return true;
      }
    });

    /** Draw only the selected lines */
    ctx.clearRect(0,0,width,height);  /** erase the pixels in a rectangular area */
    ctx.globalAlpha = d3.min([0.85/Math.pow(selected.length,0.3),1]);  /** set the transparency according to how much data is selected */
    render(selected);  /** render the selected data by calling the 'draw' function */

    /** Update the table */
    var rows = table.selectAll('tbody tr')
      .data(selected.sort(function(d1, d2){
        return d3.ascending(d1['event_type'], d2['event_type']);
      }).slice(0, 5));

    var cells = rows.selectAll('td')
      .data(function(row, i) {
        return columns.map(function(c) {
            // compute cell values for this specific row
            var cell = {};
            d3.keys(c).forEach(function(k) {
                cell[k] = k == 'key' ? row[c[k]] : c[k];
            });
            return cell;
        });
    }).html(function(cell){ return cell.key; })
    .attr('class', function(cell){ return cell.cl; });

   /** Insert the new data */
   cells.enter()
    .append("td")
    .html(function(cell) { return cell.key; });

   /** Remove the absent data */
   cells.exit().remove();

  }
});

function d3_functor(v) {
  return typeof v === "function" ? v : function() { return v; };
};

