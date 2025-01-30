import fs from "node:fs";
import dataDeduped from "./data-deduped.json" with { type: "json" };
import dataWithDupes from "./data-with-dupes.json" with { type: "json" };
import { deepOmit } from "./deep-omit";

const KEYS_TO_OMIT = [
	"enforcement",
	"jwplayer",
	"mimes",
	// 'transactionId',
	// 'tid',
	// 'mediaTypes',
	// 'nativeParams',
	// 'nativeOrtbRequest',
	"protocols",
	"regs",
	"renderer",
	"rtd",
	"schain",
	"segments",
	"site.content",
	"site.ext",
	"sizes",
	"user.data",
	"user.ext",
];

const formatBytesToKB = (num: number) => `${(num / 1024).toFixed(2)}KB`;

// @ts-ignore
const dedupedData = dataDeduped.flat();
const stringifiedDedupedData = JSON.stringify(dedupedData);
const dedupDataInfo = {
	numItems: dedupedData.length,
	stringifiedLength: formatBytesToKB(stringifiedDedupedData.length),
	avgSizeOfItem: formatBytesToKB(stringifiedDedupedData.length / dedupedData.length),
	avgSizePerBatchOf40: formatBytesToKB((stringifiedDedupedData.length / dedupedData.length) * 40),
};

// @ts-ignore
const dupedData = dataWithDupes.flat();
const stringifiedDupedData = JSON.stringify(dupedData);
const dupDataInfo = {
	numItems: dupedData.length,
	stringifiedLength: formatBytesToKB(stringifiedDupedData.length),
	avgSizeOfItem: formatBytesToKB(stringifiedDupedData.length / dupedData.length),
	avgSizePerBatchOf40: formatBytesToKB((stringifiedDupedData.length / dupedData.length) * 40),
};

const dedupedDataOmitted = dedupedData.map((item: any) => {
	return deepOmit(item, KEYS_TO_OMIT);
});
const stringifiedDedupedDataOmitted = JSON.stringify(dedupedDataOmitted);
const dedupDataOmittedInfo = {
	numItems: dedupedDataOmitted.length,
	stringifiedLength: formatBytesToKB(stringifiedDedupedDataOmitted.length),
	avgSizeOfItem: formatBytesToKB(stringifiedDedupedDataOmitted.length / dedupedDataOmitted.length),
	avgSizePerBatchOf40: formatBytesToKB((stringifiedDedupedDataOmitted.length / dedupedDataOmitted.length) * 40),
};

const dupedDataOmitted = dupedData.map((item: any) => {
	return deepOmit(item, KEYS_TO_OMIT);
});
const stringifiedDupedDataOmitted = JSON.stringify(dupedDataOmitted);
const dupDataOmittedInfo = {
	numItems: dupedDataOmitted.length,
	stringifiedLength: formatBytesToKB(stringifiedDupedDataOmitted.length),
	avgSizeOfItem: formatBytesToKB(stringifiedDupedDataOmitted.length / dupedDataOmitted.length),
	avgSizePerBatchOf40: formatBytesToKB((stringifiedDupedDataOmitted.length / dupedDataOmitted.length) * 40),
};

console.log(`Duped data:${JSON.stringify(dupDataInfo, null, 2)}`);
console.log(`Duped data with keys omitted:${JSON.stringify(dupDataOmittedInfo, null, 2)}`);
console.log(`Deduped data:${JSON.stringify(dedupDataInfo, null, 2)}`);
console.log(`Deduped data with keys omitted:${JSON.stringify(dedupDataOmittedInfo, null, 2)}`);

// save all 4 as JSON files minified to out folder
fs.writeFileSync("./output/deduped-data.json", JSON.stringify(dedupedData));
fs.writeFileSync("./output/duped-data.json", JSON.stringify(dupedData));
fs.writeFileSync("./output/deduped-data-omitted.json", JSON.stringify(dedupedDataOmitted));
fs.writeFileSync("./output/duped-data-omitted.json", JSON.stringify(dupedDataOmitted));
