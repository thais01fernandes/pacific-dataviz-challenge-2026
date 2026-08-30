// =========================================================
// SST CIRCLE — D3
// =========================================================


// =========================================================
// 1. COLOURS
// =========================================================

const bgCol = "#404044";
const textCol = "#effae6";
const gridCol = "#615c5c";

const coldCol = "#82b3ae";
const zeroCol = "#D9DEE5";
const hotCol = "#EF476F";


// =========================================================
// 2. PARAMETERS
// =========================================================

const startYear = 1920;
const finalYear = 2020;

const nYears = finalYear - startYear + 1;


// =========================================================
// 3. CANVAS
// =========================================================

const width = 1000;
const height = 1000;

const cx = width / 2;
const cy = height / 2;


// =========================================================
// 4. RADIAL GEOMETRY
// =========================================================

// White zero-anomaly ring
const zeroRadius = 225;

// Space used by negative and positive anomalies
const radialBand = 120;

// Inner and outer guides
const innerRadius =
  zeroRadius - radialBand - 18;

const outerRadius =
  zeroRadius + radialBand + 18;

// Position of year labels
const labelRadius =
  outerRadius + 48;


// =========================================================
// 5. SVG
// =========================================================

const chartContainer = d3.select("#sst-chart");

const svg = chartContainer
  .append("svg")
  .attr(
    "viewBox",
    `0 0 ${width} ${height}`
  )
  .attr("width", "100%")
  .attr("height", "auto")
  .attr(
    "aria-label",
    "Circular chart of Pacific sea surface temperature anomalies from 1920 to 2020"
  )
  .style("display", "block")
  .style("max-width", "950px")
  .style("margin", "0 auto")
  .style("background", bgCol)
  .style("font-size","50px");


// =========================================================
// 6. TOOLTIP
// =========================================================

const tooltip = d3
  .select("body")
  .append("div")
  .attr("class", "sst-tooltip")
  .style("position", "absolute")
  .style("pointer-events", "none")
  .style("opacity", 0);


// =========================================================
// 7. LOAD DATA
// =========================================================

