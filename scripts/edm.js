import { openInfo } from './info.js';

const dataBox = document.getElementById('data-display-container');
const dataBoxContent = document.getElementById('data-box-content');
const dataBoxNote = document.getElementById('data-box-note')

async function filterEDMSignatures() {
    if (!window.geoJsonLayer) return;
    const isChecked = document.getElementById('filter-edm240').checked;

    if (!isChecked) {
        window.geoJsonLayer.eachLayer(layer => {
            layer.feature.properties.currentOpacity = 0.75;
            layer.setStyle({ fillOpacity: 0.75 });
        });
        dataBox.style.display = 'none';
        return;
    }
    if (isChecked) {
        document.getElementById('filter-party').checked = false;
        window.geoJsonLayer.eachLayer(layer => {
            const props = layer.feature.properties;
            const baseStyle = getPartyStyle(props.mp_party);
            props.currentOpacity = baseStyle.fillOpacity;
            layer.setStyle(baseStyle);
        });
    }

    dataBox.style.display = '';
    dataBoxContent.style.display = '';

    try {
        const response = await fetch('/data/edm240-stats.json');

        if (!response.ok) {
            throw new Error(`Error: ${response.status}`);
        }

        const data = await response.json();

        dataBoxContent.innerHTML = '';
        dataBoxNote.dataset.mode = 'edm240';
        dataBoxNote.style.cursor = "cursor"
        dataBoxNote.innerHTML = 'Highlighted = Signee<br/><a>More Info</a>'

        const totalElement = document.createElement('p');
        totalElement.innerHTML = `<strong>Total:</strong> ${data.totalSignatures}`;

        dataBoxContent.appendChild(totalElement);

        // Iterate through the party breakdown
        Object.entries(data.partyBreakdown).forEach(([party, stats]) => {
            if (stats.signatures > 0) {
                const partyRow = document.createElement('div');
                partyRow.className = 'party-row';

                partyRow.innerHTML = `
                    <span>${party}:</span>
                    <strong>${stats.signatures}</strong>
                    <small style="color: #666666;">(${stats.percentageSigned}%)</small>
                `;

                dataBoxContent.appendChild(partyRow);
            }
        });

    } catch (error) {
        console.error("Could not load the EDM stats:", error);
        dataBoxContent.innerHTML = `<p style="color: red;">Error loading data.</p>`;
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

document.addEventListener('DOMContentLoaded', () => {
    document.getElementById('filter-edm240').addEventListener('change', filterEDMSignatures);
});
dataBoxNote.addEventListener('click', () => {
    if (dataBoxNote.dataset.mode !== 'edm240') return;
    openInfo('info/edm240.html');
});
// KEEP THIS TRIGGER OR ELSE THE HOVERING OPACITY CHANGE BREAKS
document.addEventListener('mapLayersReady', filterEDMSignatures);
