function handleSearch() {
    const inputElement = document.getElementById('postcode-input');
    const postcode = inputElement.value.trim().replaceAll(/\s/g, '');

    inputElement.classList.remove('error-state');
    inputElement.placeholder = "Postcode";

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
                if (highlightedLayer) {
                    highlightedLayer.setStyle({
                        weight: 0.5,
                        color: '#222222',
                        fillOpacity: 0.75
                    });
                }
                if (postcodeMarker) map.removeLayer(postcodeMarker);
            }

            geoJsonLayer.eachLayer(function (layer) {
                if (layer.feature.properties.PCON24NM.toLowerCase() === constituencyName.toLowerCase()) {
                    matchFound = true;
                    highlightedLayer = layer;
                    layer.setStyle({
                        weight: 5,
                        color: '#FF80FF'
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
                    fillOpacity: 0.8
                }).addTo(map);

                postcodeMarker.bringToFront();
                map.setView([postcodeLat, postcodeLng], 11);
                highlightedLayer.openPopup([postcodeLat, postcodeLng]);
            }

        })
        .catch(err => {
            inputElement.value = '';
            inputElement.placeholder = "invalid";
            inputElement.classList.add('error-state');
            console.error(err);
        });
}

document.addEventListener('DOMContentLoaded', () => {
    document.getElementById('search-button').addEventListener('click', handleSearch);
    document.getElementById('postcode-input').addEventListener('keypress', (e) => {
        if (e.key === 'Enter') handleSearch();
    });
});
