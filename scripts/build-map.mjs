import fs from 'fs';
import path from 'path';
import { execSync } from 'child_process';

const unknownPictureUrl = 'https://members.parliament.uk/dist/vacant-placeholder.png';
const dataDir = path.join(process.cwd(), 'public/data');
if (!fs.existsSync(dataDir)) {
    fs.mkdirSync(dataDir, { recursive: true });
}

async function collectEDM240Data() {
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
}

async function buildMap() {
    try {
        console.log("Downloading Constituency boundaries");
        const arcgisUrl = "https://services1.arcgis.com/ESMARspQHYMw9BZ9/arcgis/rest/services/Westminster_Parliamentary_Constituencies_July_2024_Boundaries_UK_BUC/FeatureServer/0/query?where=1%3D1&outFields=*&outSR=4326&f=geojson";

        const response = await fetch(arcgisUrl);
        if (!response.ok) throw new Error(`ArcGIS download failed: ${response.status}`);

        const boundariesGeoJSON = await response.json();
        console.log("Boundaries downloaded");

        let allMembers = [];
        let skip = 0;
        let fetchFinished = false;

        console.log("Fetching data from Parliament API");
        while (!fetchFinished) {
            const apiURL = `https://members-api.parliament.uk/api/Members/Search?house=1&IsCurrentMember=true&take=10&skip=${skip}`;
            const apiResponse = await fetch(apiURL);

            if (!apiResponse.ok) {
                console.error(`Error pulling API batch at skip ${skip}. Discontinuing fetch`);
                fetchFinished = true;
                break;
            }

            const data = await apiResponse.json();
            const items = data.items;

            if (!items || items.length === 0) {
                fetchFinished = true;
            } else {
                allMembers = allMembers.concat(items);
                skip += 10;
            }
        }

        console.log(`Fetched ${allMembers.length} MPs`);

        const sampleProps = boundariesGeoJSON.features[0].properties;
        let matchedCount = 0;

        boundariesGeoJSON.features = boundariesGeoJSON.features.map(feature => {
            let mapName = feature.properties[PCON24NM];

            // Done manually as the API returns a different name for this constituency than the map file
            if (mapName === "Montgomeryshire and Glyndwr") {
                feature.properties[PCON24NM] = "Montgomeryshire and Glyndŵr";
                mapName = "Montgomeryshire and Glyndŵr";
            }

            const match = allMembers.find(m => {
                const val = m.value;
                const membership = val.latestHouseMembership;
                const apiConstituencyName = membership.membershipFrom;
                return apiConstituencyName === mapName;
            });

            if (match) {
                const mpInfo = match.value;
                feature.properties.mp_name = mpInfo.nameDisplayAs;
                feature.properties.mp_party = mpInfo.latestParty.name;
                feature.properties.mp_image = mpInfo.thumbnailUrl || unknownPictureUrl;
                matchedCount++;
            } else {
                feature.properties.mp_name = "Vacant";
                feature.properties.mp_party = "N/A";
                feature.properties.mp_image = unknownPictureUrl;
            }
            return feature;
        });

        console.log(`Matched ${matchedCount} out of ${boundariesGeoJSON.features.length} to MPs`);

        const mergedFilePath = path.join(dataDir, 'preoptimisation-mps.geojson');
        fs.writeFileSync(mergedFilePath, JSON.stringify(boundariesGeoJSON));
        console.log("Data successfully merged into staging file");

        console.log("Simplifying vectors with Mapshaper");
        const finalFilePath = path.join(dataDir, 'mps.geojson');

        execSync(`pnpm exec mapshaper "${mergedFilePath}" -simplify 75% keep-shapes -o "${finalFilePath}"`, { stdio: 'inherit' });

        if (fs.existsSync(mergedFilePath)) {
            fs.unlinkSync(mergedFilePath);
        }

        console.log(`\nComplete: ${finalFilePath}`);

    } catch (error) {
        console.error("Failed:", error.message);
    }
}

buildMap();
collectEDM240Data();
