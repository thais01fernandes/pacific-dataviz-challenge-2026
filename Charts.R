# =============================================================================
# PACIFIC DATAVIZ 2026 
# ============================================================================

# =============================================================================
# 01. PACKAGES
# =============================================================================

library(tidyverse)
library(readxl)
library(scales)
library(showtext)
library(sysfonts)
library(sf)
library(terra)
library(tidyterra)
library(maptiles)
library(rnaturalearth)
library(rnaturalearthdata)


# =============================================================================
# 02. GLOBAL SETTINGS
# =============================================================================

font_add_google("Rubik", "Rubik")
showtext_auto()

bg_col   <- "#404044"
text_col <- "#effae6"
grid_col <- "#615c5c"

cold_col <- "#82b3ae"
zero_col <- "#D9DEE5"
hot_col  <- "#EF476F"

dir.create(
  "data/processed",
  recursive = TRUE,
  showWarnings = FALSE
)

dir.create(
  "images",
  recursive = TRUE,
  showWarnings = FALSE
)


# =============================================================================
# 03. SEA SURFACE TEMPERATURE — DATA FOR D3
# =============================================================================

sst_start_year <- 1920
sst_final_year <- 2020

sst_raw <- read_excel(
  "data/raw/sea_surface_temperature.xlsx"
) |>
  rename(
    territory = Time
  )

sst_long <- sst_raw |>
  select(
    territory,
    all_of(as.character(sst_start_year:sst_final_year))
  ) |>
  pivot_longer(
    cols = -territory,
    names_to = "year",
    values_to = "anomaly"
  ) |>
  mutate(
    territory = str_squish(territory),
    year = as.integer(year),
    anomaly = as.numeric(anomaly)
  ) |>
  filter(
    !is.na(territory),
    !is.na(anomaly)
  )


# -----------------------------------------------------------------------------
# 03.1 Geometry used by the circular D3 chart
# -----------------------------------------------------------------------------

sst_max_abs_anomaly <- max(
  abs(sst_long$anomaly),
  na.rm = TRUE
)

sst_zero_radius <- 1.2
sst_radial_band <- 0.62

sst_d3 <- sst_long |>
  mutate(
    year_index = year - sst_start_year + 1,
    
    radius =
      sst_zero_radius +
      (anomaly / sst_max_abs_anomaly) *
      sst_radial_band
  ) |>
  select(
    territory,
    year,
    anomaly,
    year_index,
    radius
  )

write_csv(
  sst_d3,
  "data/processed/sst_d3.csv"
)


# -----------------------------------------------------------------------------
# 03.2 SST balance chart
# -----------------------------------------------------------------------------

sst_balance_years <- c(
  1940,
  1960,
  1980,
  2000,
  2020
)

sst_balance <- sst_long |>
  filter(
    year %in% sst_balance_years
  ) |>
  mutate(
    direction = case_when(
      anomaly < 0 ~ "negative",
      anomaly > 0 ~ "positive",
      TRUE        ~ "zero"
    )
  ) |>
  group_by(
    year,
    direction
  ) |>
  summarise(
    count = n(),
    
    territories = paste(
      sort(territory),
      collapse = "|"
    ),
    
    .groups = "drop"
  ) |>
  complete(
    year = sst_balance_years,
    
    direction = c(
      "negative",
      "zero",
      "positive"
    ),
    
    fill = list(
      count = 0,
      territories = ""
    )
  ) |>
  arrange(
    year,
    factor(
      direction,
      levels = c(
        "negative",
        "zero",
        "positive"
      )
    )
  )

write_csv(
  sst_balance,
  "data/processed/sst_balance_d3.csv"
)


