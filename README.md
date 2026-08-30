# About this project

**This visualization was created for the Pacific Dataviz Challenge 2026**.

## Data sources

**Sea surface temperature**  
https://stats.pacificdata.org - Sea Surface Temperature anomalies.
Period used: **1920–2020**.

**Sea level**  
https://stats.pacificdata.org - Sea Level Anomalies. 
Period used: **1993–2023**.

**CO₂ emissions per capita**  
https://ourworldindata.org/co2-emissions
Global Carbon Project (2025); population data based on various sources, with processing by **Our World in Data**. Indicator: territorial CO₂ emissions from fossil fuels and industrial processes per person. Period displayed: 1995–2024.


## Technical note


Sea surface temperature and sea level are presented as **anomalies**, meaning differences relative to the reference level defined by each original dataset rather than absolute temperature or sea level.

In both circular visualizations, time moves **clockwise**. Each radial position represents one year, while each point represents an available observation for a Pacific island country or territory. The white reference ring represents an anomaly of zero: negative anomalies are positioned inside the ring and positive anomalies outside it.

For sea level, observations with identical values in the same year are given a small angular displacement to reduce point overlap. This adjustment is purely visual and does not alter the underlying values.

For the global CO₂ comparison, the horizontal axis uses a **square-root transformation** to reduce the visual dominance of very high emitters while preserving their order and the original values shown on the scale. CO₂ emissions refer to territorial emissions from fossil-fuel combustion and industrial processes per person. They do not represent consumption-based emissions.

Data availability varies across indicators, so the set of Pacific island countries and territories represented is not necessarily identical in all three visualizations.


## Tools

Data preparation and analysis: R · tidyverse
Visualization: D3.js · ggplot2
Scrollytelling and publishing: Quarto · Closeread
Deploy: Github pages

