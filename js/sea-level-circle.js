
// =========================================================
// SEA LEVEL CIRCLE — D3
// =========================================================


// =========================================================
// 1. COLOURS
// =========================================================

const slBgCol = "#404044";
const slTextCol = "#effae6";
const slGridCol = "#615c5c";

const slColdCol = "#82b3ae";
const slZeroCol = "#D9DEE5";
const slHotCol = "#EF476F";


// =========================================================
// 2. PARAMETERS
// =========================================================

const slStartYear = 1993;
const slFinalYear = 2023;

const slNYears =
  slFinalYear - slStartYear + 1;


// =========================================================
// 3. CANVAS
// =========================================================

const slWidth = 1000;
const slHeight = 1000;

const slCx = slWidth / 2;
const slCy = slHeight / 2;


// =========================================================
// 4. RADIAL GEOMETRY — D3 PIXELS
// =========================================================

const slZeroRadius = 215;
const slRadialBand = 108;

const slInnerRadius =
  slZeroRadius - slRadialBand - 18;

const slOuterRadius =
  slZeroRadius + slRadialBand + 18;

const slLabelRadius =
  slOuterRadius + 55;


// =========================================================
// 5. RADIAL GEOMETRY — ORIGINAL R SCALE
// =========================================================

const slZeroRadiusR = 1.2;
const slRadialBandR = 0.62;


// =========================================================
// 6. SVG
// =========================================================

const slChartContainer =
  d3.select("#sea-level-chart");

const slSvg =
  slChartContainer
    .append("svg")
    .attr(
      "viewBox",
      `0 0 ${slWidth} ${slHeight}`
    )
    .attr("width", "100%")
    .attr("height", "auto")
    .attr(
      "aria-label",
      "Circular chart of Pacific sea level anomalies from 1993 to 2023"
    )
    .style("display", "block")
    .style("max-width", "950px")
    .style("margin", "0 auto")
    .style("background", slBgCol);


// =========================================================
// 7. TOOLTIP
// =========================================================

const slTooltip =
  d3.select("body")
    .append("div")
    .attr("class", "sl-tooltip")
    .style("position", "absolute")
    .style("pointer-events", "none")
    .style("opacity", 0);


// =========================================================
// 8. LOAD DATA
// =========================================================

