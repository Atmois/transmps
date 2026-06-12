let geoJsonLayer;
let highlightedLayer = null;
let postcodeMarker = null;

const map = L.map('map', {
    center: [55.75, -3.5],
    zoom: 6,
    minZoom: 6,
    maxZoom: 12,
    maxBounds: L.latLngBounds([40, -15], [65, 5]),
});

L.tileLayer('https://{s}.basemaps.cartocdn.com/dark_nolabels/{z}/{x}/{y}{r}.png', {
    attribution: [
        '&copy; <a href="https://openstreetmap.org/copyright" target="_blank">OpenStreetMap</a> contributors',
        '&copy; CARTO',
        '&copy; Crown copyright, contains OS data ',
        'Contains Parliamentary information licensed under the <a href="https://www.parliament.uk/site-information/copyright-parliament/open-parliament-licence/" target="_blank">Open Parliament Licence v3.0</a>'
    ].join(' | '),
    tileAttributes: {
        'fetchpriority': 'high',
        'loading': 'eager'
    }
}).addTo(map);

fetch('/data/mps.geojson')
    .then(res => {
        if (!res.ok) throw new Error(`Failed to load map file: ${res.status}`);
        return res.json();
    })
    .then(geojsonData => {
        geoJsonLayer = L.geoJSON(geojsonData, {
            style: feature => getPartyStyle(feature.properties.mp_party),
            onEachFeature: (feature, layer) => {
                const props = feature.properties;
                const imageUrl = props.mp_image || 'https://members.parliament.uk/dist/vacant-placeholder.png';

                const partyStyle = getPartyStyle(props.mp_party);
                const partyColor = partyStyle.fillColor;

                layer.bindPopup(`
                    <div class="popup-card">
                        <img src="${imageUrl}" alt="${props.mp_name}" style="border-color: ${partyColor};" />
                        <h3>${props.PCON24NM}</h3>
                        <p><strong>MP:</strong> ${props.mp_name}</p>
                        <p><strong>Party:</strong> ${props.mp_party}</p>
                    </div>
                `);

                layer.on('mouseover', function () {
                    if (this !== highlightedLayer) this.setStyle({ fillOpacity: 0.95 });
                });
                layer.on('mouseout', function () {
                    if (this !== highlightedLayer) this.setStyle({ fillOpacity: 0.75 });
                });
            }
        }).addTo(map);
    })
    .catch(err => console.error("Map loading error:", err));

// Colours grabbed from party branding guidelines, or from parliament.uk where not available
function getPartyStyle(party) {
    let colour = '#FFFFFF';

    // Special Cases
    if (party === 'Speaker') colour = '#333333';
    if (party === 'Independent') colour = '#777777';

    // Parties (Sorted alphabetically)
    if (party === 'Alliance') colour = '#F4C72E';
    if (party === 'Conservative') colour = '#0063B7';
    if (party === 'Democratic Unionist Party') colour = '#D46A4C';
    if (party === 'Green Party') colour = '#00A85A';
    if (party === 'Labour' || party === 'Labour (Co-op)') colour = '#E4003B';
    if (party === 'Liberal Democrat') colour = '#FF6400';
    if (party === 'Plaid Cymru') colour = '#0AA77D';
    if (party === 'Reform UK') colour = '#17B9D1';
    if (party === 'Restore Britain') colour = '#062042';
    if (party === 'Scottish National Party') colour = '#FDF391';
    if (party === 'Sinn Féin') colour = '#02665F';
    if (party === 'Social Democratic & Labour Party') colour = '#FF0000';
    if (party === 'Traditional Unionist Voice') colour = '#201863';
    if (party === 'Ulster Unionist Party') colour = '#23315C';
    if (party === 'Your Party') colour = '#FD4E4E';

    return {
        fillColor: colour,
        weight: 0.5,
        opacity: 1,
        color: '#222222',
        fillOpacity: 0.75
    };
}

function handleSearch() {
    const postcode = document.getElementById('postcode-input').value.trim().replaceAll(/\s/g, '');
    const errorDiv = document.getElementById('search-error');
    errorDiv.style.display = 'none';

    if (!postcode) return;

    fetch(`https://api.postcodes.io/postcodes/${encodeURIComponent(postcode)}`)
        .then(res => {
            if (!res.ok) throw new Error("Postcode not found");
            return res.json();
        })
        .then(data => {
            const postcodeLat = data.result.latitude;
            const postcodeLng = data.result.longitude;
            const constituencyName = data.result.parliamentary_constituency;
            let matchFound = false;

            if (highlightedLayer || postcodeMarker) {
                geoJsonLayer.resetStyle(highlightedLayer);
                map.removeLayer(postcodeMarker);
            }

            geoJsonLayer.eachLayer(function (layer) {
                if (layer.feature.properties.PCON24NM.toLowerCase() === constituencyName.toLowerCase()) {
                    matchFound = true;
                    highlightedLayer = layer;
                    layer.setStyle({
                        weight: 5,
                        color: '#FF80FF',
                        fillOpacity: 0.9
                    });
                    layer.bringToFront();
                }
            });

            if (matchFound) {
                postcodeMarker = L.circleMarker([postcodeLat, postcodeLng], {
                    radius: 7,
                    fillColor: '#FF80FF',
                    color: '#FFFFFF',
                    weight: 2,
                    opacity: 1,
                    fillOpacity: 0.8
                }).addTo(map);

                postcodeMarker.bringToFront();
                map.setView([postcodeLat, postcodeLng], 11);
                highlightedLayer.openPopup([postcodeLat, postcodeLng]);
            }

        })
        .catch(err => {
            errorDiv.innerText = "Invalid Postcode";
            errorDiv.style.display = 'block';
            console.error(err);
        });
}

document.addEventListener('DOMContentLoaded', () => {
    document.getElementById('search-button').addEventListener('click', handleSearch);
    document.getElementById('postcode-input').addEventListener('keypress', (e) => {
        if (e.key === 'Enter') handleSearch();
    });
});
