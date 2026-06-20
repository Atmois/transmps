let geoJsonLayer;
let highlightedLayer = null;
let postcodeMarker = null;

const map = L.map('map', {
    center: [55.75, -3.5],
    zoom: 6,
    minZoom: 6,
    maxZoom: 15,
    maxBounds: L.latLngBounds([40, -15], [65, 5]),
    zoomControl: false
});

// Recreate to move around the info button
L.control.zoom({ position: 'topleft' }).addTo(map);

L.tileLayer('https://{s}.basemaps.cartocdn.com/dark_nolabels/{z}/{x}/{y}{r}.png', {
    attribution: ['&copy; <a href="https://github.com/atmois/transmps#3rd-party-licenses" target="_blank">https://github.com/Atmois/transmps#3rd-party-licenses</a>',
        'This project is independent and is not affiliated with any government entity.'].join(' | '),
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
                    if (this !== highlightedLayer) {
                        const currentBase = this.feature.properties.currentOpacity;
                        const hoverOpacity = currentBase + 0.25
                        this.setStyle({ fillOpacity: hoverOpacity });
                    }
                });

                layer.on('mouseout', function () {
                    if (this !== highlightedLayer) {
                        const originalOpacity = this.feature.properties.currentOpacity;
                        this.setStyle({ fillOpacity: originalOpacity });
                    }
                });
            }
        }).addTo(map);

        window.geoJsonLayer = geoJsonLayer;
        window.getPartyStyle = getPartyStyle;
        document.dispatchEvent(new CustomEvent('mapLayersReady'));
    })
    .catch(err => console.error("Map loading error:", err));

// Colours from party brand guidelines, or from parliament.uk where not available
function getPartyStyle(party) {
    let colour = '#FFFFFF';

    // Special Cases
    if (party === 'Speaker') colour = '#333333';
    if (party === 'Independent') colour = '#909090';

    // Parties (Sorted alphabetically)
    if (party === 'Alliance') colour = '#CDAF2D';
    if (party === 'Conservative') colour = '#0063BA';
    if (party === 'Democratic Unionist Party') colour = '#D46A4C';
    if (party === 'Green Party') colour = '#00A85A';
    if (party === 'Labour' || party === 'Labour (Co-op)') colour = '#E4003B';
    if (party === 'Liberal Democrat') colour = '#FF6400';
    if (party === 'Plaid Cymru') colour = '#0AA77D';
    if (party === 'Reform UK') colour = '#00BED6';
    if (party === 'Restore Britain') colour = '#051C3F';
    if (party === 'Scottish National Party') colour = '#FFF685';
    if (party === 'Sinn Féin') colour = '#02665F';
    if (party === 'Social Democratic & Labour Party') colour = '#4EA268';
    if (party === 'Traditional Unionist Voice') colour = '#0C3A6A';
    if (party === 'Ulster Unionist Party') colour = '#A1CDF0';
    if (party === 'Your Party') colour = '#FD4E4E';

    return {
        fillColor: colour,
        weight: 0.5,
        opacity: 1,
        color: '#222222',
        fillOpacity: 0.75
    };
}