# -----------------------------------------------------------------------------
# 03.3 SST legend used in the narrative column
# -----------------------------------------------------------------------------
make_sst_legend <- function(
    min_value = -max_abs_anomaly,
    max_value =  max_abs_anomaly,
    ticks = c(-1.0, -0.5, 0, 0.5, 1.0)
) {
  
  legend_df <- tibble(
    x = seq(min_value, max_value, length.out = 300)
  ) |>
    mutate(
      xend = lead(x),
      y = 1
    ) |>
    filter(!is.na(xend))
  
  
  ggplot(legend_df) +
    
    # barra com "pontas arredondadas"
    geom_segment(
      aes(
        x = x,
        xend = xend,
        y = y,
        yend = y,
        colour = x
      ),
      linewidth = 12,
      lineend = "round"
    ) +
    
    scale_colour_gradient2(
      low = cold_col,
      mid = zero_col,
      high = hot_col,
      midpoint = 0,
      limits = c(min_value, max_value),
      oob = squish,
      guide = "none"
    ) +
    
    # título da legenda
    annotate(
      "text",
      x = min_value - 0.3,
      y = 1.30,
      label = "Temperature Anomaly (°C)",
      hjust = 0,
      face = "bold",
      colour = text_col,
      size = 13
    ) +
    
    # marcas
    geom_segment(
      data = tibble(x = ticks),
      aes(
        x = x,
        xend = x,
        y = 0.86,
        yend = 0.98
      ),
      colour = alpha(text_col, 0.7),
      linewidth = 0.4
    ) +
    
    # labels das marcas
    geom_text(
      data = tibble(
        x = ticks,
        label = ticks,
        family = "Rubik",
      ),
      aes(
        x = x,
        y = 0.65,
        label = label
      ),
      colour = text_col,
      size = 12
    ) +
    
    coord_cartesian(
      xlim = c(min_value - 0.8, max_value + 0.8),
      ylim = c(0.6, 1.45),
      clip = "off"
    ) +
    
    theme_void() +
    
    theme(
      plot.background = element_rect(fill = bg_col, colour = NA),
      panel.background = element_rect(fill = bg_col, colour = NA),
      plot.margin = margin(10, 10, 10, 10)
    )
}

sst_legend <- make_sst_legend()


ggsave(
  filename = "images/legend_grafico_1.png",
  plot = sst_legend,
  width = 3,
  height = 1.5,
  units = "in",
  dpi = 300,
  bg = bg_col
)


# =============================================================================
# 04. SEA LEVEL — DATA FOR D3
# =============================================================================

sl_start_year <- 1993
sl_final_year <- 2023

sl_raw <- read_excel(
  "data/raw/sea_level_anomalies.xlsx"
) |>
  rename(
    territory = Time
  )

sl_long <- sl_raw |>
  select(
    territory,
    all_of(as.character(sl_start_year:sl_final_year))
  ) |>
  pivot_longer(
    cols = -territory,
    names_to = "year",
    values_to = "anomaly"
  ) |>
  mutate(
    territory = str_squish(territory),
    year = as.integer(year),
    anomaly = as.numeric(anomaly)
  ) |>
  filter(
    !is.na(territory),
    !is.na(anomaly)
  )


# -----------------------------------------------------------------------------
# 04.1 Geometry used by the circular D3 chart
# -----------------------------------------------------------------------------

sl_max_abs_anomaly <- max(
  abs(sl_long$anomaly),
  na.rm = TRUE
)

sl_zero_radius <- 1.2
sl_radial_band <- 0.62

sl_d3 <- sl_long |>
  group_by(
    year,
    anomaly
  ) |>
  arrange(
    territory
  ) |>
  mutate(
    n_same = n(),
    tie_index = row_number(),
    
    angle_offset = if_else(
      n_same == 1,
      0,
      scales::rescale(
        tie_index,
        to = c(-0.07, 0.07)
      )
    )
  ) |>
  ungroup() |>
  mutate(
    year_index =
      year -
      sl_start_year +
      1,
    
    year_position =
      year_index +
      angle_offset,
    
    radius =
      sl_zero_radius +
      (anomaly / sl_max_abs_anomaly) *
      sl_radial_band
  ) |>
  select(
    territory,
    year,
    anomaly,
    year_index,
    radius
  )

write_csv(
  sl_d3,
  "data/processed/sea_level_d3.csv"
)


# -----------------------------------------------------------------------------
# 04.2 Sea level balance chart
# -----------------------------------------------------------------------------
#
# 1993 is included in the data so the first narrative state (2000)
# can already display both 1993 and 2000.
# -----------------------------------------------------------------------------

sl_balance_years <- c(
  1993,
  2000,
  2008,
  2015,
  2023
)

