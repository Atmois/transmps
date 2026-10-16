const supportiveParties = ['Liberal Democrat', 'Green Party', 'Plaid Cymru'];
const hostileParties = ['Conservative', 'Reform UK', 'Restore Britain'];
const nullParties = ['Speaker', 'Sinn Féin', 'Vacant']

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
        return;
    }

    document.getElementById('filter-edm240').checked = false;
    document.getElementById('data-display-container').style.display = 'none';

    try {
        window.geoJsonLayer.eachLayer(layer => {
            const props = layer.feature.properties;
            let colour, opacity;

            if (supportiveParties.includes(props.mp_party)) {
                colour = '#00FF00';
                opacity = 0.75;
            } else if (hostileParties.includes(props.mp_party)) {
                colour = '#FF0000';
                opacity = 0.25;
            } else if (nullParties.includes(props.mp_party)) {
                colour = '#000000';
                opacity = 0.25;
            } else {
                colour = '#CCCCCC';
                opacity = 0.25;
            }

            props.currentOpacity = opacity;
            layer.setStyle({ fillColor: colour, fillOpacity: opacity });
        });
    } catch (error) {
        console.error("Error filtering party stances:", error);
    }
}

document.addEventListener('DOMContentLoaded', () => {
    document.getElementById('filter-party').addEventListener('change', filterPartyStances);
});
// KEEP THIS TRIGGER OR ELSE THE HOVERING OPACITY CHANGE BREAKS
document.addEventListener('mapLayersReady', filterPartyStances);
