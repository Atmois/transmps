const infoButton = document.getElementById('info-button');
const edmInfoButton = document.getElementById('edm240-info-button');
const partyInfoButton = document.getElementById('party-info-button');
const infoMenu = document.getElementById('info-menu');
const infoContent = document.getElementById('info-content');
const closeInfoButton = document.getElementById('close-info-menu');
const originalInfoContent = infoContent.innerHTML;

const edmInfoContent = `
    <h2>EDM240</h2>
    <p>
        <i>Please be aware that the Draft Code Amendment has now come into effect, however MPs are still able to sign it and show their support against the amended
        Code of Practice. Signing EDM240 is a way for MPs to show their support for trans rights and a step towards rejecting any future attempts to attack
        them further.</i>
    </p>
    <p>
        EDM240 is an Early Day Motion in the House of Commons that calls for the rejection of the proposed "Draft Code of Practice on Services, public functions and associations".
    </p>
    <p>
        The new Code of Practice to the Equality Act is set to pass Parliamentary scrutiny without even a vote. It is deeply unjust and urges organisations of all kinds, from hospitals
        to pubs, to exclude trans people from services and facilities that reflect their gender. In some circumstances trans people may also be excluded from services and facilities that
        reflect their gender identity. This code is unsafe, it will be based on what people look and act like, meaning that everyone will be exposed to humiliating and dangerous gender policing.
    </p>
    <p>
        Trans people will be pushed out of services and spaces they need, severely limiting their access to public life. The Code of Practice fatally undermines our protection from discrimination
        under the Equality Act 2010, and the purpose of the Gender Recognition Act. For organisations, the code is unworkable, exposing businesses, public service and community groups to a high
        risk of complaints and litigation.
    </p>
    <p>
        The motion has been signed by MPs across the benches and is the most signed EDM in over half a decade. The Draft Code will automatically become law if it is not rejected
        by Parliament after 40 days, which is why it is important to contact your MP and ask them to sign EDM240 and reject the Draft Code. Even if your MP has already signed or
        is an MP who does not sign EDMs, it is still important to contact them and ask them to speak out against the Draft Code, as the more MPs that speak out against it, the
        more likely it is to be brought to a vote and rejected.
    </p>
    <p>
        You can learn how to contact your MP and what to say at <a href="https://equalrecognition.eaction.org.uk/rejectthecode" target="_blank" rel="noopener">equalrecognition.eaction.org.uk/rejectthecode</a>
        and you can find your MP's contact details on the <a href="https://members.parliament.uk/members/commons" target="_blank" rel="noopener">parliament.uk</a> site. Remember to be polite
        and respectful when contacting your MP, as they are more likely to respond positively to well-reasoned arguments and respectful communication. You can also ask your friends
        to contact their MPs as well to show that this is an issue that matters to people across the UK and political spectrum.
    </p>
`;

const partyInfoContent = `
    <h2>Party Stances</h2>
    <p>
        This filter sorts the parties by their party policy on trans rights. If a party is listed as supportive, it means they have an official stance in support
        of trans rights. If a party is listed as unsupportive, it means they have an official stance against trans rights. If a party is not listed, it means they
        have no official stance on trans rights. New or smaller parties will likely not be listed for a while as they may not have a stance yet.
    </p>

    <h3>Supportive Parties</h3>
    <ul>
        <li>
            Liberal Democrats
            <blockquote>
                <a href="https://libdems.org.uk/manifesto" target="_blank" rel="noopener">Manifesto</a> (Section 19)<br />
                <a href="https://www.libdems.org.uk/conference/motions/autumn-2026/f33a-restoring-trans-rights" target="_blank" rel="noopener">Autumn 2026 Conference Motion</a>
            </blockquote>
        </li>
        <li>
            Green Party
            <blockquote>
                <a href="https://greenparty.org.uk/about/our-manifesto/defending-human-rights-democracy-and-justice/" target="_blank" rel="noopener">Manifesto</a><br />
                <a href="https://greenparty.org.uk/2025/04/27/greens-respond-to-interim-ehrc-guidance/" target="_blank" rel="noopener">Response to Interim EHRC Guidance</a>
            </blockquote>
        </li>
        <li>
            Plaid Cymru
            <blockquote>
                <a href="https://www.partyof.wales/lhdtc" target="_blank" rel="noopener">Manifesto</a><br />
                <a href="https://www.partyof.wales/trans_equality" target="_blank" rel="noopener">2020 Statement on Values</a>
            </blockquote>
        </li>
    </ul>

    <h3>Hostile Parties</h3>
    <ul>
        <li>
            Conservative Party
            <blockquote>
                <a href="https://public.conservatives.com/static/documents/GE2024/Conservative-Manifesto-GE2024.pdf" target="_blank" rel="noopener">Manifesto (p27)</a>
            </blockquote>
        </li>
        <li>
            Reform UK
            <blockquote>
                <a href="https://assets.nationbuilder.com/reformuk/pages/253/attachments/original/1718625371/Reform_UK_Our_Contract_with_You.pdf" target="_blank" rel="noopener">Manifesto (p2,11,16)</a>
            </blockquote>
        </li>
        <li>
            Restore Britain
            <blockquote>
                <a href="https://restorebritain.org.uk/cultural_identity_social_issues" target="_blank" rel="noopener">Social Policies</a>
            </blockquote>
        </li>
    </ul>

    <p>
        Please note that this will not necessarily reflect the views of individual MPs, as they may have different stances on trans rights than their party's
        official policy. This may also be out of date as parties may change their policies over time, so it is always a good idea to check the party's official
        website for the most up-to-date information.
    </p>
    <p>
        Due to the nature of Independent MPs, they will not be listed here as they do not have a party stance, their info will come along with the individual MP breakdown.
        Sinn Féin MPs and the Speaker will not be listed as they do not hold any political stances within the House of Commons, their opinions however may vary.
    </p>
    <p>
        We are working on an individual MP breakdown, however due to enormous amounts of information out there, it is taking us a while to compile it all and ensure it is
        accurate and up-to-date. If you want to help, or learn more, check the info menu in the top right corner of the page. If you see a mistake or have any
        missing information (or even more sources to add to the list), please contact us so we can fix it!
    </p>
`;

function openInfo(html) {
    infoContent.innerHTML = html;
    infoContent.scrollTop = 0;
    infoMenu.style.display = 'flex';
    closeInfoButton.focus();
}

function closeInfo() {
    infoMenu.style.display = 'none';
}

// Main Info
infoButton.addEventListener('click', () => openInfo(originalInfoContent));
edmInfoButton.addEventListener('click', () => openInfo(edmInfoContent));
partyInfoButton.addEventListener('click', () => openInfo(partyInfoContent));

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