sl_balance <- sl_long |>
  filter(
    year %in% sl_balance_years
  ) |>
  mutate(
    direction = case_when(
      anomaly < 0 ~ "negative",
      anomaly > 0 ~ "positive",
      TRUE        ~ "zero"
    )
  ) |>
  group_by(
    year,
    direction
  ) |>
  summarise(
    count = n(),
    
    territories = paste(
      sort(territory),
      collapse = "|"
    ),
    
    .groups = "drop"
  ) |>
  complete(
    year = sl_balance_years,
    
    direction = c(
      "negative",
      "zero",
      "positive"
    ),
    
    fill = list(
      count = 0,
      territories = ""
    )
  ) |>
  arrange(
    year,
    factor(
      direction,
      levels = c(
        "negative",
        "zero",
        "positive"
      )
    )
  )

write_csv(
  sl_balance,
  "data/processed/sea_level_balance_d3.csv"
)


# -----------------------------------------------------------------------------
# 04.3 Sea level legend used in the narrative column
# -----------------------------------------------------------------------------

make_sl_legend <- function() {
  
  min_value <- -max_abs_sl
  max_value <-  max_abs_sl
  
  ticks <- c(-0.2, -0.1, 0, 0.1, 0.2)
  
  # largura visual da barra
  bar_min <- -0.55
  bar_max <-  0.55
  
  
  # Gradiente -------------------------------------------------------------
  
  legend_df <- tibble(
    value = seq(
      min_value,
      max_value,
      length.out = 300
    ),
    x = seq(
      bar_min,
      bar_max,
      length.out = 300
    )
  ) |>
    mutate(
      xend = lead(x)
    ) |>
    filter(
      !is.na(xend)
    )
  
  
  # Posição dos ticks -----------------------------------------------------
  
  tick_df <- tibble(
    value = ticks,
    x = scales::rescale(
      ticks,
      to = c(bar_min, bar_max),
      from = c(min_value, max_value)
    )
  )
  
  
  # Plot ------------------------------------------------------------------
  
  ggplot() +
    
    # Gradient bar
    geom_segment(
      data = legend_df,
      aes(
        x = x,
        xend = xend,
        y = 1,
        yend = 1,
        colour = value
      ),
      linewidth = 9,
      lineend = "round"
    ) +
    
    # Same colour scale as main chart
    scale_colour_gradient2(
      low = cold_col,
      mid = zero_col,
      high = hot_col,
      midpoint = 0,
      limits = c(
        min_value,
        max_value
      ),
      oob = squish,
      guide = "none"
    ) +
    
    # Tick marks
    geom_segment(
      data = tick_df,
      aes(
        x = x,
        xend = x,
        y = 0.86,
        yend = 0.97
      ),
      colour = alpha(text_col, 0.7),
      linewidth = 0.4
    ) +
    
    # Tick labels
    geom_text(
      data = tick_df,
      aes(
        x = x,
        y = 0.70,
        label = round(value * 100)
      ),
      colour = text_col,
      size = 12,
      family = "Rubik"
    ) +
    
    # Legend title
    annotate(
      "text",
      x = bar_min - 0.2,
      y = 1.32,
      label = "Sea level anomaly (cm)",
      hjust = 0,
      colour = text_col,
      size = 14
    ) +
    
    coord_cartesian(
      xlim = c(-1, 1),
      ylim = c(0.55, 1.45),
      clip = "off"
    ) +
    
    theme_void() +
    
    theme(
      plot.background = element_rect(
        fill = bg_col,
        colour = NA
      ),
      panel.background = element_rect(
        fill = bg_col,
        colour = NA
      ),
      plot.margin = margin(
        10, 10, 10, 10
      )
    )
}

sl_legend <- make_sl_legend()


ggsave(
  filename = "images/legenda_2.png",
  plot = sl_legend,
  width = 3,
  height = 1.5,
  units = "in",
  dpi = 300,
  bg = bg_col
)


# =============================================================================
# 05. CO2 — DATA FOR D3 BUBBLE CHART
# =============================================================================

pacific_territories <- c(
  "Cook Islands",
  "Fiji",
  "French Polynesia",
  "Kiribati",
  "Marshall Islands",
  "Micronesia (country)",
  "Nauru",
  "New Caledonia",
  "Palau",
  "Papua New Guinea",
  "Samoa",
  "Solomon Islands",
  "Tonga",
  "Tuvalu",
  "Vanuatu",
  "Wallis and Futuna"
)

