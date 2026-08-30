// =========================================================
// CO2 BUBBLE CHART — D3
// =========================================================


// =========================================================
// 1. COLOURS
// =========================================================

const co2BgCol = "#404044";
const co2TextCol = "#effae6";
const co2GridCol = "#615c5c";

const co2WorldCol = "#82b3ae";
const co2PacificCol = "#EF476F";


// =========================================================
// 2. CANVAS
// =========================================================

const co2Width = 1100;
const co2Height = 700;

const co2Margin = {
  top: 60,
  right: 60,
  bottom: 100,
  left: 60
};

const co2InnerWidth =
  co2Width -
  co2Margin.left -
  co2Margin.right;

const co2InnerHeight =
  co2Height -
  co2Margin.top -
  co2Margin.bottom;


// =========================================================
// 3. SVG
// =========================================================

const co2Svg =
  d3.select("#co2-chart")
    .append("svg")
    .attr(
      "viewBox",
      `0 0 ${co2Width} ${co2Height}`
    )
    .attr("width", "100%")
    .attr("height", "auto")
    .style("display", "block")
    .style("max-width", "1100px")
    .style("margin", "0 auto")
    .style("background", co2BgCol);


const co2G =
  co2Svg
    .append("g")
    .attr(
      "transform",
      `translate(
        ${co2Margin.left},
        ${co2Margin.top}
      )`
    );


// =========================================================
// 4. TOOLTIP
// =========================================================

const co2Tooltip =
  d3.select("body")
    .append("div")
    .attr("class", "co2-tooltip")
    .style("position", "absolute")
    .style("pointer-events", "none")
    .style("opacity", 0);


// =========================================================
// 5. LOAD DATA
// =========================================================

