/* ==========================================================================
   REACH SCREENS 2.0 — Lloydminster Screen Map (light theme)
   MapLibre GL + OpenFreeMap (no API key)
   ========================================================================== */
(function () {
  'use strict';
  let bootstrapped = false;

  function ready() {
    if (typeof maplibregl === 'undefined') return false;
    if (!Array.isArray(window.screenLocations)) return false;
    if (!document.getElementById('map')) return false;
    return true;
  }

  function boot() {
    if (bootstrapped) return;
    if (!ready()) return requestAnimationFrame(boot);
    bootstrapped = true;

    const locations = window.screenLocations;
    const map = new maplibregl.Map({
      container: 'map',
      style: 'https://tiles.openfreemap.org/styles/positron',
      center: [-110.0050, 53.2783],
      zoom: 13,
      pitch: 0,
      bearing: 0,
      antialias: true,
      attributionControl: false,
      fadeDuration: 250
    });
    window.__rsMap = map;

    map.on('error', () => {});
    map.addControl(new maplibregl.NavigationControl({ visualizePitch: true }), 'top-right');
    map.addControl(new maplibregl.AttributionControl({ compact: true }));

    let setupRan = false;
    function setup() {
      if (setupRan) return;
      setupRan = true;
      addBuildings(map);
      addMarkers(map, locations);
      try { map.resize(); } catch (_) {}
      try { map.triggerRepaint(); } catch (_) {}
      setTimeout(() => {
        try { map.resize(); } catch (_) {}
        map.flyTo({
          center: [-110.0050, 53.2783],
          zoom: 14,
          pitch: 55,
          bearing: -18,
          duration: 3500,
          essential: true,
          curve: 1.4
        });
      }, 300);
    }

    map.on('load', setup);
    map.on('idle', setup);
    map.once('style.load', setup);
    setTimeout(setup, 1500);

    if (typeof ResizeObserver !== 'undefined') {
      const ro = new ResizeObserver(() => { try { map.resize(); } catch (_) {} });
      const wrap = document.querySelector('.map-wrap');
      if (wrap) ro.observe(wrap);
    }
  }

  function addBuildings(map) {
    if (!map.isStyleLoaded()) {
      map.once('idle', () => addBuildings(map));
      return;
    }
    if (map.getLayer('rs2-buildings-3d')) return;
    const sources = map.getStyle().sources || {};
    let sourceId = null;
    for (const id of Object.keys(sources)) {
      if (sources[id].type === 'vector') { sourceId = id; break; }
    }
    if (!sourceId) return;
    const layers = map.getStyle().layers || [];
    const firstSymbol = layers.find(l => l.type === 'symbol');
    const beforeId = firstSymbol ? firstSymbol.id : undefined;
    try {
      map.addLayer({
        id: 'rs2-buildings-3d',
        type: 'fill-extrusion',
        source: sourceId,
        'source-layer': 'building',
        filter: ['!=', ['get', 'hide_3d'], true],
        minzoom: 13,
        paint: {
          'fill-extrusion-color': [
            'interpolate', ['linear'], ['coalesce', ['get', 'render_height'], 4],
            0, '#E6E2D7',
            10, '#DAD3C1',
            25, '#C9C0AB',
            60, '#B5AB95'
          ],
          'fill-extrusion-height': [
            'interpolate', ['linear'], ['zoom'],
            13, 0,
            14, ['coalesce', ['get', 'render_height'], 4]
          ],
          'fill-extrusion-base': [
            'interpolate', ['linear'], ['zoom'],
            13, 0,
            14, ['coalesce', ['get', 'render_min_height'], 0]
          ],
          'fill-extrusion-opacity': 0.85,
          'fill-extrusion-vertical-gradient': true
        }
      }, beforeId);
    } catch (_) {}
  }

  let markersAdded = false;
  function addMarkers(map, locations) {
    if (markersAdded) return;
    markersAdded = true;
    const popup = new maplibregl.Popup({
      closeButton: true,
      closeOnClick: false,
      offset: 22,
      maxWidth: '260px',
      className: 'rs2-popup'
    });
    locations.forEach(loc => {
      const el = document.createElement('div');
      el.className = 'screen-marker';
      el.innerHTML =
        '<div class="screen-marker-pin" aria-hidden="true">' +
        '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round">' +
        '<rect x="3" y="4" width="18" height="13" rx="1.5"/>' +
        '<path d="M9 21h6"/><path d="M12 17v4"/></svg></div>';
      el.setAttribute('role', 'button');
      el.setAttribute('tabindex', '0');
      el.setAttribute('aria-label', loc.name);
      new maplibregl.Marker({ element: el, anchor: 'center' })
        .setLngLat([loc.lng, loc.lat])
        .addTo(map);
      const select = () => {
        const countLine = (loc.screens && loc.screens > 1)
          ? '<div class="map-popup-count">' + loc.screens + ' screens at this location</div>'
          : '';
        popup
          .setLngLat([loc.lng, loc.lat])
          .setHTML('<div class="map-popup-label">Reach Screen</div><div class="map-popup-name">' + escapeHtml(loc.name) + '</div>' + countLine)
          .addTo(map);
        map.flyTo({
          center: [loc.lng, loc.lat],
          zoom: 16.5,
          pitch: 60,
          bearing: -10,
          duration: 1400,
          essential: true
        });
      };
      el.addEventListener('click', select);
      el.addEventListener('keydown', e => {
        if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); select(); }
      });
    });
  }

  function escapeHtml(s) {
    return String(s).replace(/[&<>"']/g, c => ({
      '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;'
    }[c]));
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', boot);
  else boot();
})();
