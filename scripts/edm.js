async function filterEDMSignatures() {
    if (!window.geoJsonLayer) return;
    const isChecked = document.getElementById('filter-edm240').checked;

    const displayContainer = document.getElementById('data-display-container');
    const contentContainer = document.getElementById('data-box-content');

    if (!isChecked) {
        window.geoJsonLayer.eachLayer(layer => {
            layer.feature.properties.currentOpacity = 0.75;
            layer.setStyle({ fillOpacity: 0.75 });
        });
        displayContainer.style.display = 'none';
        return;
    }

    displayContainer.style.display = '';
    contentContainer.style.display = '';

    try {
        const response = await fetch('/data/edm240-stats.json');

        if (!response.ok) {
            throw new Error(`Error: ${response.status}`);
        }

        const data = await response.json();

        contentContainer.innerHTML = '';

        const totalElem = document.createElement('p');
        totalElem.innerHTML = `<strong>Total:</strong> ${data.totalSignatures}`;
        contentContainer.appendChild(totalElem);

        // Iterate through the party breakdown
        Object.entries(data.partyBreakdown).forEach(([party, stats]) => {
            if (stats.signatures > 0) {
                const partyRow = document.createElement('div');
                partyRow.className = 'party-row';

                partyRow.innerHTML = `
                    <span>${party}:</span>
                    <strong>${stats.signatures}</strong>
                    <small style="color: #666;">(${stats.percentageSigned}%)</small>
                `;

                contentContainer.appendChild(partyRow);
            }
        });

    } catch (error) {
        console.error("Could not load the EDM stats:", error);
        contentContainer.innerHTML = `<p style="color: red;">Error loading data.</p>`;
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
