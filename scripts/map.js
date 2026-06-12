let geoJsonLayer;

const map = L.map('map', {
    center: [55.75, -3.5],
    zoom: 6,
    minZoom: 6,
    maxZoom: 12,
    maxBounds: L.latLngBounds([40, -15], [65, 5]),
});

L.tileLayer('https://{s}.basemaps.cartocdn.com/dark_nolabels/{z}/{x}/{y}{r}.png', {
    attribution: '&copy; OpenStreetMap contributors &copy; CARTO',
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
