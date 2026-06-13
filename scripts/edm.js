async function filterEDMSignatures() {
    if (!window.geoJsonLayer) return;
    const isChecked = document.getElementById('filter-edm240').checked;

    if (!isChecked) {
        window.geoJsonLayer.eachLayer(layer => {
            layer.feature.properties.currentOpacity = 0.75;
            layer.setStyle({ fillOpacity: 0.75 });
        });
        return;
    }

    try {
        const data = await fetch("/data/edm240.json").then(response => {
            if (!response.ok) throw new Error(`Failed to fetch edm240.json: ${response.status}`);
            return response.json();
        });

        const edmDetails = data.Response;
        if (!edmDetails) return;

        const signeeConstituencies = new Set();
        const sponsorList = edmDetails.Sponsors;

        if (Array.isArray(sponsorList)) {
            sponsorList.forEach(item => {
                if (item.IsWithdrawn) return;
                const constituency = item.Member.Constituency;
                if (constituency) {
                    signeeConstituencies.add(constituency);
                }
            });
        }

        window.geoJsonLayer.eachLayer(layer => {
            const mapName = layer.feature.properties.PCON24NM;
            if (!mapName) return;

            const isAMatch = signeeConstituencies.has(mapName);
            let targetOpacity;

            if (isAMatch) {
                targetOpacity = 0.75;
            } else {
                targetOpacity = 0.25;
            }

            layer.feature.properties.currentOpacity = targetOpacity;
            layer.setStyle({ fillOpacity: targetOpacity });
        });

    } catch (error) {
        console.error("Error running EDM filter:", error);
    }
}

document.addEventListener('mapLayersReady', filterEDMSignatures);
document.addEventListener('DOMContentLoaded', () => {
    document.getElementById('filter-edm240').addEventListener('change', filterEDMSignatures);
});
