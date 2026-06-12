let highlightedLayer = null;
let postcodeMarker = null;

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
