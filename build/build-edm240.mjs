import fs from 'fs';
import path from 'path';
import { execSync } from 'child_process';

const dataDir = path.join(process.cwd(), 'public/data');
if (!fs.existsSync(dataDir)) {
    fs.mkdirSync(dataDir, { recursive: true });
}

const dateString = new Date().toISOString().split('T')[0];
const statsFilePath = path.join(dataDir, 'edm240-stats.json');
const edmFilePath = path.join(dataDir, 'edm240.json');

// Rename to appear shorter on mobile for easier reading
const normalizeParty = (name) => {
    const mapping = {
        "Scottish National Party": "SNP",
        "Social Democratic & Labour Party": "SDLP",
        "Liberal Democrat": "Lib Dem"
    };
    return mapping[name] || name;
};

try {
    console.log('Collecting EDM240 data');

    const edmUrl = 'https://oralquestionsandmotions-api.parliament.uk/EarlyDayMotion/65938';
    const response = await fetch(edmUrl);
    if (!response.ok) throw new Error(`Failed to fetch EDM data: ${response.status}`);
    const edmData = await response.json();
    fs.writeFileSync(path.join(dataDir, 'edm240.json'), JSON.stringify(edmData));

} catch (error) {
    console.error('Error fetching EDM data:', error);
}
console.log('EDM240 data collection complete');

try {
    console.log("Calculating EDM stats");
    if (!fs.existsSync(edmFilePath)) throw new Error("edm240.json not found");

    const edmData = JSON.parse(fs.readFileSync(edmFilePath, 'utf-8'));
    const sponsorList = edmData.Response?.Sponsors;
    if (!Array.isArray(sponsorList)) throw new Error("Invalid EDM240 structure");

    const signeeConstituencies = new Set();
    const uniqueMembers = new Set();

    const partyCounts = sponsorList.reduce((acc, item) => {
        if (item.IsWithdrawn || !item.Member) return acc;

        const { Id, Name, Constituency, Party } = item.Member;
        if (Constituency) signeeConstituencies.add(Constituency);

        const memberId = Id || Name;
        if (memberId && Party && !uniqueMembers.has(memberId)) {
            uniqueMembers.add(memberId);
            const normalizedParty = normalizeParty(Party);
            acc[normalizedParty] = (acc[normalizedParty] || 0) + 1;
        }
        return acc;
    }, {});

    // Fixes Jeremy Corbyn being listed as Independent instead of YP
    partyCounts["Your Party"] = partyCounts["Your Party"] + 1;
    partyCounts["Independent"] = partyCounts["Independent"] - 1;

    // Fixes Cameron Thomas being listed as Lib Dem instead of Independent
    partyCounts["Independent"] = partyCounts["Independent"] + 1;
    partyCounts["Lib Dem"] = partyCounts["Lib Dem"] - 1;

    const fullStats = {
        totalSignatures: signeeConstituencies.size,
        partyBreakdown: Object.fromEntries(
            Object.entries(partyCounts).map(([party, signatures]) => [
                party,
                { signatures, totalMPsInParliament: 0, percentageSigned: 0 }
            ])
        )
    };

    console.log(`Fetching MP counts for ${dateString}`);
    const response = await fetch(`https://members-api.parliament.uk/api/Parties/StateOfTheParties/1/${dateString}`);
    if (!response.ok) throw new Error(`Error: ${response.status}`);

    const data = await response.json();
    if (!Array.isArray(data?.items)) throw new Error("Unexpected API response structure.");

    data.items.forEach(({ value }) => {
        if (!value?.party) return;

        const partyName = normalizeParty(value.party.name);
        const totalMPs = value.total;

        if (!fullStats.partyBreakdown[partyName]) {
            fullStats.partyBreakdown[partyName] = { signatures: 0, totalMPsInParliament: 0, percentageSigned: 0 };
        }

        const stats = fullStats.partyBreakdown[partyName];
        stats.totalMPsInParliament = totalMPs;
        stats.percentageSigned = totalMPs > 0 ? Math.round((stats.signatures / totalMPs) * 100) : 0;
    });

    fs.writeFileSync(statsFilePath, JSON.stringify(fullStats, null, 2), 'utf-8');
    console.log(`Successfully saved combined EDM stats to ${statsFilePath}`);

} catch (error) {
    console.error("An error occurred during calculation:", error);
}
