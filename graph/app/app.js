import {
  select,
  range,
  easeLinear,
  forceSimulation,
  forceLink,
  forceCollide,
  forceManyBody,
  forceCenter,
  event,
  forceY,
  forceX,
  drag,
  json,
  scaleOrdinal,
  scaleLog,
  scaleLinear,
  schemeCategory20,
  randomUniform,
  interpolate,
} from 'd3';
import _ from 'lodash';
const d3tip = require("d3-tip");

import './style/style.less';

const width = 1000,
    height = 1000;

const svg = select('body').append('svg')
    .attr('width', width)
    .attr('height', height);

const defs = svg.append("defs");
const gradiants = defs.append("g").attr("id", "gradiant_group");
const app = document.getElementById("app");
app.style.display = "none";

const filter = defs.append("filter")
  .attr("id", "solid")
  .attr("x", 0)
  .attr("y", 0)
  .attr("width", 1)
  .attr("height", 1);
filter.append("feFlood").attr("flood-color", "yellow")
filter
  .append("feComposite")
  .attr("in", "SourceGraphic")
  .attr("operator", "xor")

const color = scaleOrdinal(schemeCategory20);

var dataNodes = [];
var dataNodesById = {};
var dataLinks = [];
var link, node, simulation;
//var tickStyle = "direct";
var tickStyle = "animated";

const emotionColors = {
  "anger": "red",
  "disgust": "red",
  "fear": "red",
  "joy": "green",
  "sadness": "red"
}

var tip = d3tip()
  .attr('class', 'd3-tip')
  .offset([-10, -5])
  .html(function(d) {
    return `<span class="nodetext">${d.label}<span>`;
  })

svg.call(tip);


function strokeEdge(d) {
  let source, target
  if (d.source === parseInt(d.source, 10))
    source = dataNodes[d.source];
  else
    source = d.source;
  if (d.target === parseInt(d.target, 10))
    target = dataNodes[d.target];
  else
    target = d.target;

  var id = "S" + source.id  +"T" + target.id;
  var gradient1 = gradiants.append("linearGradient").attr("id",  id)
  let x2 = target.x - source.x;
  let y2 = target.y - source.y;
  let maxD = Math.max(Math.abs(x2), Math.abs(y2));
  let x1 = 0;
  let y1 = 0;
  x2 = (Math.round(x2 * 100 / maxD) || 0);
  y2 = (Math.round(y2 * 100 / maxD) || 0);
  if (x2 < 0) {
    x1 = -x2;
    x2 = 0;
  }
  if (y2 < 0) {
    y1 = -y2;
    y2 = 0;
  }
  gradient1
   .attr("x1", x1 + "%")
   .attr("y1",  y1 + "%")
   .attr("x2", x2 + "%")
   .attr("y2", y2 + "%");
  gradient1.append("stop").attr("offset", "20%").attr("stop-color", d.sourceColor);
  gradient1.append("stop").attr("offset", "80%").attr("stop-color", d.targetColor);
  return "url(#" + id + ")";
}

function dragstarted(d) {
    if (!event.active) simulation.alphaTarget(0.3).restart();
    d.fx = d.x;
    d.fy = d.y;
}

function dragged(d) {
    d.fx = event.x;
    d.fy = event.y;
}

function dragended(d) {
    if (!event.active) simulation.alphaTarget(0);
    d.fx = null;
    d.fy = null;
}

