// =========================================================
// SEA LEVEL BALANCE — STATIC CUMULATIVE CHARTS FOR EACH STEP
// =========================================================


// =========================================================
// 1. COLOURS
// =========================================================

const slbBgCol = "#404044";
const slbTextCol = "#effae6";
const slbGridCol = "#615c5c";

const slbNegativeCol = "#82b3ae";
const slbPositiveCol = "#EF476F";


// =========================================================
// 2. YEARS
// =========================================================

const slbYears = [
  1993,
  2000,
  2008,
  2015,
  2023
];


// =========================================================
// 3. DIMENSIONS
// =========================================================

const slbWidth = 720;
const slbHeight = 390;

const slbMargin = {
  top: 55,
  right: 75,
  bottom: 65,
  left: 85
};

const slbInnerWidth =
  slbWidth -
  slbMargin.left -
  slbMargin.right;

const slbInnerHeight =
  slbHeight -
  slbMargin.top -
  slbMargin.bottom;


// =========================================================
// 4. TOOLTIP
// =========================================================

const slbTooltip =
  d3.select("body")
    .append("div")
    .attr(
      "class",
      "sea-level-balance-tooltip"
    )
    .style(
      "position",
      "absolute"
    )
    .style(
      "pointer-events",
      "none"
    )
    .style(
      "opacity",
      0
    );


// =========================================================
// 5. LOAD DATA
// =========================================================

d3.csv(
  "data/processed/sea_level_balance_d3.csv",

  d => ({
    year: +d.year,
    direction: d.direction,
    count: +d.count,

    territories:
      d.territories
        ? d.territories
            .split("|")
            .filter(Boolean)
        : []
  })
)

