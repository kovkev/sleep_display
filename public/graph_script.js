
function createGraph(data, which) {

    // set the dimensions and margins of the graph
    const margin = { top: 30, right: 30, bottom: 30, left: 120 },
        width = 1600 - margin.left - margin.right,
        height = 400 - margin.top - margin.bottom;

    var newdiv = document.createElement('div');
    newdiv.setAttribute('class', 'n' + which);
    var div = document.querySelector('#d3js');
    div.appendChild(newdiv);
    var title = document.createElement('div');
    title.innerHTML = "Waking up on " + data.dateOfSleep;
    title.setAttribute('class', 'title');
    newdiv.appendChild(title);

    // append the svg object to the body of the page
    const svg = d3.select(".n" + which)
        .append("svg")
        .attr("width", width + margin.left + margin.right)
        .attr("height", height + margin.top + margin.bottom)
        .append("g")
        .attr("transform", `translate(${margin.left},${margin.top})`);

    // get the data
    // d3.csv("https://raw.githubusercontent.com/holtzy/data_to_viz/master/Example_dataset/1_OneNum.csv").then( function(data) {
    var day = data
    // day.levels.data = day.levels.data.slice(0,2)
    //   day.levels.data = day.levels.data.concat(day.levels.shortData);
    day.levels.data.sort((a, b) => { return Date.parse(a.dateTime) - Date.parse(b.dateTime) })
    // console.log(day.levels.data);


    first = Date.parse(day.levels.data[0].dateTime)
    var last_day = day.levels.data[day.levels.data.length - 1];
    last = Date.parse(last_day.dateTime) + last_day.seconds;
    // add the x Axis
    //   const x = d3.scaleLinear()
    //             .domain([0, 1000])
    //             .range([0, width]);

    // Compute kernel density estimation

    function parseLevel(slevel) {
        var level = -1;
        switch (slevel) {
            case "wake":
                level = 0.008;
                break;
            case "deep":
                level = 0.002;
                break;
            case "rem":
                level = 0.006;
                break;
            case "light":
                level = 0.004;
                break;
            default:
                level = 0.002;
                break;
        }
        return level;
    }
    var ticks = [];
    for (i in day.levels.data) {
        var d = day.levels.data[i];

        // console.log(d.time, level, d.seconds)
        // for (j = 0; j < d.seconds; j++) {
        //     ticks.push([Date.parse(d.dateTime) + j * 1000, parseLevel(d.level)]);
        // }
        // console.log(">>>", d.dateTime);
        ticks.push([Date.parse(d.dateTime), parseLevel(d.level)]);
        ticks.push([Date.parse(d.dateTime)+d.seconds*1000, parseLevel(d.level)]);
        // ticks.push([Date.parse(day.levels.data[i+1])+d.seconds*1000, level]);
    }
    var short_ticks = [];
    for (i in day.levels.shortData) {
        var d = day.levels.shortData[i];
        // for (j = 0; j < d.seconds; j++) {
        //     short_ticks.push([Date.parse(d.dateTime) + j * 1000, parseLevel(d.level)]);
        // }
        short_ticks.push([Date.parse(d.dateTime), parseLevel(d.level)]);
        short_ticks.push([Date.parse(d.dateTime) + d.seconds*1000, parseLevel(d.level)]);
    }
    // ticks = ticks.slice(0,871)
    // console.log("ticks", ticks);
    // ticks = [[1,0.01], [2,0.010], [5, 0.010], [6, 0.010], [7, 0.010], [9, 0.01]]
    // ticks = []
    // for (i = first; i < last; i++) {
    //     ticks.push([i, 0.002]);
    // }

    var the_8_pm_of = Date.parse(day.dateOfSleep) + 4 * 60 * 60 * 1000;
    var the_8_am_of = Date.parse(day.dateOfSleep) + 20 * 60 * 60 * 1000;
    ticks.sort((a, b) => { return a[0] - b[0] })
    const x = d3.scaleLinear()
        // .domain([first + 0 * (last - first) / 10, first + 10 * (last - first) / 10])
        .domain([the_8_pm_of, the_8_am_of])
        // .domain([0, 10])
        .range([0, width])
        // .tickFormat(d => Date.parse(d));
        ;
    //   .domain(d3.extent(data, function(d) { return d.date; }))
    svg.append("g")
        .attr("transform", `translate(0, ${height})`)
        .call(d3.axisBottom(x).tickFormat(d3.timeFormat("%H:%M")));

    // add the y Axis
    const y = d3.scaleLinear()
        .range([height, 0])
        .domain([0, 0.01]);
    svg.append("g")
        .call(d3.axisLeft(y));
    // day.levels.data


    // Add dots
    svg.append('g')
        .selectAll("dot")
        .data(short_ticks)
        .join("circle")
        .attr("cx", function (d) { return x(d[0]); })
        .attr("cy", function (d) { return y(d[1]); })
        .attr("r", 1.5)
        .style("fill", "#69b3a2");

    // Plot the area
    svg.append("path")
        .attr("class", "mypath")
        //   .datum(density)
        .datum(ticks)
        .attr("fill", "none")
        //   .attr("fill", "#69b3a2")
        .attr("opacity", ".8")
        .attr("stroke", "#000")
        .attr("stroke-width", 3)
        //   .attr("stroke-linejoin", "round")
        .attr("d", d3.line()
            // .curve(d3.curveBasis)
            // did curve catmul also
            // .curve(d3.curveCardinal.tension(0.9001))
            // .curve(d3.curveCatmullRom.alpha(0.8))
            // .curve(d3.curveMonotoneX)
            // .curve(d3.curveBumpX)
            // .curve(d3.curveBundle.beta(0.5))
            .x(function (d) {
                return x(d[0]);
            })
            .y(function (d) {
                // console.log(d);
                return y(d[1]);
            })
        );

}

fetch('./sleep-2022-01-28.json').then(r => r.json()).then(data => {
    for (let i = 0; i < data.length; i++) {
        createGraph(data[i], i);
    }
})
