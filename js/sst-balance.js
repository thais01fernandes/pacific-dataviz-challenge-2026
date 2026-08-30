// =========================================================
// SST BALANCE — STATIC CUMULATIVE CHARTS FOR EACH STEP
// =========================================================


// =========================================================
// 1. COLOURS
// =========================================================

const sbBgCol = "#404044";
const sbTextCol = "#effae6";
const sbGridCol = "#615c5c";

const sbNegativeCol = "#82b3ae";
const sbPositiveCol = "#EF476F";


// =========================================================
// 2. YEARS
// =========================================================

const sbYears = [
  1940,
  1960,
  1980,
  2000,
  2020
];


// =========================================================
// 3. DIMENSIONS
// =========================================================

const sbWidth = 720;
const sbHeight = 430;

const sbMargin = {
  top: 55,
  right: 75,
  bottom: 65,
  left: 85
};

const sbInnerWidth =
  sbWidth -
  sbMargin.left -
  sbMargin.right;

const sbInnerHeight =
  sbHeight -
  sbMargin.top -
  sbMargin.bottom;


// =========================================================
// 4. TOOLTIP
// =========================================================

const sbTooltip =
  d3.select("body")
    .append("div")
    .attr(
      "class",
      "sst-balance-tooltip"
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
  "data/processed/sst_balance_d3.csv",

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

  const sbMaxCount =
    d3.max(
      anomalyData,
      d => d.count
    );


  // =======================================================
  // 8. RENDER ONE CHART
  // =======================================================

  function renderSSTBalance(
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
          `0 0 ${sbWidth} ${sbHeight}`
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
          sbBgCol
        );



    // -------------------------------------------------------
    // GRAPH GROUP
    // -------------------------------------------------------

    const g =
      svg
        .append("g")
        .attr(
          "transform",
          `translate(${sbMargin.left}, ${sbMargin.top})`
        );


    // -------------------------------------------------------
    // X SCALE
    // -------------------------------------------------------

    const x =
      d3.scaleLinear()
        .domain([
          -sbMaxCount,
          sbMaxCount
        ])
        .range([
          0,
          sbInnerWidth
        ])
        .nice();


    // -------------------------------------------------------
    // Y SCALE
    // -------------------------------------------------------

    const y =
      d3.scalePoint()
        .domain(
          sbYears
        )
        .range([
          0,
          sbInnerHeight
        ])
        .padding(
          0.45
        );


    // =====================================================
    // 9. HORIZONTAL GUIDES
    // =====================================================

    g
      .selectAll(
        ".sb-year-guide"
      )
      .data(
        sbYears
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
        sbInnerWidth
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
        sbGridCol
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
        ".sb-year-label"
      )
      .data(
        sbYears
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
        sbTextCol
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
          `translate(0, ${sbInnerHeight})`
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
        sbGridCol
      );


    axis
      .selectAll(
        ".tick line"
      )
      .attr(
        "stroke",
        sbGridCol
      );


    axis
      .selectAll(
        ".tick text"
      )
      .attr(
        "fill",
        sbTextCol
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

    function getYearData(
      year
    ) {

      const yearData =
        anomalyData.filter(
          d =>
            d.year === year
        );


      return {

        negative:
          yearData.find(
            d =>
              d.direction ===
              "negative"
          ),

        positive:
          yearData.find(
            d =>
              d.direction ===
              "positive"
          )

      };

    }


    function getPointX(
      d
    ) {

      if (
        d.direction ===
        "negative"
      ) {

        return x(
          -d.count
        );

      }

      return x(
        d.count
      );

    }


    function getColour(
      direction
    ) {

      return (
        direction ===
        "negative"
      )
        ? sbNegativeCol
        : sbPositiveCol;

    }


    function getTitle(
      direction
    ) {

      return (
        direction ===
        "negative"
      )
        ? "Below zero"
        : "Above zero";

    }


    // =====================================================
    // 13. DRAW EACH YEAR
    // =====================================================

    sbYears.forEach(
      year => {


        // Future years stay empty
        if (
          year > endYear
        ) {

          return;

        }


        const yearData =
          getYearData(
            year
          );


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
            x(
              -negative
            )
          )
          .attr(
            "x2",
            x(
              positive
            )
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
            sbGridCol
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
              `.sb-point-${year}`
            )
            .data(
              values
            )
            .join(
              "circle"
            )
            .attr(
              "class",
              `sb-point-${year}`
            )
            .attr(
              "cx",
              d =>
                getPointX(d)
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
              d =>
                getColour(
                  d.direction
                )
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
            `.sb-count-${year}`
          )
          .data(
            values
          )
          .join(
            "text"
          )
          .attr(
            "class",
            `sb-count-${year}`
          )
          .attr(
            "x",
            d => {

              const pointX =
                getPointX(d);

              return (
                d.direction ===
                "negative"
              )
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
              d.direction ===
              "negative"
                ? "end"
                : "start"
          )
          .attr(
            "dominant-baseline",
            "middle"
          )
          .attr(
            "fill",
            d =>
              getColour(
                d.direction
              )
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
                .attr(
                  "r",
                  11
                );


              sbTooltip
                .style(
                  "opacity",
                  1
                )
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

              sbTooltip
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
                .attr(
                  "r",
                  8
                );


              sbTooltip
                .style(
                  "opacity",
                  0
                );

            }
          );

      }
    );

  }


  // =======================================================
  // 15. RENDER EVERY STEP
  // =======================================================

  document
    .querySelectorAll(
      ".sst-balance-chart[data-year]"
    )
    .forEach(
      container => {

        const endYear =
          Number(
            container.dataset.year
          );

        renderSSTBalance(
          container,
          endYear
        );

      }
    );


})

.catch(error => {

  console.error(
    "Error loading SST balance data:",
    error
  );

});