exclude_entities <- c(
  "Asia (excl. China and India)",
  "Europe (excl. EU-27)",
  "Europe (excl. EU-28)",
  "European Union (27)",
  "European Union (28)",
  "High-income countries",
  "Low-income countries",
  "Lower-middle-income countries",
  "North America",
  "North America (excl. USA)",
  "Upper-middle-income countries",
  "World",
  "Africa",
  "Asia",
  "Europe",
  "Kosovo",
  "Oceania",
  "South America"
)

co2_pc <- read_csv(
  "data/raw/co-emissions-per-capita.csv",
  show_col_types = FALSE
) |>
  filter(
    Year == 2024,
    !Entity %in% exclude_entities,
    !is.na(`CO₂ emissions per capita`),
    !is.na(Code),
    Code != ""
  ) |>
  transmute(
    entity = Entity,
    code = Code,
    year = Year,
    co2_pc = `CO₂ emissions per capita`
  )

co2_total <- read_csv(
  "data/raw/annual-co2-emissions-per-country.csv",
  show_col_types = FALSE
) |>
  filter(
    Year == 2024,
    !Entity %in% exclude_entities,
    !is.na(`Annual CO₂ emissions`),
    !is.na(Code),
    Code != ""
  ) |>
  transmute(
    entity = Entity,
    code = Code,
    year = Year,
    co2_total = `Annual CO₂ emissions`
  )

co2_d3 <- co2_pc |>
  left_join(
    co2_total,
    by = c(
      "entity",
      "code",
      "year"
    )
  ) |>
  filter(
    !is.na(co2_total)
  ) |>
  mutate(
    pacific =
      entity %in%
      pacific_territories,
    
    co2_total_mt =
      co2_total / 1e6
  )

write_csv(
  co2_d3,
  "data/processed/co2_d3.csv"
)


# =============================================================================
# 06. OPENING MAP — STATIC ASSET
# =============================================================================
#
# This is the only large static chart still generated in R.
# The analytical charts themselves are now rendered in D3.
# =============================================================================

pacific_crs <-
  "+proj=ortho +lat_0=-8 +lon_0=180 +x_0=0 +y_0=0"

earth_radius <- 6378137

ocean_col  <- "#0F1D2E"
land_col   <- "#effae6"
border_col <- "#BDB8B2"
point_col  <- "#82b3ae"
ring_col   <- "#F2F4F8"
map_grid_col <- alpha(
  "#F2F4F8",
  0.10
)

land <- ne_countries(
  scale = "medium",
  returnclass = "sf"
)

land_ortho <- st_transform(
  land,
  crs = pacific_crs
)

territories <- tibble::tribble(
  ~territory,                  ~lon,    ~lat,
  "American Samoa",          -170.7,   -14.3,
  "Cook Islands",            -159.8,   -21.2,
  "Fiji",                      178.1,   -17.8,
  "French Polynesia",        -149.4,   -17.7,
  "Guam",                      144.8,    13.4,
  "Kiribati",                 -157.4,     1.9,
  "Marshall Islands",          171.2,     7.1,
  "Micronesia",                158.2,     6.9,
  "Nauru",                     166.9,    -0.5,
  "New Caledonia",             165.6,   -21.3,
  "Northern Mariana Islands",  145.7,    15.2,
  "Palau",                     134.6,     7.5,
  "Papua New Guinea",          147.2,    -6.3,
  "Pitcairn",                 -130.1,   -25.1,
  "Samoa",                    -172.1,   -13.8,
  "Solomon Islands",           160.2,    -9.6,
  "Tokelau",                  -171.8,    -9.2,
  "Tonga",                    -175.2,   -21.2,
  "Tuvalu",                    179.2,    -8.5,
  "Vanuatu",                   167.7,   -16.2,
  "Wallis and Futuna",        -177.2,   -13.3
)

territories_sf <- territories |>
  st_as_sf(
    coords = c(
      "lon",
      "lat"
    ),
    crs = 4326
  )

territories_ortho <- st_transform(
  territories_sf,
  crs = pacific_crs
)

globe <- st_buffer(
  st_sfc(
    st_point(
      c(0, 0)
    ),
    crs = pacific_crs
  ),
  dist = earth_radius
)

grat <- st_graticule(
  lon = seq(
    -180,
    180,
    by = 20
  ),
  lat = seq(
    -60,
    60,
    by = 20
  ),
  crs = st_crs(4326)
)

