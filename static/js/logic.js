// Configuration object for map settings
const config = {
    center: [40.374, -125.021], // Centered on the Cape Mendocino earthquake
    zoom: 6,
    minZoom: 2,
    maxZoom: 18
};

// Helper functions
const helpers = {
    getMarkerSize(magnitude) {
        return magnitude * 5;
    },

    getDepthColor(depth) {
        return depth > 90 ? '#800026' :
               depth > 70 ? '#BD0026' :
               depth > 50 ? '#E31A1C' :
               depth > 30 ? '#FC4E2A' :
               depth > 10 ? '#FD8D3C' :
                          '#FEB24C';
    },

    formatPopupContent(feature) {
        const props = feature.properties;
        const coords = feature.geometry.coordinates;
        const date = new Date(props.time).toLocaleString();
        
        return `
            <strong>Location:</strong> ${props.place}<br>
            <strong>Magnitude:</strong> ${props.mag}<br>
            <strong>Depth:</strong> ${coords[2]} km<br>
            <strong>Time:</strong> ${date}<br>
            <strong>Status:</strong> ${props.status}<br>
            ${props.tsunami ? '<strong>Tsunami:</strong> Warning Issued<br>' : ''}
            <a href="${props.url}" target="_blank">More details</a>
        `;
    }
};

// Map initialization
function initMap() {
    const map = L.map('map', config);

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '© OpenStreetMap contributors'
    }).addTo(map);

    return map;
}

// Add earthquake markers to the map
function addEarthquakeMarkers(map, earthquakeData) {
    earthquakeData.features.forEach(feature => {
        const coords = feature.geometry.coordinates;
        const magnitude = feature.properties.mag;
        const depth = coords[2]; // Depth is the third coordinate in GeoJSON Point

        const circle = L.circleMarker([coords[1], coords[0]], {  // Note: GeoJSON uses [longitude, latitude]
            radius: helpers.getMarkerSize(magnitude),
            fillColor: helpers.getDepthColor(depth),
            color: "#000",
            weight: 1,
            opacity: 1,
            fillOpacity: 0.8
        }).addTo(map);

        circle.bindPopup(helpers.formatPopupContent(feature));
    });
}

// Create and add legend to the map
function addLegend(map) {
    const legend = L.control({position: 'bottomright'});
    
    legend.onAdd = function() {
        const div = L.DomUtil.create('div', 'legend');
        const depths = [0, 10, 30, 50, 70, 90];
        
        div.innerHTML = '<h4>Depth (km)</h4>';
        
        depths.forEach((depth, index) => {
            div.innerHTML += `
                <i style="background:${helpers.getDepthColor(depth + 1)}"></i>
                ${depth}${depths[index + 1] ? '&ndash;' + depths[index + 1] + '<br>' : '+'}
            `;
        });
        
        return div;
    };
    
    legend.addTo(map);
}

// Main function to initialize the visualization
function initializeVisualization() {
    //GeoJSON data
    const earthquakeData = {
        "type": "FeatureCollection",
        "features": [
            {
                "type": "Feature",
                "properties": {
                    "mag": 7,
                    "place": "2024 Offshore Cape Mendocino, California Earthquake",
                    "time": 1733424261110,
                    "url": "https://earthquake.usgs.gov/earthquakes/eventpage/nc75095651",
                    "status": "reviewed",
                    "tsunami": 1,
                },
                "geometry": {
                    "type": "Point",
                    "coordinates": [-125.021666666667, 40.374, 10]
                },
                "id": "nc75095651"
            }
        ]
    };

    const map = initMap();
    addEarthquakeMarkers(map, earthquakeData);
    addLegend(map);
}

// Start the application when the DOM is fully loaded
document.addEventListener('DOMContentLoaded', initializeVisualization);