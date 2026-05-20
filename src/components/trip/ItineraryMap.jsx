import React, { useEffect, useMemo, useRef, useState } from 'react';
import maplibregl from 'maplibre-gl';
import 'maplibre-gl/dist/maplibre-gl.css';

const MAP_STYLE = 'https://tiles.openfreemap.org/styles/liberty';

const PIN_COLORS = [
  '#e91e8c',
  '#22a7f0',
  '#f5a623',
  '#7ed321',
  '#9b59b6',
  '#1abc9c',
  '#e74c3c',
  '#3498db',
];

function escapeHtml(value = '') {
  return String(value)
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#039;');
}

function getActivityEmoji(type = '') {
  const lower = type.toLowerCase();

  if (lower.includes('repas')) return '🍽️';
  if (lower.includes('transport')) return '🚆';
  if (lower.includes('nature')) return '🌿';
  if (lower.includes('photo')) return '📸';
  if (lower.includes('shopping')) return '🛍️';
  if (lower.includes('detente') || lower.includes('détente')) return '☕';
  if (lower.includes('visite')) return '🏛️';

  return '📍';
}

function getCoordinateKey(lat, lng) {
  return `${Number(lat).toFixed(5)},${Number(lng).toFixed(5)}`;
}

function groupConsecutiveDays(days = []) {
  const sorted = [...new Set(days)].sort((a, b) => a - b);
  const groups = [];

  sorted.forEach((day) => {
    const lastGroup = groups[groups.length - 1];

    if (!lastGroup || day !== lastGroup[lastGroup.length - 1] + 1) {
      groups.push([day]);
    } else {
      lastGroup.push(day);
    }
  });

  return groups;
}

function formatDayGroupLabel(days = []) {
  const groups = groupConsecutiveDays(days);

  return groups
    .map((group) => {
      if (group.length === 1) return `J${group[0]}`;
      return `J${group[0]}-${group[group.length - 1]}`;
    })
    .join('/');
}

function formatDayGroupPopup(days = []) {
  return groupConsecutiveDays(days)
    .map((group) => {
      if (group.length === 1) return `Jour ${group[0]}`;
      return `Jours ${group[0]} à ${group[group.length - 1]}`;
    })
    .join(' · ');
}

function groupDayPointsByCoordinates(dayPoints = []) {
  const groups = new Map();

  dayPoints.forEach((point) => {
    const key = getCoordinateKey(point.lat, point.lng);

    if (!groups.has(key)) {
      groups.set(key, {
        ...point,
        days: [],
        titles: [],
        cities: new Set(),
      });
    }

    const group = groups.get(key);
    group.days.push(Number(point.day));
    group.cities.add(point.city);
    if (point.title) group.titles.push(point.title);
  });

  return [...groups.values()].map((group) => ({
    ...group,
    dayLabel: formatDayGroupLabel(group.days),
    popupDays: formatDayGroupPopup(group.days),
    cityLabel: [...group.cities].filter(Boolean).join(' / ') || group.city,
    titles: [...new Set(group.titles)].slice(0, 2),
  }));
}

function createDayMarker({ label, color }) {
  const element = document.createElement('div');
  element.style.width = '44px';
  element.style.height = '54px';
  element.style.cursor = 'pointer';

  const fontSize = String(label || '').length > 5 ? 7.5 : 10.5;

  element.innerHTML = `
    <svg width="44" height="54" viewBox="0 0 44 54" xmlns="http://www.w3.org/2000/svg">
      <ellipse cx="22" cy="50" rx="8" ry="3" fill="rgba(0,0,0,0.22)"/>
      <path d="M22 2C12.06 2 4 10.06 4 20c0 12.5 18 32 18 32s18-19.5 18-32C40 10.06 31.94 2 22 2z" fill="${color}" stroke="white" stroke-width="2"/>
      <circle cx="22" cy="20" r="11" fill="white"/>
      <text x="22" y="24" text-anchor="middle" font-size="${fontSize}" font-weight="800" fill="${color}" font-family="Arial">${escapeHtml(label)}</text>
    </svg>
  `;

  return element;
}