grat_ortho <- st_transform(
  grat,
  crs = pacific_crs
)


# -----------------------------------------------------------------------------
# Optional shaded-relief texture
# -----------------------------------------------------------------------------

bbox_tiles <- st_as_sfc(
  st_bbox(
    c(
      xmin = -180,
      ymin = -60,
      xmax = 180,
      ymax = 60
    ),
    crs = st_crs(4326)
  )
)

relief_ortho <- NULL

try({
  
  relief <- get_tiles(
    x = bbox_tiles,
    provider = "Esri.WorldShadedRelief",
    zoom = 2,
    crop = TRUE,
    cachedir = tempdir()
  )
  
  relief_ortho <- terra::project(
    relief,
    pacific_crs,
    method = "near"
  )
  
}, silent = TRUE)


# -----------------------------------------------------------------------------
# Draw and save opening map
# -----------------------------------------------------------------------------

pacific_map <- ggplot() +
  
  geom_sf(
    data = globe,
    fill = ocean_col,
    colour = NA
  ) +
  
  {
    if (!is.null(relief_ortho)) {
      geom_spatraster_rgb(
        data = relief_ortho,
        alpha = 0.28
      )
    }
  } +
  
  geom_sf(
    data = grat_ortho,
    colour = map_grid_col,
    linewidth = 0.15
  ) +
  
  geom_sf(
    data = land_ortho,
    fill = land_col,
    colour = border_col,
    linewidth = 0.18
  ) +
  
  geom_sf(
    data = territories_ortho,
    shape = 21,
    fill = alpha(
      point_col,
      0.20
    ),
    colour = ring_col,
    size = 4.8,
    stroke = 0.7
  ) +
  
  geom_sf(
    data = territories_ortho,
    shape = 21,
    fill = point_col,
    colour = "black",
    size = 2.6,
    stroke = 0.35
  ) +
  
  coord_sf(
    crs = pacific_crs,
    xlim = c(
      -earth_radius,
      earth_radius
    ),
    ylim = c(
      -0.82 * earth_radius,
      0.82 * earth_radius
    ),
    expand = FALSE,
    clip = "on"
  ) +
  
  labs(
    title = "The Pacific in focus",
    subtitle =
      "Island countries and territories included in the analysis"
  ) +
  
  theme_void() +
  
  theme(
    plot.background = element_rect(
      fill = bg_col,
      colour = NA
    ),
    
    panel.background = element_rect(
      fill = bg_col,
      colour = NA
    ),
    
    plot.title = element_text(
      colour = "#82b3ae",
      size = 80,
      family = "Rubik",
      face = "bold",
      hjust = 0.5,
      margin = margin(
        b = 8
      )
    ),
    
    plot.subtitle = element_text(
      colour = "#effae6",
      size = 35,
      hjust = 0.5,
      family = "Rubik",
      margin = margin(
        b = 14
      )
    ),
    
    plot.margin = margin(
      10,
      10,
      10,
      10
    )
  )

ggsave(
  filename = "images/pacific_globe_opening.png",
  plot = pacific_map,
  width = 10,
  height = 8,
  dpi = 300,
  bg = bg_col
)


# =============================================================================
# 07. QUICK CHECKS
# =============================================================================

cat("\nSST D3:\n")
print(
  sst_d3 |>
    summarise(
      first_year = min(year),
      last_year = max(year),
      territories = n_distinct(territory),
      observations = n()
    )
)

cat("\nSST balance:\n")
print(
  sst_balance |>
    select(
      year,
      direction,
      count
    )
)

cat("\nSea level D3:\n")
print(
  sl_d3 |>
    summarise(
      first_year = min(year),
      last_year = max(year),
      territories = n_distinct(territory),
      observations = n()
    )
)

cat("\nSea level balance:\n")
print(
  sl_balance |>
    select(
      year,
      direction,
      count
    )
)

cat("\nCO2 D3:\n")
print(
  co2_d3 |>
    summarise(
      countries = n(),
      pacific = sum(pacific),
      min_pc = min(co2_pc),
      max_pc = max(co2_pc),
      min_total_mt = min(co2_total_mt),
      max_total_mt = max(co2_total_mt)
    )
)


# =============================================================================
# END
# =============================================================================