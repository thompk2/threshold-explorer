var root,
    brushCell,
    avgConversion,
    strokeWidth = 1;

var margin = {top: 0, right: 0, bottom: 0, left: 0},
    width = 1000 - margin.left - margin.right,
    height = 322 - margin.top - margin.bottom;

var barOffset = height - 120;

// setup x for buckets
var xBucketMinValue = function (d, i) { return d.MinSegment; },
    xBucketMaxValue = function (d, i) { return d.MaxSegment; },
    xBucketScale = d3.scale.linear().range([strokeWidth/2, width-(strokeWidth/2)]).domain([100, 1]).nice();

// setup x 
var xScale = d3.scale.linear().range([strokeWidth/2, width-(strokeWidth/2)]).domain([0, 99]).nice();
var xBrushScale = d3.scale.linear().range([0, width]).domain([0,99]).nice();
    
// setup y
var yValue = function (d) { return d.Converted / avgConversion; },
    yScale = d3.scale.linear().range([height, barOffset]),
    yMap = function (d) { return yScale(yValue(d)); };

// setup brush
var brush = d3.svg.brush()
    .x(xBrushScale)
    .extent([55, 100])
    .on("brushstart", brushStart)
    .on("brush", brushMove)
    .on("brushend", brushEnd);

// add the graph canvas to the body of the webpage
var svg = d3.select(".svg").append("svg")
    .attr("width", width + margin.left + margin.right)
    .attr("height", height + margin.top + margin.bottom)
    .append("g")
    .attr("transform", "translate(" + margin.left + "," + margin.top + ")");


var bucketGroup = svg.append("g").attr("class", "bucket-group");
var segmentGroup = svg.append("g");


var slider = svg.append("g")
    .attr("class", "brush")
    .call(brush)

slider.selectAll("rect")
    .attr("height", height+4)
    .attr("transform", "translate(0,-1)");

slider.selectAll(".resize.e").remove();
slider.selectAll(".resize.w rect").attr("style", "").attr("width", 1).attr("transform", "translate(1,0)");

d3.json("ModelSummary.json", function (error, json) {
    if (!error) {
        var bucketData = json.SegmentBuckets;
        var segment = json.LSSegmentations[0];
        update(bucketData, segment);
    }
});

function update(bucketData, segment) {
    var segmentData = segment.Segments,
  
        buckets = bucketGroup.selectAll(".bucket").data(bucketData),
    
        bucketEnter = buckets.enter().append("g")
            .attr("class", "bucket"),
        
        segments = segmentGroup.selectAll(".segment").data(segmentData),
    
        segmentEnter = segments.enter().append("g")
            .attr("class", "segment")
            .attr("transform", function(d, i) { return "translate(" + parseFloat(xScale(i)) + ",0)"; });
    
    avgConversion = segment.TotalConverted / segment.TotalCount;
    var avgLift = 1;
    yScale.domain([d3.min(segmentData, yValue), d3.max(segmentData, yValue)]);
    
    bucketEnter.append("path")
        .attr("class", "bucket-path")
        .attr("d", function(d) { return createRectangle(xBucketScale(xBucketMaxValue(d)), xBucketScale(xBucketMinValue(d)), 0, height, 10); });
    
    segmentEnter.append("line")
        .attr("y1", height)
        .attr("y2", yMap)
        .attr("stroke", "#ef732d")
        .attr("stroke-width", strokeWidth);
    
    
        
//    bucketText.append("tspan")
//        .attr("class", "title")
//        .attr("x", function(d) { return xBucketMap(d) / 2 })
//        .text(function(d) { return  d.name; });
//    bucketText.append("tspan")
//        .attr("class", "label")
//        .attr("x", function(d) { return xBucketMap(d) / 2 })
//        .attr("dy", 25)
//        .text(function(d) { return d.display + "%" });

};

function createRectangle(x1, x2, y1, y2, r) {
    if(r<= Math.abs((x2-x1)/2) && r<= Math.abs((y2-y1)/2)) {
        return "M " + parseFloat(x1 + r ) + "," + y1 + " " +
            "H " + parseFloat(x2 - r) + " " +
            "Q " + x2 + "," + y1 +" " +  x2 + "," + parseFloat(r+y1) + " " +  
            "V " + parseFloat(y2-r) + " " +
            "Q " + x2 + "," + y2 + " " + parseFloat(x2-r) + "," + y2 + " " +
            "H " + parseFloat(x1+r) + " " +
            "Q " + x1 + "," + y2 + " " + x1 + "," + parseFloat(y2-r) + " " +
            "V " + parseFloat(r+y1) + " " +
            "Q " + x1 + ",0 " + parseFloat(x1 + r ) + "," + 0 + " Z";
    } else {
        return "M " + x1 + "," + y1 + " " +
            "H " + x2 + " " +
            "V " + y2 + " " +
            "H " + x1 + " " +
            "V " + y1 + " Z";
    }
};

function brushStart(p){

};

function brushMove(p) {
    console.log(brush)
};

function brushEnd(p) {
    var extent = brush.extent();
    brush.extent([extent[0], 100]);
    //d3.select(brushCell).call(brush.clear());
};
