-- =========================================================
-- PredictiX additive migration for PdM feature columns
-- Only adds missing columns. Does not remove or change anything.
-- =========================================================

-- ---------------------------------
-- 1) Warehouses: extra dataset columns
-- ---------------------------------
alter table public.warehouses
add column if not exists climate_zone text,
add column if not exists warehouse_type text;

-- ---------------------------------
-- 2) Assets: static / slow-changing vehicle columns
-- ---------------------------------
alter table public.assets
add column if not exists vehicle_role text,
add column if not exists make_model text,
add column if not exists fuel_type text,
add column if not exists transmission text,
add column if not exists service_provider_type text,
add column if not exists payload_capacity_kg numeric(12,2),
add column if not exists maintenance_priority text,
add column if not exists vehicle_age_years integer,
add column if not exists lifetime_service_count integer,
add column if not exists lifetime_breakdown_count integer;

-- ---------------------------------
-- 3) Sensor readings: time-series / model feature columns
-- ---------------------------------
alter table public.sensor_readings
add column if not exists odometer_km numeric(12,2),
add column if not exists engine_hours_total numeric(12,2),
add column if not exists distance_last_30d_km numeric(12,2),
add column if not exists operating_hours_last_30d numeric(12,2),
add column if not exists idle_hours_last_30d numeric(12,2),
add column if not exists trip_count_30d integer,
add column if not exists avg_trip_distance_km numeric(12,2),
add column if not exists avg_payload_kg numeric(12,2),
add column if not exists payload_utilization_pct numeric(10,2),
add column if not exists overload_events_30d integer,
add column if not exists start_stop_burden_30d integer,
add column if not exists rough_road_pct numeric(10,2),
add column if not exists urban_route_pct numeric(10,2),
add column if not exists port_route_pct numeric(10,2),
add column if not exists route_type text,
add column if not exists cargo_type text,
add column if not exists operating_shift text,
add column if not exists ambient_temp_avg_c numeric(10,2),
add column if not exists ambient_humidity_avg_pct numeric(10,2),
add column if not exists rainfall_mm_30d numeric(12,2),
add column if not exists fuel_price_lkr_per_l numeric(12,2),
add column if not exists engine_temp_avg_c numeric(10,2),
add column if not exists coolant_temp_max_c numeric(10,2),
add column if not exists vibration_rms_mm_s numeric(10,3),
add column if not exists tire_pressure_psi numeric(10,2),
add column if not exists fuel_rate_lph numeric(10,3),
add column if not exists fuel_efficiency_km_per_l numeric(10,3),
add column if not exists battery_voltage_v numeric(10,3),
add column if not exists oil_life_pct numeric(10,2),
add column if not exists brake_health_pct numeric(10,2),
add column if not exists tire_health_pct numeric(10,2),
add column if not exists battery_health_pct numeric(10,2),
add column if not exists hydraulic_health_pct numeric(10,2),
add column if not exists days_since_last_service integer,
add column if not exists mileage_since_last_service_km numeric(12,2),
add column if not exists engine_hours_since_last_service numeric(12,2),
add column if not exists last_service_type text,
add column if not exists maintenance_cost_last_service_lkr numeric(12,2),
add column if not exists parts_replaced_last_service text,
add column if not exists major_component_replaced text,
add column if not exists is_home_warehouse_service boolean,
add column if not exists active_fault_code_count integer,
add column if not exists sensor_fault_flag boolean,
add column if not exists downtime_hours_last_90d numeric(10,2);

-- ---------------------------------
-- 4) Helpful indexes for common PdM lookups
-- ---------------------------------
create index if not exists idx_sensor_readings_engine_hours_total
on public.sensor_readings(engine_hours_total);

create index if not exists idx_sensor_readings_odometer_km
on public.sensor_readings(odometer_km);

create index if not exists idx_sensor_readings_days_since_last_service
on public.sensor_readings(days_since_last_service);

create index if not exists idx_sensor_readings_active_fault_code_count
on public.sensor_readings(active_fault_code_count);