var tickCounter = 0;
const ticked = function() {
  if (tickStyle === "direct") {
    link
        .attr("x1", function(d) { return d.source.x; })
        .attr("y1", function(d) { return d.source.y; })
        .attr("x2", function(d) { return d.target.x; })
        .attr("y2", function(d) { return d.target.y; });

    //node
        //.attr("cx", function(d) { return d.x; })
        //.attr("cy", function(d) { return d.y; });

    node.attr("transform", function(d) { return "translate(" + d.x + "," + d.y + ")"; });
  } else {
    const animationTime = 150;
    link.transition().ease(easeLinear).duration(animationTime)
        .attr("x1", function(d) { return d.source.x; })
        .attr("y1", function(d) { return d.source.y; })
        .attr("x2", function(d) { return d.target.x; })
        .attr("y2", function(d) { return d.target.y; });
    if (tickCounter % 20 == 0 || tickCounter < 2) {
      gradiants.html("");
      link.attr('stroke', strokeEdge);
    }
    tickCounter++;

    node.transition().ease(easeLinear).duration(animationTime)
      .attr("transform", function(d) { return "translate(" + d.x + "," + d.y + ")"; });
    //node.transition().ease(easeLinear).duration(animationTime)
              //.attr('cx', function(d) { return d.x; })
              //.attr('cy', function(d) { return d.y; });
  }
}

function drawInitial(){
  simulation = forceSimulation()
            //.force("link", forceLink().id(function(d) { return d.index }))
            .force("link", forceLink(dataLinks).distance(600).iterations(10))
            .force("collide",forceCollide( function(d){return d.r + 8 }).iterations(16) )
            .force("charge", forceManyBody())
            .force("center", forceCenter(width / 2, width / 2))
            //.force("y", forceY(0))
            //.force("x", forceX(0));

  link = svg.append("g")
            .attr("class", "link")
            .selectAll("line");

   node = svg.append("g")
       .attr("class", "nodes")
       .selectAll("circle");

   simulation
       .nodes(dataNodes)
       .on("tick", ticked);

   simulation.force("link").links(dataLinks);
};

function getColorByEmotion(obj) {
  if (typeof obj === "undefined") {
    return "grey";
  } else {
    return emotionColors[_.maxBy(Object.keys(obj.emotion), (k) => obj.emotion[k])];
  }
}

function updateGraph(){

  const transitionType = easeLinear;
  const transitionDuration = 1500;

  // Apply the general update pattern to the nodes.
  node = node.
    data(dataNodes, function(d) { return d.id;});

  // Exit any old nodes.
  node.exit()
    .transition()
    .duration(transitionDuration)
    .ease(transitionType)
    .attr("r", 0).remove();

  node = node
    .enter()
    .append("svg:g")
    .attr("class", "node")
    .call(drag()
           .on("start", dragstarted)
           .on("drag", dragged)
           .on("end", dragended))
    .on("click", function(d) {
        console.log("d", d);
    })
    .on( 'mouseenter', function(d) {
      var self = this;
      var target = event.target;
      select( this.childNodes[0] )
        .transition()
          .attr("cx", function(d) { return -10;})
          .attr("cy", function(d) { return -10;})
        .attr("r", function(d) { return 55;})

         select( this.childNodes[1] )
          .transition()
          .attr("x", function(d) { return -60;})
          .attr("y", function(d) { return -60;})
          .attr("height", 100)
          .attr("width", 100)
        .on("end", function(){
          tip.show.call(self, d, self)
        });
    })
    // set back
    .on( 'mouseleave', function(d) {
      select( this.childNodes[0] )
        .transition()
        .attr("r", function(d) { return 27;})
          .attr("cx", function(d) { return 0;})
          .attr("cy", function(d) { return 0;})
         select( this.childNodes[1] )
           .transition()
           .attr("x", function(d) { return -25;})
           .attr("y", function(d) { return -25;})
           .attr("height", 50)
           .attr("width", 50)
          .on("end", function(){tip.hide(d)});
    });

  const circle = node
    .append("circle")
    .attr("fill", "white")
    .call(function(node) {
        node.transition()
        .duration(transitionDuration)
        .ease(transitionType)
        .attr("r", 27); })


  const images = node.append("svg:image")
        .attr("xlink:href",  function(d) { return d.img;})
        .attr("x", function(d) { return -25;})
        .attr("y", function(d) { return -25;})
        .attr("height", 50)
        //.attr("clip-path", "url(#avatar_clip)")
        .attr("width", 50)
        .attr("stroke-width", 2)
        .attr("stroke", "white");

  //node.append("text")
      //.attr("class", "nodetext")
      //.attr("x", -60)
      //.attr("y", 65)
      //.attr("fill", "black")
      //.attr("filter", "url(#solid)")
      //.text(function(d) { return d.label; });

  node = node.merge(node);

  node.transition()
    .duration(800)
    .delay(function(d, i) { return i * 5; })
    .attrTween("radius", function(d) {
      var i = interpolate(0, d.r);
      return function(t) { return d.radius = i(t); };
    });

  // Apply the general update pattern to the links.
  link = link.data(dataLinks, function(d) { return d.source.id + "-" + d.target.id; });
  link.exit()
    .transition()
    .duration(transitionDuration)
    .ease(transitionType)
    .attr("stroke-opacity", 0)
    .attrTween("x1", function(d) { return function() {
        return d.source.x;
      };
    })
    .attrTween("x2", function(d) { return function() { return d.target.x; }; })
    .attrTween("y1", function(d) { return function() { return d.source.y; }; })
    .attrTween("y2", function(d) { return function() { return d.target.y; }; })
    .remove();

  link = link
    .enter()
    .append("line")
    .attr("stroke-width",function(d){
      return d.width;
    })
    .attr("stroke", strokeEdge)
    .call(function(link) { link
        .transition()
        .duration(transitionDuration)
        .ease(transitionType)
        .attr("stroke-opacity", 1); })
    .merge(link);

  // Update and restart the simulation.
  simulation.nodes(dataNodes);
  simulation.force("link").links(dataLinks);
  simulation.alpha(1).restart();
}

