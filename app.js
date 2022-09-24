const MAPBOX_TOKEN = 'pk.eyJ1IjoiYXJjaG9udGlzIiwiYSI6ImNsMDk5ZzA3MDA4b28za28zc3QyMGtsN3YifQ.9Doml5dY0IShopV-NkTiPQ'

mapboxgl.accessToken = MAPBOX_TOKEN;

// Map Creation
const map = new mapboxgl.Map({
    container: 'map',
    style: 'mapbox://styles/mapbox/dark-v10',
    center: [-120, 50],
    zoom: 2
});

map.on('load', () => { 
    // Add a geojson point source.
    // Heatmap layers also work with a vector tile source.  
    map.addSource('earthquakes', {
        'type': 'geojson',
        'data': 'https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/all_week.geojson'
    });

    // HeatPoints Layer Addition
    map.addLayer(
        {
        'id': 'earthquakes-heat',
        'type': 'heatmap',
        'source': 'earthquakes',
        'maxzoom': 9,
        'paint': {
            // Increase the heatmap weight based on frequency and property magnitude
            'heatmap-weight': [
                'interpolate',
                ['linear'],
                ['get', 'mag'],
                0,
                0,
                6,
                1
            ],

            // Increase the heatmap color weight weight by zoom level
            // heatmap-intensity is a multiplier on top of heatmap-weight
            'heatmap-intensity': [
                'interpolate',
                ['linear'],
                ['zoom'],
                0,
                1,
                9,
                3
            ],

            // Color ramp for heatmap.  Domain is 0 (low) to 1 (high).
            // Begin color ramp at 0-stop with a 0-transparancy color
            // to create a blur-like effect.
            'heatmap-color': [
                'interpolate',
                ['linear'],
                ['heatmap-density'],
                0,
                'rgba(33,102,172,0)',
                0.2,
                'rgb(103,169,207)',
                0.4,
                'rgb(209,229,240)',
                0.6,
                'rgb(253,219,199)',
                0.8,
                'rgb(239,138,98)',
                1,
                'rgb(178,24,43)'
            ],

            // Adjust the heatmap radius by zoom level
            'heatmap-radius': [
                'interpolate',
                ['linear'],
                ['zoom'],
                0,
                2,
                9,
                20
            ],

            // Transition from heatmap to circle layer by zoom level
            'heatmap-opacity': [
                'interpolate',
                ['linear'],
                ['zoom'],
                7,
                1,
                9,
                0
            ]
        }
    },

    'waterway-label'
    );

    // Create a popup, but don't add it to the map yet.
    const popup = new mapboxgl.Popup({
        closeButton: false,
        closeOnClick: false
        });
        map.on('mouseenter', 'earthquakes-heat',  (e) => {
        // Change the cursor style as a UI indicator.
        map.getCanvas().style.cursor = 'pointer';

    // Copy coordinates array.
    const magnitude = e.features[0].properties.mag;
    const location = e.features[0].properties.place;
    const date = new Date(e.features[0].properties.time);

    const coordinates = e.features[0].geometry.coordinates.slice();
    const description = '<b>Magnitude: </b>' + magnitude + '<br> <b>Location: </b>' + location + '<br> <b>Date: </b>' + date;
    

    // Ensure that if the map is zoomed out such that multiple
    // copies of the feature are visible, the popup appears
    // over the copy being pointed to.
    while (Math.abs(e.lngLat.lng - coordinates[0]) > 180) {
    coordinates[0] += e.lngLat.lng > coordinates[0] ? 360 : -360;
    }
    
    // Populate the popup and set its coordinates
    // based on the feature found.
    popup.setLngLat(coordinates).setHTML(description).addTo(map);

    });
    

    map.on('mouseleave', 'earthquakes-heat', () => {
    map.getCanvas().style.cursor = '';
    popup.remove();
    });

    
    map.addLayer(
    {
    'id': 'earthquakes-point',
    'type': 'circle',
    'source': 'earthquakes',
    'minzoom': 7,
    'paint': {
    // Size circle radius by earthquake magnitude and zoom level
    'circle-radius': [
    'interpolate',
    ['linear'],
    ['zoom'],
    7,
    ['interpolate', ['linear'], ['get', 'mag'], 1, 1, 6, 4],
    16,
    ['interpolate', ['linear'], ['get', 'mag'], 1, 5, 6, 50]
    ],
    // Color circle by earthquake magnitude
    'circle-color': [
    'interpolate',
    ['linear'],
    ['get', 'mag'],
    1,
    'rgba(33,102,172,0)',
    2,
    'rgb(103,169,207)',
    3,
    'rgb(209,229,240)',
    4,
    'rgb(253,219,199)',
    5,
    'rgb(239,138,98)',
    6,
    'rgb(178,24,43)'
    ],
    'circle-stroke-color': 'white',
    'circle-stroke-width': 1,
    // Transition from heatmap to circle layer by zoom level
    'circle-opacity': [
    'interpolate',
    ['linear'],
    ['zoom'],
    7,
    0,
    8,
    1
    ]
    }
    },
    'waterway-label'
    );
    
    map.on('mouseenter', 'earthquakes-point',  (e) => {
        // Change the cursor style as a UI indicator.
        map.getCanvas().style.cursor = 'pointer';
    
        // Copy coordinates array.
        const magnitude = e.features[0].properties.mag;
        const location = e.features[0].properties.place;
        const date = new Date(e.features[0].properties.time);

        const coordinates = e.features[0].geometry.coordinates.slice();
        const description = '<b>Magnitude: </b>' + magnitude + '<br> <b>Location: </b>' + location + '<br> <b>Date: </b>' + date;
    

        // Ensure that if the map is zoomed out such that multiple
        // copies of the feature are visible, the popup appears
        // over the copy being pointed to.
        while (Math.abs(e.lngLat.lng - coordinates[0]) > 180) {
            coordinates[0] += e.lngLat.lng > coordinates[0] ? 360 : -360;
        }
    
        // Populate the popup and set its coordinates
        // based on the feature found.
        popup.setLngLat(coordinates).setHTML(description).addTo(map);

    });
    

    map.on('mouseleave', 'earthquakes-point', () => {
    map.getCanvas().style.cursor = '';
    popup.remove();
    });
});