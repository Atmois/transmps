// --- DOM Elements ---
const infoButton = document.getElementById('info-button');
const edmTrigger = document.getElementById('edm240-trigger');
const infoMenu = document.getElementById('info-menu');
const infoContent = document.getElementById('info-content');
const originalInfoContent = infoContent.innerHTML;
const edmInfoContent = `
    <span id="close-info-menu">&times;</span>
    <h2>EDM240</h2>
    <p>
        EDM240 is an Early Day Motion in the House of Commons that calls for the rejection of the proposed "Draft Code of Practice on Services, public functions and associations".

        The new Code of Practice to the Equality Act is set to pass Parliamentary scrutiny without even a vote. It is deeply unjust and urges organisations of all kinds, from hospitals
        to pubs, to exclude trans people from services and facilities that reflect their gender. In some circumstances trans people may also be excluded from services and facilities that
        reflect their gender identity. This code is unsafe, it will be based on what people look and act like, meaning that everyone will be exposed to humiliating and dangerous gender policing.

        Trans people will be pushed out of services and spaces they need severly limiting their access to public life. The Code of Practice fatally undermines our protection from discrimination
        under the Equality Act 2010, and the purpose of the Gender Recognition Act. For organisations, the code is unworkable, exposing businesses, public service and community groups to a high
        risk of complaints and litigation.

        <br /><br />

        The motion has been signed by MPs across the benches and is the most signed EDM in over half a decade. The Draft Code will automatically become law if it is not rejected
        by Parliament after 40 days, which is why it is important to contact your MP and ask them to sign EDM240 and reject the Draft Code. Even if your MP has already signed or
        is an MP whom does not sign EDM's, it is still important to contact them and ask them to speak out against the Draft Code as the more MPs that speak out against it, the
        more likely it is to be brought to a vote and rejected.
    </p>
    <p>
        You can learn how to contact your MP and what to say at <a href="https://equalrecognition.eaction.org.uk/rejectthecode" target="_blank">equalrecognition.eaction.org.uk/rejectthecode</a>
        and you can find your MP's contact details on the <a href="https://members.parliament.uk/members/commons" target="_blank">parliament.uk</a> site. Remember to be polite
        and respectful when contacting your MP, as they are more likely to respond positively to well-reasoned arguments and respectful communication. You can also ask your friends
        to contact their MP's as well to show that this is an issue that matters to people across the UK and political spectrum.

        <br /><br />

        If you are able to attend the Mass Lobby of Parliament in support of EDM240 on Thursday 25th June, please consider doing so. You can find more information about the event at
        <a href="https://www.transsolidarityalliance.com/mass-lobby-2026" target="_blank">transsolidarityalliance.com/mass-lobby-2026</a>. The information above was partially sourced from
        the <a href="https://www.transsolidarityalliance.com/mass-lobby-20266" target="_blank">Trans+ Solidary Alliance Mass Lobby Briefing</a>.
    </p>
`;

// Main Info
infoButton.addEventListener('click', () => {
    infoContent.innerHTML = originalInfoContent;
    infoMenu.style.display = 'block';
});

// EDM Info
edmTrigger.addEventListener('click', (e) => {
    e.preventDefault();
    infoContent.innerHTML = edmInfoContent;
    infoMenu.style.display = 'block';
});

infoMenu.addEventListener('click', (e) => {
    if (e.target.id === 'close-info-menu' || e.target === infoMenu) {
        infoMenu.style.display = 'none';
    }
});
window.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
        infoMenu.style.display = 'none';
    }
});