.then(data => {


  // =======================================================
  // 6. KEEP ONLY NEGATIVE AND POSITIVE
  // =======================================================

  const anomalyData =
    data.filter(
      d =>
        d.direction === "negative" ||
        d.direction === "positive"
    );


  // =======================================================
  // 7. GLOBAL MAXIMUM
  // =======================================================

  const slbMaxCount =
    d3.max(
      anomalyData,
      d => d.count
    );


  // =======================================================
  // 8. RENDER ONE CHART
  // =======================================================

  function renderSeaLevelBalance(
    container,
    endYear
  ) {


    // -------------------------------------------------------
    // SVG
    // -------------------------------------------------------

    const svg =
      d3.select(container)
        .append("svg")
        .attr(
          "viewBox",
          `0 0 ${slbWidth} ${slbHeight}`
        )
        .attr(
          "width",
          "100%"
        )
        .attr(
          "height",
          "auto"
        )
        .style(
          "display",
          "block"
        )
        .style(
          "background",
          slbBgCol
        );

    // -------------------------------------------------------
    // GRAPH GROUP
    // -------------------------------------------------------

    const g =
      svg
        .append("g")
        .attr(
          "transform",
          `translate(${slbMargin.left}, ${slbMargin.top})`
        );


    // -------------------------------------------------------
    // X SCALE
    // -------------------------------------------------------

    const x =
      d3.scaleLinear()
        .domain([
          -slbMaxCount,
          slbMaxCount
        ])
        .range([
          0,
          slbInnerWidth
        ])
        .nice();


    // -------------------------------------------------------
    // Y SCALE
    // -------------------------------------------------------

    const y =
      d3.scalePoint()
        .domain(
          slbYears
        )
        .range([
          0,
          slbInnerHeight
        ])
        .padding(
          0.45
        );


    // =====================================================
    // 9. HORIZONTAL GUIDES
    // =====================================================

    g
      .selectAll(
        ".slb-year-guide"
      )
      .data(
        slbYears
      )
      .join(
        "line"
      )
      .attr(
        "x1",
        0
      )
      .attr(
        "x2",
        slbInnerWidth
      )
      .attr(
        "y1",
        d => y(d)
      )
      .attr(
        "y2",
        d => y(d)
      )
      .attr(
        "stroke",
        slbGridCol
      )
      .attr(
        "stroke-width",
        0.7
      )
      .attr(
        "stroke-opacity",
        0.35
      );


    // =====================================================
    // 10. YEAR LABELS
    // =====================================================

    g
      .selectAll(
        ".slb-year-label"
      )
      .data(
        slbYears
      )
      .join(
        "text"
      )
      .attr(
        "x",
        -20
      )
      .attr(
        "y",
        d => y(d)
      )
      .attr(
        "text-anchor",
        "end"
      )
      .attr(
        "dominant-baseline",
        "middle"
      )
      .attr(
        "fill",
        slbTextCol
      )
      .style(
        "font-family",
        "'Rubik', sans-serif"
      )
      .style(
        "font-size",
        "18px"
      )
      .text(
        d => d
      );


    // =====================================================
    // 11. X AXIS
    // =====================================================

    const xAxis =
      d3.axisBottom(
        x
      )
      .ticks(
        7
      )
      .tickFormat(
        d => d
      );


    const axis =
      g
        .append("g")
        .attr(
          "transform",
          `translate(0, ${slbInnerHeight})`
        )
        .call(
          xAxis
        );


    axis
      .select(
        ".domain"
      )
      .attr(
        "stroke",
        slbGridCol
      );


    axis
      .selectAll(
        ".tick line"
      )
      .attr(
        "stroke",
        slbGridCol
      );


    axis
      .selectAll(
        ".tick text"
      )
      .attr(
        "fill",
        slbTextCol
      )
      .style(
        "font-family",
        "'Rubik', sans-serif"
      )
      .style(
        "font-size",
        "15px"
      );


    // =====================================================
    // 12. HELPERS
    // =====================================================

    function getYearData(year) {

      const yearData =
        anomalyData.filter(
          d => d.year === year
        );

      return {
        negative:
          yearData.find(
            d => d.direction === "negative"
          ),
        positive:
          yearData.find(
            d => d.direction === "positive"
          )
      };

    }


    function getPointX(d) {

      if (d.direction === "negative") {
        return x(-d.count);
      }

      return x(d.count);

    }


    function getColour(direction) {

      return direction === "negative"
        ? slbNegativeCol
        : slbPositiveCol;

    }


    function getTitle(direction) {

      return direction === "negative"
        ? "Below zero"
        : "Above zero";

    }


    // =====================================================
    // 13. DRAW EACH YEAR
    // =====================================================

    slbYears.forEach(year => {

      if (year > endYear) {
        return;
      }

      const yearData =
        getYearData(year);

      const negative =
        yearData.negative
          ? yearData.negative.count
          : 0;

      const positive =
        yearData.positive
          ? yearData.positive.count
          : 0;

      const values = [
        yearData.negative,
        yearData.positive
      ]
      .filter(
        d =>
          d &&
          d.count > 0
      );


      // ---------------------------------------------------
      // CONNECTING LINE
      // ---------------------------------------------------

      g
        .append("line")
        .attr(
          "x1",
          x(-negative)
        )
        .attr(
          "x2",
          x(positive)
        )
        .attr(
          "y1",
          y(year)
        )
        .attr(
          "y2",
          y(year)
        )
        .attr(
          "stroke",
          slbGridCol
        )
        .attr(
          "stroke-width",
          2.5
        )
        .attr(
          "stroke-opacity",
          0.65
        );


      // ---------------------------------------------------
      // POINTS
      // ---------------------------------------------------

      const points =
        g
          .selectAll(
            `.slb-point-${year}`
          )
          .data(values)
          .join("circle")
          .attr(
            "class",
            `slb-point-${year}`
          )
          .attr(
            "cx",
            d => getPointX(d)
          )
          .attr(
            "cy",
            y(year)
          )
          .attr(
            "r",
            8
          )
          .attr(
            "fill",
            d => getColour(d.direction)
          )
          .attr(
            "stroke",
            "#202024"
          )
          .attr(
            "stroke-width",
            0.6
          )
          .attr(
            "opacity",
            0.95
          );


      // ---------------------------------------------------
      // VALUES
      // ---------------------------------------------------

      g
        .selectAll(
          `.slb-count-${year}`
        )
        .data(values)
        .join("text")
        .attr(
          "class",
          `slb-count-${year}`
        )
        .attr(
          "x",
          d => {
            const pointX = getPointX(d);

            return d.direction === "negative"
              ? pointX - 14
              : pointX + 14;
          }
        )
        .attr(
          "y",
          y(year)
        )
        .attr(
          "text-anchor",
          d =>
            d.direction === "negative"
              ? "end"
              : "start"
        )
        .attr(
          "dominant-baseline",
          "middle"
        )
        .attr(
          "fill",
          d => getColour(d.direction)
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
          "600"
        )
        .text(
            d => d.count
          );



      // ===================================================
      // 14. TOOLTIP
      // ===================================================

      points
        .on(
          "mouseenter",
          function(event, d) {

            d3.select(this)
              .attr("r", 11);

            slbTooltip
              .style("opacity", 1)
              .html(`
                <div class="tooltip-territory">
                  ${getTitle(d.direction)}
                </div>

                <div class="tooltip-row">
                  <span>Year</span>
                  <strong>${d.year}</strong>
                </div>

                <div class="tooltip-row">
                  <span>Territories</span>
                  <strong>${d.count}</strong>
                </div>

                <div class="tooltip-territories">
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

            slbTooltip
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
              .attr("r", 8);

            slbTooltip
              .style("opacity", 0);

          }
        );

    });

  }


  // =======================================================
  // 15. RENDER EVERY STEP
  // =======================================================

  document
    .querySelectorAll(
      ".sea-level-balance-chart[data-year]"
    )
    .forEach(container => {

      const endYear =
        Number(container.dataset.year);

      renderSeaLevelBalance(
        container,
        endYear
      );

    });

})

.catch(error => {

  console.error(
    "Error loading sea level balance data:",
    error
  );

});