d3.csv(
  "data/processed/sea_level_d3.csv",
  d => ({
    territory: d.territory,
    year: +d.year,
    anomaly: +d.anomaly,
    year_index: +d.year_index,
    radius: +d.radius
  })
)
.then(data => {


  // =======================================================
  // 9. MAXIMUM ABSOLUTE ANOMALY
  // =======================================================

  const slMaxAbsAnomaly =
    d3.max(
      data,
      d => Math.abs(d.anomaly)
    );


  // =======================================================
  // 10. SAME YEAR + SAME VALUE
  // =======================================================

  const duplicateGroups =
    d3.group(
      data,
      d => `${d.year}|${d.anomaly}`
    );


  duplicateGroups.forEach(group => {

    const territories =
      group
        .map(d => d.territory)
        .sort(
          (a, b) =>
            a.localeCompare(b)
        );


    group.sort(
      (a, b) =>
        a.territory.localeCompare(
          b.territory
        )
    );


    const n =
      group.length;


    group.forEach(
      (d, i) => {

        // Lista completa para o tooltip
        d.territories =
          territories;


        // -------------------------------------------------
        // Pequeno deslocamento angular
        //
        // Mantém os pontos visualmente separados,
        // mas muito próximos uns dos outros,
        // como no gráfico original em R.
        // -------------------------------------------------

        if (n === 1) {

          d.angleOffsetYear = 0;

        } else {

          d.angleOffsetYear =
            -0.035 +
            (
              i /
              (n - 1)
            ) *
            0.07;

        }


        d.yearPosition =
          d.year_index +
          d.angleOffsetYear;

      }
    );

  });


  // =======================================================
  // 11. SCALES
  // =======================================================

  const slAngleScale =
    d3.scaleLinear()
      .domain([
        1,
        slNYears + 1
      ])
      .range([
        -Math.PI / 2,
        3 * Math.PI / 2
      ]);


  const slColourScale =
    d3.scaleLinear()
      .domain([
        -slMaxAbsAnomaly,
        0,
        slMaxAbsAnomaly
      ])
      .range([
        slColdCol,
        slZeroCol,
        slHotCol
      ])
      .clamp(true);


  // =======================================================
  // 12. RADIUS: R SCALE -> D3 PIXELS
  // =======================================================

  const slRadiusFromR =
    d3.scaleLinear()
      .domain([
        slZeroRadiusR - slRadialBandR,
        slZeroRadiusR + slRadialBandR
      ])
      .range([
        slZeroRadius - slRadialBand,
        slZeroRadius + slRadialBand
      ]);


  // =======================================================
  // 13. MAIN GROUP
  // =======================================================

  const slG =
    slSvg
      .append("g")
      .attr(
        "transform",
        `translate(${slCx}, ${slCy})`
      );


  // =======================================================
  // 14. YEARS
  // =======================================================

  const slYears =
    d3.range(
      slStartYear,
      slFinalYear + 1
    );


  // =======================================================
  // 15. YEAR RAYS
  // =======================================================

  slG.selectAll(".sl-year-ray")
    .data(slYears)
    .join("line")
    .attr(
      "class",
      "sl-year-ray"
    )

    .attr("x1", d => {

      const yearIndex =
        d - slStartYear + 1;

      const angle =
        slAngleScale(yearIndex);

      return (
        Math.cos(angle) *
        slInnerRadius
      );

    })

    .attr("y1", d => {

      const yearIndex =
        d - slStartYear + 1;

      const angle =
        slAngleScale(yearIndex);

      return (
        Math.sin(angle) *
        slInnerRadius
      );

    })

    .attr("x2", d => {

      const yearIndex =
        d - slStartYear + 1;

      const angle =
        slAngleScale(yearIndex);

      return (
        Math.cos(angle) *
        slOuterRadius
      );

    })

    .attr("y2", d => {

      const yearIndex =
        d - slStartYear + 1;

      const angle =
        slAngleScale(yearIndex);

      return (
        Math.sin(angle) *
        slOuterRadius
      );

    })

    .attr(
      "stroke",
      slGridCol
    )

    .attr(
      "stroke-opacity",
      0.5
    )

    .attr(
      "stroke-width",
      0.7
    );


  // =======================================================
  // 16. INNER GUIDE
  // =======================================================

  slG.append("circle")
    .attr(
      "r",
      slInnerRadius
    )
    .attr(
      "fill",
      "none"
    )
    .attr(
      "stroke",
      slGridCol
    )
    .attr(
      "stroke-opacity",
      0.3
    )
    .attr(
      "stroke-width",
      1
    );


  // =======================================================
  // 17. OUTER GUIDE
  // =======================================================

  slG.append("circle")
    .attr(
      "r",
      slOuterRadius
    )
    .attr(
      "fill",
      "none"
    )
    .attr(
      "stroke",
      slGridCol
    )
    .attr(
      "stroke-opacity",
      0.3
    )
    .attr(
      "stroke-width",
      1
    );


  // =======================================================
  // 18. ZERO RING
  // =======================================================

  slG.append("circle")
    .attr(
      "r",
      slZeroRadius
    )
    .attr(
      "fill",
      "none"
    )
    .attr(
      "stroke",
      slTextCol
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
  // 19. POINTS
  // =======================================================

  const slPoints =
    slG
      .selectAll(".sl-point")
      .data(data)
      .join("circle")

      .attr(
        "class",
        "sl-point"
      )

      .attr("cx", d => {

        const angle =
          slAngleScale(
            d.yearPosition
          );

        const radius =
          slRadiusFromR(
            d.radius
          );

        return (
          Math.cos(angle) *
          radius
        );

      })

      .attr("cy", d => {

        const angle =
          slAngleScale(
            d.yearPosition
          );

        const radius =
          slRadiusFromR(
            d.radius
          );

        return (
          Math.sin(angle) *
          radius
        );

      })

      .attr(
        "r",
        4.7
      )

      .attr(
        "fill",
        d =>
          slColourScale(
            d.anomaly
          )
      )

      .attr(
        "fill-opacity",
        0.92
      )

      .attr(
        "stroke",
        "black"
      )

      .attr(
        "stroke-width",
        0.35
      )

      .attr(
        "opacity",
        0
      );


  // =======================================================
  // 20. TOOLTIP EVENTS
  // =======================================================

  slPoints

    .on(
      "mouseenter",
      function(event, d) {

        d3.select(this)
          .interrupt()
          .attr(
            "r",
            6.5
          )
          .attr(
            "stroke-width",
            0.8
          );


        slTooltip
          .style(
            "opacity",
            1
          )

          .html(`
            <div class="tooltip-territory">
              Sea level anomaly
            </div>

            <div class="tooltip-row">
              <span>Year</span>
              <strong>
                ${d.year}
              </strong>
            </div>

            <div class="tooltip-row">
              <span>Value</span>
              <strong>
                ${
                  d.anomaly > 0
                    ? "+"
                    : ""
                }${d.anomaly.toFixed(2)}
              </strong>
            </div>

            <div class="tooltip-territories">

              <span>
                Territories
              </span>

              <div class="tooltip-territory-list">

                ${d.territories
                  .map(
                    territory =>
                      `<div>${territory}</div>`
                  )
                  .join("")}

              </div>

            </div>
          `);

      }
    )


    .on(
      "mousemove",
      function(event) {

        slTooltip
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
            4.7
          )
          .attr(
            "stroke-width",
            0.35
          );

        slTooltip
          .style(
            "opacity",
            0
          );

      }
    );


  // =======================================================
  // 21. YEAR LABELS
  // =======================================================

  const slLabelYears =
    d3.range(
      slStartYear,
      slFinalYear + 1,
      2
    );


  slG.selectAll(".sl-year-label")
    .data(slLabelYears)
    .join("text")

    .attr(
      "class",
      "sl-year-label"
    )

    .attr("x", d => {

      const yearIndex =
        d - slStartYear + 1;

      const angle =
        slAngleScale(
          yearIndex
        );

      return (
        Math.cos(angle) *
        slLabelRadius
      );

    })

    .attr("y", d => {

      const yearIndex =
        d - slStartYear + 1;

      const angle =
        slAngleScale(
          yearIndex
        );

      return (
        Math.sin(angle) *
        slLabelRadius
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
      slTextCol
    )

    .style(
      "font-family",
      "'Rubik', sans-serif"
    )

    .style(
      "font-size",
      "20px"
    )

    .style(
      "font-weight",
      "400"
    )

    .text(
      d => d
    );


  // =======================================================
  // 22. UPDATE FUNCTION
  // =======================================================

  function updateSeaLevelChart(
    endYear
  ) {

    slPoints
      .interrupt()

      .transition()

      .duration(
        500
      )

      .attr(
        "opacity",
        d =>
          d.year <= endYear
            ? 0.92
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
  // 23. TEST BUTTONS
  // =======================================================

  const slTestButtons =
    d3.selectAll(
      ".sl-test-buttons button"
    );


  if (
    !slTestButtons.empty()
  ) {

    slTestButtons
      .on(
        "click",
        function() {

          const year =
            +this.dataset.year;

          updateSeaLevelChart(
            year
          );

        }
      );

  }


// =======================================================
// 24. CLOSE-READ SCROLL
// =======================================================

let slCurrentYear = 2000;
let slTicking = false;


function getActiveSeaLevelStep() {

  const markers = Array.from(
    document.querySelectorAll(
      ".sl-marker[data-year]"
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


  const year =
    Number(
      activeMarker.dataset.year
    );


  if (
    Number.isFinite(year) &&
    year !== slCurrentYear
  ) {

    slCurrentYear =
      year;

    updateSeaLevelChart(
      year
    );

  }

}


// -------------------------------------------------------
// Scroll listener
// -------------------------------------------------------

function handleSeaLevelScroll() {

  if (slTicking) {
    return;
  }

  slTicking = true;

  window.requestAnimationFrame(
    () => {

      getActiveSeaLevelStep();

      slTicking = false;

    }
  );

}


window.addEventListener(
  "scroll",
  handleSeaLevelScroll,
  { passive: true }
);


window.addEventListener(
  "resize",
  handleSeaLevelScroll
);


// -------------------------------------------------------
// Initial state
// -------------------------------------------------------

updateSeaLevelChart(
  2000
);


setTimeout(() => {

  getActiveSeaLevelStep();

}, 1000);

})
.catch(error => {

  console.error(
    "Error loading sea level data:",
    error
  );

});