function createActivityMarker({ emoji, color, index }) {
  const element = document.createElement('div');
  element.style.width = '34px';
  element.style.height = '34px';
  element.style.cursor = 'pointer';

  element.innerHTML = `
    <svg width="34" height="34" viewBox="0 0 34 34" xmlns="http://www.w3.org/2000/svg">
      <circle cx="17" cy="17" r="15" fill="${color}" stroke="white" stroke-width="3"/>
      <text x="17" y="22" text-anchor="middle" font-size="14" font-family="Arial">${emoji}</text>
      <circle cx="27" cy="7" r="6" fill="white" stroke="${color}" stroke-width="1.5"/>
      <text x="27" y="10" text-anchor="middle" font-size="8" font-weight="800" fill="${color}" font-family="Arial">${index}</text>
    </svg>
  `;

  return element;
}

function getDaysToShow({ itinerary, activeDayIndex }) {
  if (!itinerary?.length) return [];

  if (activeDayIndex !== null) {
    const day = itinerary[activeDayIndex];
    return day ? [day] : [];
  }

  return itinerary;
}

function getMapPoints({ daysToShow, itinerary, activeDayIndex }) {
  const showActivities = activeDayIndex !== null;

  const dayPoints = daysToShow
    .map((day) => {
      const fallbackActivity = (day.activities || []).find(
        (activity) => activity.lat && activity.lng
      );

      return {
        kind: 'day',
        day: day.day,
        city: day.city,
        title: day.title,
        lat: day.lat || fallbackActivity?.lat,
        lng: day.lng || fallbackActivity?.lng,
        colorIndex: itinerary.indexOf(day),
      };
    })
    .filter((point) => point.lat && point.lng);

  const activityPoints = showActivities
    ? daysToShow.flatMap((day) =>
        (day.activities || [])
          .filter((activity) => activity.lat && activity.lng)
          .map((activity, index) => ({
            kind: 'activity',
            day: day.day,
            city: day.city,
            name: activity.name,
            description: activity.description,
            time: activity.time,
            type: activity.type,
            estimated_cost: activity.estimated_cost,
            lat: activity.lat,
            lng: activity.lng,
            activityIndex: index + 1,
            colorIndex: itinerary.indexOf(day),
          }))
      )
    : [];

  return {
    dayPoints,
    groupedDayPoints: activeDayIndex === null ? groupDayPointsByCoordinates(dayPoints) : dayPoints.map((point) => ({
      ...point,
      dayLabel: `J${point.day}`,
      popupDays: `Jour ${point.day}`,
      cityLabel: point.city,
      titles: point.title ? [point.title] : [],
    })),
    activityPoints,
    allPoints: [...dayPoints, ...activityPoints],
  };
}

function buildRouteGeoJson(dayPoints) {
  return {
    type: 'Feature',
    geometry: {
      type: 'LineString',
      coordinates: dayPoints.map((point) => [Number(point.lng), Number(point.lat)]),
    },
    properties: {},
  };
}

function buildDayPopupHtml(point) {
  const title = point.titles?.[0] || point.title;
  const extraTitle = point.titles?.length > 1 ? point.titles[1] : null;

  return `
    <div style="font-family: Inter, Arial, sans-serif; min-width: 170px; max-width: 220px;">
      <div style="font-size: 11px; font-weight: 800; color: #2563eb; text-transform: uppercase; letter-spacing: .03em; margin-bottom: 4px;">
        ${escapeHtml(point.popupDays || `Jour ${point.day}`)}
      </div>
      <div style="font-size: 14px; font-weight: 800; color: #111827; line-height: 1.2;">
        ${escapeHtml(point.cityLabel || point.city || 'Étape')}
      </div>
      ${title ? `<div style="font-size: 12px; color: #4b5563; margin-top: 6px; line-height: 1.25;">${escapeHtml(title)}</div>` : ''}
      ${extraTitle ? `<div style="font-size: 12px; color: #6b7280; margin-top: 3px; line-height: 1.25;">${escapeHtml(extraTitle)}</div>` : ''}
    </div>
  `;
}