d3.csv(
  "data/processed/co2_d3.csv",
  d => ({
    entity: d.entity,
    code: d.code,
    year: +d.year,
    co2_pc: +d.co2_pc,
    co2_total: +d.co2_total,
    co2_total_mt: +d.co2_total_mt,
    pacific: d.pacific === "TRUE"
  })
)
.then(data => {


  // =======================================================
  // 6. X SCALE
  // =======================================================

  // mesma ideia do gráfico anterior:
  // transformação raiz quadrada

  const co2X =
    d3.scaleSqrt()
      .domain([
        0,
        d3.max(
          data,
          d => d.co2_pc
        )
      ])
      .range([
        0,
        co2InnerWidth
      ])
      .nice();


  // =======================================================
  // 7. BUBBLE SIZE
  // =======================================================

  const co2Radius =
    d3.scaleSqrt()
      .domain([
        0,
        d3.max(
          data,
          d => d.co2_total_mt
        )
      ])
      .range([
        3,
        55
      ]);


  // =======================================================
  // 8. X AXIS
  // =======================================================

  const co2XAxis =
    d3.axisBottom(
      co2X
    )
      .tickValues([
        0,
        1,
        2,
        5,
        10,
        20,
        40
      ])
      .tickSize(
        -co2InnerHeight
      );


  const co2AxisG =
    co2G
      .append("g")
      .attr(
        "transform",
        `translate(
          0,
          ${co2InnerHeight}
        )`
      )
      .call(
        co2XAxis
      );


  co2AxisG
    .select(".domain")
    .remove();


  co2AxisG
    .selectAll(".tick line")
    .attr(
      "stroke",
      co2GridCol
    )
    .attr(
      "stroke-opacity",
      0.55
    );


  co2AxisG
    .selectAll(".tick text")
    .attr(
      "fill",
      co2TextCol
    )
    .style(
      "font-family",
      "'Rubik', sans-serif"
    )
    .style(
      "font-size",
      "18px"
    )
    .attr(
      "dy",
      "1.6em"
    );


  // =======================================================
  // 9. X LABEL
  // =======================================================

  co2Svg
    .append("text")
    .attr(
      "x",
      co2Width / 2
    )
    .attr(
      "y",
      co2Height - 20
    )
    .attr(
      "text-anchor",
      "middle"
    )
    .attr(
      "fill",
      co2TextCol
    )
    .style(
      "font-family",
      "'Rubik', sans-serif"
    )
    .style(
      "font-size",
      "20px"
    )
    .text(
      "CO₂ emissions per capita (tonnes per person)"
    );


  // =======================================================
  // 10. INITIAL POSITIONS
  // =======================================================

  const centerY =
    co2InnerHeight / 2;


  data.forEach(d => {

    d.x =
      co2X(
        d.co2_pc
      );

    d.y =
      centerY;

  });


  // =======================================================
  // 11. FORCE SIMULATION
  // =======================================================

  const simulation =
    d3.forceSimulation(
      data
    )

      .force(
        "x",
        d3.forceX(
          d =>
            co2X(
              d.co2_pc
            )
        )
        .strength(1)
      )

      .force(
        "y",
        d3.forceY(
          centerY
        )
        .strength(0.08)
      )

      .force(
        "collision",
        d3.forceCollide(
          d =>
            co2Radius(
              d.co2_total_mt
            ) + 1.5
        )
      )

      .stop();


  // calculate layout immediately

  for (
    let i = 0;
    i < 250;
    ++i
  ) {

    simulation.tick();

  }


  // =======================================================
  // 12. DRAW BUBBLES
  // =======================================================

  const co2Bubbles =
    co2G
      .selectAll(
        ".co2-bubble"
      )
      .data(
        data
      )
      .join(
        "circle"
      )

      .attr(
        "class",
        d =>
          d.pacific
            ? "co2-bubble pacific"
            : "co2-bubble world"
      )

      .attr(
        "cx",
        d => d.x
      )

      .attr(
        "cy",
        d => d.y
      )

      .attr(
        "r",
        d =>
          co2Radius(
            d.co2_total_mt
          )
      )

      .attr(
        "fill",
        d =>
          d.pacific
            ? co2PacificCol
            : co2WorldCol
      )

      .attr(
        "stroke",
        "black"
      )

      .attr(
        "stroke-width",
        0.90
      );


  // =======================================================
  // 13. TOOLTIP
  // =======================================================

  co2Bubbles

    .on(
      "mouseenter",
      function(
        event,
        d
      ) {

        d3.select(this)
          .interrupt()
          .attr(
            "stroke-width",
            1.5
          );


        co2Tooltip
          .style(
            "opacity",
            1
          )
          .html(`
            <div class="tooltip-territory">
              ${d.entity}
            </div>

            <div class="tooltip-row">
              <span>
                CO₂ per capita
              </span>

              <strong>
                ${d.co2_pc.toFixed(2)}
                t/person
              </strong>
            </div>

            <div class="tooltip-row">
              <span>
                Total CO₂
              </span>

              <strong>
                ${
                  d.co2_total_mt >= 1000

                    ? (
                        d.co2_total_mt /
                        1000
                      ).toFixed(2) +
                      " Gt"

                    : d.co2_total_mt
                        .toFixed(2) +
                      " Mt"
                }
              </strong>
            </div>

            <div class="tooltip-row">
              <span>
                Year
              </span>

              <strong>
                ${d.year}
              </strong>
            </div>
          `);

      }
    )


    .on(
      "mousemove",
      function(event) {

        co2Tooltip
          .style(
            "left",
            `${event.pageX + 14}px`
          )
          .style(
            "top",
            `${event.pageY + 14}px`
          );

      }
    )


    .on(
      "mouseleave",
      function() {

        d3.select(this)
          .interrupt()
          .attr(
            "stroke-width",
            0.7
          );

        co2Tooltip
          .style(
            "opacity",
            0
          );

      }
    );


 
function updateCO2Chart(state) {

  if (state === "world") {

    co2Bubbles
      .interrupt()
      .transition()
      .duration(600)
      .attr(
        "opacity",
        d => d.pacific ? 0 : 0.50
      )
      .attr(
        "fill",
        d => d.pacific
          ? co2PacificCol
          : co2WorldCol
      )
      .style(
        "pointer-events",
        d => d.pacific
          ? "none"
          : "auto"
      );

  }

  if (state === "pacific") {

    co2Bubbles
      .interrupt()
      .transition()
      .duration(600)
      .attr(
        "opacity",
        d => d.pacific ? 0.95 : 0.50
      )
      .attr(
        "fill",
        d => d.pacific
          ? co2PacificCol
          : co2WorldCol
      )
      .style(
        "pointer-events",
        "auto"
      );

  }

}


// =======================================================
// CLOSE-READ SCROLL
// =======================================================

let co2CurrentState = "world";
let co2Ticking = false;


function getActiveCO2Step() {

  const markers = Array.from(
    document.querySelectorAll(
      ".co2-marker[data-state]"
    )
  );

  if (markers.length === 0) {
    return;
  }


  const targetY =
    window.innerHeight * 0.5;

  let activeMarker = null;
  let smallestDistance = Infinity;


  markers.forEach(marker => {

    const element =
      marker.closest(".trigger") ||
      marker.parentElement;

    const rect =
      element.getBoundingClientRect();

    const center =
      rect.top +
      rect.height / 2;

    const distance =
      Math.abs(
        center - targetY
      );


    if (
      distance <
      smallestDistance
    ) {

      smallestDistance =
        distance;

      activeMarker =
        marker;
    }

  });


  if (!activeMarker) {
    return;
  }


  const state =
    activeMarker.dataset.state;


  if (
    state &&
    state !== co2CurrentState
  ) {

    co2CurrentState =
      state;

    updateCO2Chart(
      state
    );

  }

}


// -------------------------------------------------------
// Scroll listener
// -------------------------------------------------------

function handleCO2Scroll() {

  if (co2Ticking) {
    return;
  }

  co2Ticking = true;

  window.requestAnimationFrame(
    () => {

      getActiveCO2Step();

      co2Ticking = false;

    }
  );

}


window.addEventListener(
  "scroll",
  handleCO2Scroll,
  { passive: true }
);


window.addEventListener(
  "resize",
  handleCO2Scroll
);


// -------------------------------------------------------
// Initial state
// -------------------------------------------------------

updateCO2Chart(
  "world"
);


setTimeout(() => {

  getActiveCO2Step();

}, 1000);

  // =======================================================
  // 16. INITIAL STATE
  // =======================================================

  updateCO2Chart(
    "world"
  );


})
.catch(error => {

  console.error(
    "Error loading CO₂ data:",
    error
  );

});