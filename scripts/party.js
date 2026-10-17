import { openInfo } from './info.js';

const supportiveParties = ['Liberal Democrat', 'Green Party', 'Plaid Cymru'];
const hostileParties = ['Conservative', 'Reform UK', 'Restore Britain'];
const nullParties = ['Speaker', 'Sinn Féin', 'Vacant'];

const dataBox = document.getElementById('data-display-container');
const dataBoxTitle = document.getElementById('data-box-title');
const dataBoxContent = document.getElementById('data-box-content');
const dataBoxNote = document.getElementById('data-box-note');

async function filterPartyStances() {
    if (!window.geoJsonLayer) return;
    const isChecked = document.getElementById('filter-party').checked;

    if (!isChecked) {
        window.geoJsonLayer.eachLayer(layer => {
            const props = layer.feature.properties;
            const baseStyle = getPartyStyle(props.mp_party);
            props.currentOpacity = baseStyle.fillOpacity;
            layer.setStyle(baseStyle);
        });
        dataBox.style.display = 'none';
        return;
    }

    document.getElementById('filter-edm240').checked = false;

    const counts = { supportive: 0, hostile: 0, none: 0, other: 0 };

    try {
        window.geoJsonLayer.eachLayer(layer => {
            const props = layer.feature.properties;
            let colour, opacity, category;

            if (supportiveParties.includes(props.mp_party)) {
                colour = '#00FF00'; opacity = 0.75; category = 'supportive';
            } else if (hostileParties.includes(props.mp_party)) {
                colour = '#FF0000'; opacity = 0.25; category = 'hostile';
            } else if (nullParties.includes(props.mp_party)) {
                colour = '#000000'; opacity = 0.25; category = 'none';
            } else {
                colour = '#CCCCCC'; opacity = 0.25; category = 'other';
            }

            counts[category]++;
            props.currentOpacity = opacity;
            layer.setStyle({ fillColor: colour, fillOpacity: opacity });
        });

        dataBoxTitle.textContent = 'Party Stances';
        dataBoxNote.dataset.mode = 'parties';
        dataBoxNote.innerHTML = '<a>More Info</a>';
        dataBoxNote.style.cursor = "pointer"

        dataBoxContent.innerHTML = `
            <div class="party-row"><span>Supportive:</span> <strong>${counts.supportive}</strong></div>
            <div class="party-row"><span>Hostile:</span> <strong>${counts.hostile}</strong></div>
            <div class="party-row"><span>No stance:</span> <strong>${counts.other}</strong></div>
            <div class="party-row"><span>Excluded:</span> <strong>${counts.other}</strong></div>
        `;
        dataBoxContent.style.display = '';
        dataBox.style.display = '';
    } catch (error) {
        console.error("Error filtering party stances:", error);
    }
}

document.addEventListener('DOMContentLoaded', () => {
    document.getElementById('filter-party').addEventListener('change', filterPartyStances);
});
dataBoxNote.addEventListener('click', () => {
    if (dataBoxNote.dataset.mode !== 'parties') return;
    openInfo('info/parties.html');
});
// KEEP THIS TRIGGER OR ELSE THE HOVERING OPACITY CHANGE BREAKS
document.addEventListener('mapLayersReady', filterPartyStances);
