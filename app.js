
let covidData = [];
let confirmedDiv = document.getElementById('confirmed');
let deathsDiv = document.getElementById('deaths');
const covidApi = "https://services1.arcgis.com/0MSEUqKaxRlEPj5g/arcgis/rest/services/ncov_cases2_v1/FeatureServer/2/query?where=1%3D1&outFields=*&outSR=4326&f=json";
//====== Fetch Covid19 Country Data from UN DESA Statistics API ======
fetch(covidApi)
.then(res => {
    return res.json();
})
.then(data => {
    // Get the covid data
    covidData = [...data.features];  
})
.catch( err => {
    console.log(err);
});


    mapboxgl.accessToken = 'pk.eyJ1IjoiYXJjaG9udGlzIiwiYSI6ImNsMDk5ZzA3MDA4b28za28zc3QyMGtsN3YifQ.9Doml5dY0IShopV-NkTiPQ';

    const map = new mapboxgl.Map({
        container: 'map',
        style: 'mapbox://styles/mapbox/streets-v11',
        center: [-100.486052, 37.830348],
        zoom: 2,
        minZoom: 1.5
    });
    
    let hoveredStateId = null;

    
    map.on('load', () => {
        map.addSource('states', {
        'type': 'geojson',
        'data': 'countries.geojson'
        });

        // World Data
        let worldConfirmed = 0;
        let worldDeaths = 0;

        for(let i=0; i<covidData.length; i++){
            worldConfirmed += covidData[i].attributes.Confirmed;
            worldDeaths += covidData[i].attributes.Deaths;
        }
        confirmedDiv.textContent = worldConfirmed.toString().replace(/\B(?=(\d{3})+(?!\d))/g, '.');
        deathsDiv.textContent = worldDeaths.toString().replace(/\B(?=(\d{3})+(?!\d))/g, '.');

    
        // The feature-state dependent fill-opacity expression will render the hover effect
        // when a feature's hover state is set to true.
        
        map.addLayer({
        'id': 'state-fills',
        'type': 'fill',
        'source': 'states',
        'layout': {},
        'paint': {
        'fill-color': '#c16262',
        'fill-opacity': [
        'case',
        ['boolean', ['feature-state', 'hover'], false],
        1,
        0.5
        ]
        }
        });

    
        map.addLayer({
        'id': 'state-borders',
        'type': 'line',
        'source': 'states',
        'layout': {},
        'paint': {
        'line-color': '#c16262',
        'line-width': 1
        }
        });

        // Create a popup, but don't add it to the map yet.
        const popup = new mapboxgl.Popup({
            closeButton: false,
            closeOnClick: false
        });
        
        // When the user moves their mouse over the state-fill layer, we'll update the
        // feature state for the feature under the mouse.
        map.on('mousemove', 'state-fills', (e) => {
            if (e.features.length > 0) {
                if (hoveredStateId !== null) {
                    map.setFeatureState(
                        { source: 'states', id: hoveredStateId },
                        { hover: false }
                    );
                }

                map.getCanvas().style.cursor = 'pointer';

                // Basic Country Details
                let countryName = e.features[0].properties.ADMIN;
                let flag = e.features[0].properties.FLAG;
                // COVID-19 Country Details
                let confirmed = null;
                let deaths = null;

                for(let i=0; i<covidData.length; i++){
                    if(covidData[i].attributes.ISO3 === e.features[0].properties.ISO_A3){
                        confirmed = covidData[i].attributes.Confirmed;
                        deaths = covidData[i].attributes.Deaths;
                    }
                } 
               
                let countryDetails = `
                    <h1>${countryName}</h1>
                    <p>
                        <b>Unknown Covid-19 Details</b>
                    </p>
                `;

                // Get the iso_2 of the country
                // The flagcdn page has flags of every country like: https://flagcdn.com/COUNTRY_ISO.svg (eg gr.svg)
                let iso = e.features[0].properties.ISO_A2;
                if(iso!='-'){
                    if(confirmed===null && deaths!==null){
                        countryDetails = `
                            <h1>${countryName} <img src="https://flagcdn.com/${iso.toLowerCase()}.svg" alt="Country Flag" width="36" height="27"> </h1>
                            <p>
                                <b>Confirmed: </b>Unknown <br>
                                <b>Deaths: </b>${deaths.toString().replace(/\B(?=(\d{3})+(?!\d))/g, '.')}
                            </p>
                        `;
                    } else if(deaths===null && confirmed!==null){
                        countryDetails = `
                            <h1>${countryName} <img src="https://flagcdn.com/${iso.toLowerCase()}.svg" alt="Country Flag" width="36" height="27"> </h1>
                            <p>
                                <b>Confirmed: </b>${confirmed.toString().replace(/\B(?=(\d{3})+(?!\d))/g, '.')} <br>
                                <b>Deaths: </b>Unknown
                            </p>
                        `;
                    } else if(deaths!==null && confirmed!==null){
                        countryDetails = `
                            <h1>${countryName} <img src="https://flagcdn.com/${iso.toLowerCase()}.svg" alt="Country Flag" width="36" height="27"> </h1>
                            <p>
                                <b>Confirmed: </b>${confirmed.toString().replace(/\B(?=(\d{3})+(?!\d))/g, '.')} <br>
                                <b>Deaths: </b>${deaths.toString().replace(/\B(?=(\d{3})+(?!\d))/g, '.')}
                            </p>
                        `;
                    }
                }
                

                popup.setLngLat(e.lngLat).setHTML(countryDetails).addTo(map);
                
                hoveredStateId = e.features[0].id;

                map.setFeatureState(
                    { source: 'states', id: hoveredStateId },
                    { hover: true }
                );
            }
        });

        // When the mouse leaves the state-fill layer, update the feature state of the
        // previously hovered feature.
        map.on('mouseleave', 'state-fills', () => {
        
        if (hoveredStateId !== null) {
            map.getCanvas().style.cursor = '';
            popup.remove();
            map.setFeatureState(
                { source: 'states', id: hoveredStateId },
                { hover: false }
            );
        }

        hoveredStateId = null;
        });
    });
