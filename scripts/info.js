const infoButton = document.getElementById('info-button');
const edmInfoButton = document.getElementById('edm240-info-button');
const partyInfoButton = document.getElementById('party-info-button');
const infoMenu = document.getElementById('info-menu');
const infoContent = document.getElementById('info-content');
const closeInfoButton = document.getElementById('close-info-menu');

export async function openInfo(file) {
    const response = await fetch(file);
    infoContent.innerHTML = await response.text();
    infoContent.scrollTop = 0;
    infoMenu.style.display = 'flex';
    closeInfoButton.focus();
}

function closeInfo() {
    infoMenu.style.display = 'none';
}

infoButton.addEventListener('click', () => openInfo('info/about.html'));
edmInfoButton.addEventListener('click', () => openInfo('info/edm240.html'));
partyInfoButton.addEventListener('click', () => openInfo('info/parties.html'));

infoMenu.addEventListener('click', (e) => {
    if (e.target === infoMenu || e.target.closest('#close-info-menu')) {
        closeInfo();
    }
});

window.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && infoMenu.style.display !== 'none') {
        closeInfo();
    }
});
