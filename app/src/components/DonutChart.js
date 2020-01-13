/* eslint-disable camelcase */
/* eslint-disable class-methods-use-this */
/* eslint-disable react/prefer-stateless-function */
import React, { Component } from "react";
import * as d3 from "d3";

class DonutChart extends Component {
  componentDidMount() {}
  UNSAFE_componentWillReceiveProps({ ds, color }) {
    this.drawDonutRevenue(ds, color);
  }

  drawDonutRevenue(dsProp, colorProp) {
    const div = d3
      .select("body")
      .append("div")
      .attr("class", "toolTip");

    const w = 450;
    const h = 300;
    const r = 100;
    const ir = 90;
    const textOffset = 24;
    const tweenDuration = 1050;

    //OBJECTS TO BE POPULATED WITH DATA LATER
    let lines;
    let valueLabels;
    let nameLabels;
    let pieData = [];
    let oldPieData = [];
    let filteredPieData = [];

    //D3 helper function to populate pie slice parameters from array data
    const donut = d3.pie().value((d) => {
      return d.itemValue;
    });

    //D3 helper function to create colors from an ordinal scale
    //let color = d3.scale.category20c();

    let scheme;
    if (colorProp === "green") {
      // eslint-disable-next-line prefer-destructuring
      scheme = d3.schemeGreens[3];
    } else if (colorProp === "blue") {
      // eslint-disable-next-line prefer-destructuring
      scheme = d3.schemeBlues[3];
    } else if (colorProp === "orange") {
      // eslint-disable-next-line prefer-destructuring
      scheme = d3.schemeOranges[3];
    } else {
      // eslint-disable-next-line prefer-destructuring
      scheme = d3.schemeSpectral[3];
    }
    const color = d3.scaleOrdinal(scheme);

    //D3 helper function to draw arcs, populates parameter "d" in path object
    const arc = d3
      .arc()
      .startAngle(function(d) {
        return d.startAngle;
      })
      .endAngle(function(d) {
        return d.endAngle;
      })
      .innerRadius(ir)
      .outerRadius(r);

    ///////////////////////////////////////////////////////////
    // GENERATE FAKE DATA /////////////////////////////////////
    ///////////////////////////////////////////////////////////

    let data;
    const dataStructure = [
      {
        data: dsProp,
        label: "2020"
      }
    ];

    ///////////////////////////////////////////////////////////
    // CREATE VIS & GROUPS ////////////////////////////////////
    ///////////////////////////////////////////////////////////

    const vis = d3
      .select("#pie-chart")
      .append("svg:svg")
      .attr("width", w)
      .attr("height", h);

    //GROUP FOR ARCS/PATHS
    const arc_group = vis
      .append("svg:g")
      .attr("class", "arc")
      .attr("transform", `translate(${w / 2},${h / 2})`);

    //GROUP FOR LABELS
    const label_group = vis
      .append("svg:g")
      .attr("class", "label_group")
      .attr("transform", `translate(${w / 2},${h / 2})`);

    //GROUP FOR CENTER TEXT
    const center_group = vis
      .append("svg:g")
      .attr("class", "center_group")
      .attr("transform", `translate(${w / 2},${h / 2})`);

    //PLACEHOLDER GRAY CIRCLE
    // var paths = arc_group.append("svg:circle")
    //     .attr("fill", "#EFEFEF")
    //     .attr("r", r);

    ///////////////////////////////////////////////////////////
    // CENTER TEXT ////////////////////////////////////////////
    ///////////////////////////////////////////////////////////

    //WHITE CIRCLE BEHIND LABELS
    // const whiteCircle = center_group
    //   .append("svg:circle")
    //   .attr("fill", "white")
    //   .attr("r", ir);
    // const centerText = "";

    ///////////////////////////////////////////////////////////
    // STREAKER CONNECTION ////////////////////////////////////
    ///////////////////////////////////////////////////////////

    // to run each time data is generated
    const update = (number) => {
      data = dataStructure[number].data;

      oldPieData = filteredPieData;
      pieData = donut(data);

      let sliceProportion = 0; //size of this slice
      const filterData = (element, index) => {
        element.name = data[index].itemLabel;
        element.value = data[index].itemValue;
        sliceProportion += element.value;
        return element.value > 0;
      };
      filteredPieData = pieData.filter(filterData);

      // function filterData(element, index, array) {
      //   element.name = data[index].itemLabel;
      //   element.value = data[index].itemValue;
      //   sliceProportion += element.value;
      //   return element.value > 0;
      // }

      //DRAW ARC PATHS
      const paths = arc_group.selectAll("path").data(filteredPieData);
      paths
        .enter()
        .append("svg:path")
        .attr("stroke", "white")
        .attr("stroke-width", 0.5)
        .attr("fill", function(d, i) {
          return color(i);
        })
        .transition()
        .duration(tweenDuration)
        .attrTween("d", pieTween);
      paths
        .transition()
        .duration(tweenDuration)
        .attrTween("d", pieTween);
      paths
        .exit()
        .transition()
        .duration(tweenDuration)
        .attrTween("d", removePieTween)
        .remove();

      paths.on("mousemove", function(d) {
        div.style("left", `${d3.event.pageX + 10}px`);
        div.style("top", `${d3.event.pageY - 25}px`);
        div.style("display", "inline-block");
        div.html(`${d.data.itemLabel}<br>${d.data.itemValue}`);
      });

      paths.on("mouseout", function(d) {
        div.style("display", "none");
      });

      //DRAW TICK MARK LINES FOR LABELS
      lines = label_group.selectAll("line").data(filteredPieData);
      lines
        .enter()
        .append("svg:line")
        .attr("x1", 0)
        .attr("x2", 0)
        .attr("y1", -r - 3)
        .attr("y2", -r - 18)
        .attr("stroke", "gray")
        .attr("transform", function(d) {
          return `rotate(${((d.startAngle + d.endAngle) / 2) * (180 / Math.PI)})`;
        });
      lines
        .transition()
        .duration(tweenDuration)
        .attr("transform", function(d) {
          return `rotate(${((d.startAngle + d.endAngle) / 2) * (180 / Math.PI)})`;
        });
      lines.exit().remove();
      //DRAW LABELS WITH PERCENTAGE VALUES
      valueLabels = label_group
        .selectAll("text.value")
        .data(filteredPieData)
        .attr("dy", function(d) {
          if ((d.startAngle + d.endAngle) / 2 > Math.PI / 2 && (d.startAngle + d.endAngle) / 2 < Math.PI * 1.5) {
            return 5;
          }
          return -7;
        })
        .attr("text-anchor", function(d) {
          if ((d.startAngle + d.endAngle) / 2 < Math.PI) {
            return "beginning";
          }
          return "end";
        })
        .text(function(d) {
          const percentage = (d.value / sliceProportion) * 100;
          return `${percentage.toFixed(1)}%`;
        });

      valueLabels
        .enter()
        .append("svg:text")
        .attr("class", "value")
        .attr("transform", function(d) {
          return `translate(${Math.cos((d.startAngle + d.endAngle - Math.PI) / 2) *
            (r + textOffset)},${Math.sin((d.startAngle + d.endAngle - Math.PI) / 2) * (r + textOffset)})`;
        })
        .attr("dy", function(d) {
          if ((d.startAngle + d.endAngle) / 2 > Math.PI / 2 && (d.startAngle + d.endAngle) / 2 < Math.PI * 1.5) {
            return 5;
          }
          return -7;
        })
        .attr("text-anchor", function(d) {
          if ((d.startAngle + d.endAngle) / 2 < Math.PI) {
            return "beginning";
          }
          return "end";
        })
        .text(function(d) {
          const percentage = (d.value / sliceProportion) * 100;
          return `${percentage.toFixed(0)}% ${d.value.toString().replace(/(\d)(?=(\d{3})+(?!\d))/g, "$1,")}`;
        });
      valueLabels
        .transition()
        .duration(tweenDuration)
        .attrTween("transform", textTween);

      valueLabels.exit().remove();

      //DRAW LABELS WITH ENTITY NAMES
      nameLabels = label_group
        .selectAll("text.units")
        .data(filteredPieData)
        .attr("dy", function(d) {
          if ((d.startAngle + d.endAngle) / 2 > Math.PI / 2 && (d.startAngle + d.endAngle) / 2 < Math.PI * 1.5) {
            return 17;
          }
          return 5;
        })
        .attr("text-anchor", function(d) {
          if ((d.startAngle + d.endAngle) / 2 < Math.PI) {
            return "beginning";
          }
          return "end";
        })
        .text(function(d) {
          return d.name;
        });

      nameLabels
        .enter()
        .append("svg:text")
        .attr("class", "units")
        .attr("transform", function(d) {
          return `translate(${Math.cos((d.startAngle + d.endAngle - Math.PI) / 2) *
            (r + textOffset)},${Math.sin((d.startAngle + d.endAngle - Math.PI) / 2) * (r + textOffset)})`;
        })
        .attr("dy", function(d) {
          if ((d.startAngle + d.endAngle) / 2 > Math.PI / 2 && (d.startAngle + d.endAngle) / 2 < Math.PI * 1.5) {
            return 18;
          }
          return 5;
        })
        .attr("text-anchor", function(d) {
          if ((d.startAngle + d.endAngle) / 2 < Math.PI) {
            return "beginning";
          }
          return "end";
        })
        .text(function(d) {
          return d.name;
        });

      nameLabels
        .transition()
        .duration(tweenDuration)
        .attrTween("transform", textTween);

      nameLabels.exit().remove();
      let total = 0;
      pieData.forEach(function(d) {
        total += d.value * 1;
      });
      center_group
        .selectAll("text")
        .data([total])
        .enter()
        .append("text")
        .text(function(d) {
          return d.toString().replace(/(\d)(?=(\d{3})+(?!\d))/g, "$1,");
        })
        .attr("class", "value")
        .attr("dy", 8)
        .attr("text-anchor", "end")
        .attr("transform", "translate(20, 0)");
    };

    ///////////////////////////////////////////////////////////
    // FUNCTIONS //////////////////////////////////////////////
    ///////////////////////////////////////////////////////////
    // Interpolate the arcs in data space.
    let s0;
    let e0;
    const pieTween = (d, i) => {
      // var s0;
      // var e0;
      if (oldPieData[i]) {
        s0 = oldPieData[i].startAngle;
        e0 = oldPieData[i].endAngle;
      } else if (!oldPieData[i] && oldPieData[i - 1]) {
        s0 = oldPieData[i - 1].endAngle;
        e0 = oldPieData[i - 1].endAngle;
      } else if (!oldPieData[i - 1] && oldPieData.length > 0) {
        s0 = oldPieData[oldPieData.length - 1].endAngle;
        e0 = oldPieData[oldPieData.length - 1].endAngle;
      } else {
        s0 = 0;
        e0 = 0;
      }
      var i = d3.interpolate({ startAngle: s0, endAngle: e0 }, { startAngle: d.startAngle, endAngle: d.endAngle });
      return function(t) {
        const b = i(t);
        return arc(b);
      };
    };

    const removePieTween = (d, i) => {
      s0 = 2 * Math.PI;
      e0 = 2 * Math.PI;
      var i = d3.interpolate({ startAngle: d.startAngle, endAngle: d.endAngle }, { startAngle: s0, endAngle: e0 });
      return function(t) {
        const b = i(t);
        return arc(b);
      };
    };
    const textTween = (d, i) => {
      let a;
      if (oldPieData[i]) {
        a = (oldPieData[i].startAngle + oldPieData[i].endAngle - Math.PI) / 2;
      } else if (!oldPieData[i] && oldPieData[i - 1]) {
        a = (oldPieData[i - 1].startAngle + oldPieData[i - 1].endAngle - Math.PI) / 2;
      } else if (!oldPieData[i - 1] && oldPieData.length > 0) {
        a = (oldPieData[oldPieData.length - 1].startAngle + oldPieData[oldPieData.length - 1].endAngle - Math.PI) / 2;
      } else {
        a = 0;
      }
      const b = (d.startAngle + d.endAngle - Math.PI) / 2;

      const fn = d3.interpolateNumber(a, b);
      return function(t) {
        const val = fn(t);
        return `translate(${Math.cos(val) * (r + textOffset)},${Math.sin(val) * (r + textOffset)})`;
      };
    };
    update(0);
  }

  render() {
    return (
      <div>
        <div id="canvas" />
        <div id="pie-chart" />
      </div>
    );
  }
}
export default DonutChart;