function buildActivityPopupHtml(point) {
  return `
    <div style="font-family: Inter, Arial, sans-serif; min-width: 150px; max-width: 200px;">
      <div style="font-size: 11px; font-weight: 800; color: #2563eb; text-transform: uppercase; letter-spacing: .03em; margin-bottom: 4px;">
        ${point.time ? escapeHtml(point.time) : `Étape ${point.activityIndex}`}
      </div>
      <div style="font-size: 14px; font-weight: 800; color: #111827; line-height: 1.2;">
        ${escapeHtml(point.name || 'Activité')}
      </div>
      ${point.estimated_cost ? `<div style="font-size: 12px; color: #4b5563; margin-top: 6px;">💰 ${escapeHtml(point.estimated_cost)}</div>` : ''}
    </div>
  `;
}

export default function ItineraryMap({
  itinerary,
  filterDayIndex = null,
  height = '380px',
  showDayFilter = false,
}) {
  const mapContainerRef = useRef(null);
  const mapRef = useRef(null);
  const markersRef = useRef([]);
  const [activeDayIndex, setActiveDayIndex] = useState(filterDayIndex);
  const [error, setError] = useState('');

  useEffect(() => {
    setActiveDayIndex(filterDayIndex);
  }, [filterDayIndex]);

  const daysToShow = useMemo(() => {
    return getDaysToShow({ itinerary, activeDayIndex });
  }, [itinerary, activeDayIndex]);

  const { dayPoints, groupedDayPoints, activityPoints, allPoints } = useMemo(() => {
    return getMapPoints({ daysToShow, itinerary, activeDayIndex });
  }, [daysToShow, itinerary, activeDayIndex]);

  useEffect(() => {
    if (!mapContainerRef.current || !allPoints.length) return;

    try {
      setError('');

      markersRef.current.forEach((marker) => marker.remove());
      markersRef.current = [];

      if (mapRef.current) {
        mapRef.current.remove();
        mapRef.current = null;
      }

      const firstPoint = allPoints[0];

      const map = new maplibregl.Map({
        container: mapContainerRef.current,
        style: MAP_STYLE,
        center: [Number(firstPoint.lng), Number(firstPoint.lat)],
        zoom: activeDayIndex === null ? 6 : 12,
        attributionControl: true,
      });

      mapRef.current = map;

      map.addControl(new maplibregl.NavigationControl({ showCompass: false }), 'top-left');

      map.on('load', () => {
        groupedDayPoints.forEach((point) => {
          const color = PIN_COLORS[point.colorIndex % PIN_COLORS.length];

          const popup = new maplibregl.Popup({
            offset: 28,
            maxWidth: '240px',
            closeButton: false,
          }).setHTML(buildDayPopupHtml(point));

          const marker = new maplibregl.Marker({
            element: createDayMarker({
              label: point.dayLabel || `J${point.day}`,
              color,
            }),
            anchor: 'bottom',
          })
            .setLngLat([Number(point.lng), Number(point.lat)])
            .setPopup(popup)
            .addTo(map);

          markersRef.current.push(marker);
        });

        activityPoints.forEach((point) => {
          const color = PIN_COLORS[point.colorIndex % PIN_COLORS.length];

          const popup = new maplibregl.Popup({
            offset: 18,
            maxWidth: '220px',
            closeButton: false,
          }).setHTML(buildActivityPopupHtml(point));

          const marker = new maplibregl.Marker({
            element: createActivityMarker({
              emoji: getActivityEmoji(point.type),
              color,
              index: point.activityIndex,
            }),
            anchor: 'center',
          })
            .setLngLat([Number(point.lng), Number(point.lat)])
            .setPopup(popup)
            .addTo(map);

          markersRef.current.push(marker);
        });

        if (activeDayIndex === null && dayPoints.length > 1) {
          map.addSource('route', {
            type: 'geojson',
            data: buildRouteGeoJson(dayPoints),
          });

          map.addLayer({
            id: 'route-line',
            type: 'line',
            source: 'route',
            layout: {
              'line-join': 'round',
              'line-cap': 'round',
            },
            paint: {
              'line-color': '#e8132a',
              'line-width': 3,
              'line-opacity': 0.85,
            },
          });
        }

        const bounds = new maplibregl.LngLatBounds();
        const uniqueCoordinateKeys = new Set();

        allPoints.forEach((point) => {
          bounds.extend([Number(point.lng), Number(point.lat)]);
          uniqueCoordinateKeys.add(getCoordinateKey(point.lat, point.lng));
        });

        if (uniqueCoordinateKeys.size <= 1) {
          map.setCenter([Number(firstPoint.lng), Number(firstPoint.lat)]);
          map.setZoom(activeDayIndex === null ? 12 : 13);
        } else {
          map.fitBounds(bounds, {
            padding: activeDayIndex === null ? 70 : 55,
            maxZoom: activeDayIndex === null ? 10 : 14,
          });
        }

        setTimeout(() => {
          map.resize();
        }, 250);
      });
    } catch (err) {
      console.error(err);
      setError("Impossible d'afficher la carte pour le moment.");
    }

    return () => {
      markersRef.current.forEach((marker) => marker.remove());
      markersRef.current = [];

      if (mapRef.current) {
        mapRef.current.remove();
        mapRef.current = null;
      }
    };
  }, [allPoints, dayPoints, groupedDayPoints, activityPoints, activeDayIndex]);

  if (!itinerary?.length) {
    return (
      <div className="rounded-2xl border border-border/60 bg-muted/30 p-5 text-center">
        <p className="text-2xl mb-2">📍</p>
        <p className="text-sm text-muted-foreground">
          Aucun point à afficher pour ce voyage.
        </p>
      </div>
    );
  }

  if (!allPoints.length) {
    return (
      <div className="rounded-2xl border border-border/60 bg-muted/30 p-5 text-center">
        <p className="text-2xl mb-2">📍</p>
        <p className="text-sm font-medium text-foreground mb-1">
          Carte indisponible pour ce voyage
        </p>
        <p className="text-sm text-muted-foreground">
          Les coordonnées GPS ne sont pas disponibles pour les étapes ou activités.
        </p>
      </div>
    );
  }

  return (
    <div>
      {showDayFilter && itinerary.length > 1 && (
        <div className="flex flex-wrap gap-2 mb-3">
          <button
            type="button"
            onClick={() => setActiveDayIndex(null)}
            className={`px-3 py-1 rounded-full text-xs font-semibold border transition-colors ${
              activeDayIndex === null
                ? 'bg-primary text-primary-foreground border-primary'
                : 'bg-card border-border text-muted-foreground hover:border-primary/50'
            }`}
          >
            Tous les jours
          </button>

          {itinerary.map((day, index) => (
            <button
              type="button"
              key={index}
              onClick={() => setActiveDayIndex(index)}
              className={`px-3 py-1 rounded-full text-xs font-semibold border transition-colors ${
                activeDayIndex === index
                  ? 'bg-primary text-primary-foreground border-primary'
                  : 'bg-card border-border text-muted-foreground hover:border-primary/50'
              }`}
            >
              Jour {day.day || index + 1}
            </button>
          ))}
        </div>
      )}

      {error ? (
        <div className="rounded-2xl border border-destructive/20 bg-destructive/10 p-5 text-sm text-destructive">
          {error}
        </div>
      ) : (
        <div
          ref={mapContainerRef}
          style={{ height }}
          className="rounded-2xl overflow-hidden border border-border/60 shadow-md bg-muted"
        />
      )}
    </div>
  );
}