function nodesMap(e, i) {
  e.internal_id = e.id;
  e.id = i;
  e.r = e.r || 10;
  e.label = e.name;
  e.color = color(e.id);
  e.img = "https://leap.hackback.tech/api/avatar/" + e.internal_id;
  return e;
}

//json('./temp.json', (error, data) => {
json('https://leap.hackback.tech/api/graph', (error, data) => {
  if (error) throw error;

  drawInitial();

  dataNodes = data.nodes.map(nodesMap);
  _.each(dataNodes, (e) => {
    dataNodesById[e.internal_id] = e;
  })
  const maxMsgs = _.reduce(_.values(data.graph), (acc, e) => {
    const f = _.reduce(_.values(e), (acc, e) => {
      return Math.max(e.nr_msgs, acc);
    }, 0);
    return Math.max(acc, f);
  }, 0);
  const scaleMsgs = scaleLinear().domain([1, maxMsgs]).range([1, 15]);
  console.log(data.nodes);
  console.log(dataNodesById);
  data.links = []
  _.each(data.graph, (connections, personId)  => {
    _.each(connections, (connection, connectionId) => {
      //if (connection.nr_msgs < 2)
        //return;
      const sourceColor = getColorByEmotion(connection);
      const targetColor = getColorByEmotion((data.graph[connectionId] || {} )[personId]);
      const scaledWidth = scaleMsgs(connection.nr_msgs);
      data.links.push({
        source: dataNodesById[personId].id,
        target: dataNodesById[connectionId].id,
        sourceColor: sourceColor,
        targetColor: targetColor,
        width: scaledWidth
      });
    });
  });
  dataLinks = data.links;
  console.log(data.links);

  var removedNode, removedLinks = [];
  //setTimeout(function() {
    ////tickStyle = "animation";
    //removedNode = dataNodes.pop();
    //dataLinks = _.remove(dataLinks, (link)  => {
      //if (link.source.id === removedNode.id || link.target.id === removedNode.id) {
          //console.log(link);
          //return false;
      //} else {
          //return true;
      //}
    //});
    //updateGraph();
  //}, 100);
  updateGraph();
});