d3.csv(
  "data/processed/sst_d3.csv",
  d => ({
    territory: d.territory,
    year: +d.year,
    anomaly: +d.anomaly,
    year_index: +d.year_index,
    radius_r: +d.radius
  })
)
.then(data => {


  // =======================================================
  // 8. MAXIMUM ABSOLUTE ANOMALY
  // =======================================================

  const maxAbsAnomaly = d3.max(
    data,
    d => Math.abs(d.anomaly)
  );


  // =======================================================
  // 9. SCALES
  // =======================================================

  const angleScale = d3
    .scaleLinear()
    .domain([
      1,
      nYears + 1
    ])
    .range([
      -Math.PI / 2,
      3 * Math.PI / 2
    ]);


  const radiusScale = d3
    .scaleLinear()
    .domain([
      -maxAbsAnomaly,
      maxAbsAnomaly
    ])
    .range([
      zeroRadius - radialBand,
      zeroRadius + radialBand
    ]);


  const colourScale = d3
    .scaleLinear()
    .domain([
      -maxAbsAnomaly,
      0,
      maxAbsAnomaly
    ])
    .range([
      coldCol,
      zeroCol,
      hotCol
    ])
    .clamp(true);


  // =======================================================
  // 10. MAIN GROUP
  // =======================================================

  const g = svg
    .append("g")
    .attr(
      "transform",
      `translate(${cx}, ${cy})`
    );


  // =======================================================
  // 11. YEARS
  // =======================================================

  const years = d3.range(
    startYear,
    finalYear + 1
  );


  // =======================================================
  // 12. YEAR RAYS
  // =======================================================

  g.selectAll(".year-ray")
    .data(years)
    .join("line")
    .attr(
      "class",
      "year-ray"
    )

    .attr("x1", d => {

      const yearIndex =
        d - startYear + 1;

      const angle =
        angleScale(yearIndex);

      return (
        Math.cos(angle) *
        innerRadius
      );

    })

    .attr("y1", d => {

      const yearIndex =
        d - startYear + 1;

      const angle =
        angleScale(yearIndex);

      return (
        Math.sin(angle) *
        innerRadius
      );

    })

    .attr("x2", d => {

      const yearIndex =
        d - startYear + 1;

      const angle =
        angleScale(yearIndex);

      return (
        Math.cos(angle) *
        outerRadius
      );

    })

    .attr("y2", d => {

      const yearIndex =
        d - startYear + 1;

      const angle =
        angleScale(yearIndex);

      return (
        Math.sin(angle) *
        outerRadius
      );

    })

    .attr(
      "stroke",
      gridCol
    )

    .attr(
      "stroke-opacity",
      0.55
    )

    .attr(
      "stroke-width",
      0.7
    );


  // =======================================================
  // 13. INNER GUIDE
  // =======================================================

  g.append("circle")
    .attr(
      "r",
      innerRadius
    )
    .attr(
      "fill",
      "none"
    )
    .attr(
      "stroke",
      gridCol
    )
    .attr(
      "stroke-opacity",
      0.35
    )
    .attr(
      "stroke-width",
      1
    );


  // =======================================================
  // 14. OUTER GUIDE
  // =======================================================

  g.append("circle")
    .attr(
      "r",
      outerRadius
    )
    .attr(
      "fill",
      "none"
    )
    .attr(
      "stroke",
      gridCol
    )
    .attr(
      "stroke-opacity",
      0.35
    )
    .attr(
      "stroke-width",
      1
    );


  // =======================================================
  // 15. ZERO-ANOMALY RING
  // =======================================================

  g.append("circle")
    .attr(
      "r",
      zeroRadius
    )
    .attr(
      "fill",
      "none"
    )
    .attr(
      "stroke",
      textCol
    )
    .attr(
      "stroke-opacity",
      0.65
    )
    .attr(
      "stroke-width",
      2
    );


  // =======================================================
  // 16. SST POINTS
  // =======================================================

  const points = g
    .selectAll(".sst-point")
    .data(data)
    .join("circle")

    .attr(
      "class",
      "sst-point"
    )

    .attr("cx", d => {

      const angle =
        angleScale(
          d.year_index
        );

      const radius =
        radiusScale(
          d.anomaly
        );

      return (
        Math.cos(angle) *
        radius
      );

    })

    .attr("cy", d => {

      const angle =
        angleScale(
          d.year_index
        );

      const radius =
        radiusScale(
          d.anomaly
        );

      return (
        Math.sin(angle) *
        radius
      );

    })

    .attr(
      "r",
      5.2
    )

    .attr(
      "fill",
      d =>
        colourScale(
          d.anomaly
        )
    )

    .attr(
      "stroke",
      "black"
    )

    .attr(
      "stroke-width",
      0.8
    )

    // Start hidden.
    // updateChart() controls visibility.
    .attr(
      "opacity",
      0
    );


  // =======================================================
  // 17. TOOLTIP EVENTS
  // =======================================================

  points

    .on(
      "mouseenter",
      function(event, d) {

        d3.select(this)
          .interrupt()
          .attr(
            "r",
            8
          )
          .attr(
            "stroke-width",
            1.4
          );

        tooltip
          .style(
            "opacity",
            1
          )

          .html(`
            <div class="tooltip-territory">
              ${d.territory}
            </div>

            <div class="tooltip-row">
              <span>Year</span>
              <strong>
                ${d.year}
              </strong>
            </div>

            <div class="tooltip-row">
              <span>SST anomaly</span>

              <strong>
                ${
                  d.anomaly > 0
                    ? "+"
                    : ""
                }${d.anomaly.toFixed(2)} °C
              </strong>
            </div>
          `);

      }
    )


    .on(
      "mousemove",
      function(event) {

        tooltip
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
            "r",
            4.5
          )
          .attr(
            "stroke-width",
            0.8
          );

        tooltip
          .style(
            "opacity",
            0
          );

      }
    );


  // =======================================================
  // 18. YEAR LABELS
  // =======================================================

  const labelYears = d3.range(
    startYear,
    finalYear,
    5
  );


  g.selectAll(".year-label")
    .data(labelYears)
    .join("text")

    .attr(
      "class",
      "year-label"
    )

    .attr("x", d => {

      const yearIndex =
        d - startYear + 1;

      const angle =
        angleScale(
          yearIndex
        );

      return (
        Math.cos(angle) *
        labelRadius
      );

    })

    .attr("y", d => {

      const yearIndex =
        d - startYear + 1;

      const angle =
        angleScale(
          yearIndex
        );

      return (
        Math.sin(angle) *
        labelRadius
      );

    })

    .attr(
      "text-anchor",
      "middle"
    )

    .attr(
      "dominant-baseline",
      "middle"
    )

    .attr(
      "fill",
      textCol
    )

    .style(
      "font-family",
      "'Rubik', sans-serif"
    )

    .style(
      "font-size",
      "17px"
    )

    .style(
      "font-weight",
      "400"
    )

    .text(
      d => d
    );


  // =======================================================
  // 19. UPDATE FUNCTION
  // =======================================================

  function updateChart(
    endYear
  ) {

    points
      .interrupt()

      .transition()

      .duration(
        500
      )

      .attr(
        "opacity",
        d =>
          d.year <= endYear
            ? 0.9
            : 0
      )

      .style(
        "pointer-events",
        d =>
          d.year <= endYear
            ? "auto"
            : "none"
      );

  }


  // =======================================================
  // 20. TEST BUTTONS
  // =======================================================

  // Allows the same JS file to work
  // inside sst-d3-test.qmd.

  const testButtons =
    d3.selectAll(
      ".sst-test-buttons button"
    );


  if (
    !testButtons.empty()
  ) {

    testButtons
      .on(
        "click",
        function() {

          const year =
            +this.dataset.year;

          updateChart(
            year
          );

        }
      );

  }



// =======================================================
// 21. CLOSE-READ SCROLL STEPS
// =======================================================

let currentYear = 1940;
let ticking = false;


// -------------------------------------------------------
// Find active Closeread narrative
// -------------------------------------------------------

function getActiveStep() {

  const markers = Array.from(
    document.querySelectorAll(
      ".sst-marker[data-year]"
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

    // Closeread may wrap the content inside .trigger.
    // If so, use that entire narrative block.
    const element =
      marker.closest(".trigger") ||
      marker.parentElement;

    const rect =
      element.getBoundingClientRect();

    const center =
      rect.top + rect.height / 2;

    const distance =
      Math.abs(
        center - targetY
      );


    if (distance < smallestDistance) {

      smallestDistance =
        distance;

      activeMarker =
        marker;
    }

  });


  if (!activeMarker) {
    return;
  }


  const year =
    Number(
      activeMarker.dataset.year
    );


  if (
    Number.isFinite(year) &&
    year !== currentYear
  ) {

    currentYear = year;

    console.log(
      "SST active year:",
      year
    );

    updateChart(year);
  }

}


// -------------------------------------------------------
// Scroll
// -------------------------------------------------------

function handleScroll() {

  if (ticking) {
    return;
  }

  ticking = true;

  window.requestAnimationFrame(
    () => {

      getActiveStep();

      ticking = false;

    }
  );
}


window.addEventListener(
  "scroll",
  handleScroll,
  { passive: true }
);


window.addEventListener(
  "resize",
  handleScroll
);


// -------------------------------------------------------
// Initial state
// -------------------------------------------------------

updateChart(1940);


// Wait until Closeread finishes building the layout
setTimeout(() => {

  console.log(
    "SST markers found:",
    document.querySelectorAll(
      ".sst-marker[data-year]"
    ).length
  );

  getActiveStep();

}, 1000);

// -------------------------------------------------------
// Scroll
// -------------------------------------------------------

function handleScroll() {

  if (ticking) {
    return;
  }

  ticking = true;

  window.requestAnimationFrame(
    () => {

      getActiveStep();

      ticking = false;

    }
  );

}


window.addEventListener(
  "scroll",
  handleScroll,
  { passive: true }
);


window.addEventListener(
  "resize",
  handleScroll
);


// -------------------------------------------------------
// Initial state
// -------------------------------------------------------

updateChart(1940);


// Closeread precisa de um pequeno tempo para montar o layout
setTimeout(() => {

  console.log(
    "SST steps after Closeread:",
    document.querySelectorAll(
      ".sst-step[data-year]"
    ).length
  );

  getActiveStep();

}, 1000);

// -------------------------------------------------------
// Scroll listener
// -------------------------------------------------------

function handleScroll() {

  if (!ticking) {

    window.requestAnimationFrame(
      () => {

        getActiveStep();

        ticking = false;

      }
    );

    ticking = true;

  }

}


window.addEventListener(
  "scroll",
  handleScroll,
  {
    passive: true
  }
);

window.addEventListener(
  "resize",
  handleScroll
);


// Estado inicial garantido
updateChart(1940);


// Depois que o Closeread terminar de organizar a página,
// tentamos identificar o passo ativo
setTimeout(() => {
  getActiveStep();
}, 200);

})
.catch(error => {

  console.error(
    "Error loading SST data:",
    error
  );

});