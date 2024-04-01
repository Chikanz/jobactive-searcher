import axiod from "https://deno.land/x/axiod/mod.ts";
import type { JobResponse, Job } from "./searchTypes.ts";
import { uwu } from "./uwu.ts";

console.log(`%c${uwu}`, "color: yellow");
console.log("\n%ccan i have centerlink monies pls??\n", "color: #FFC0CB; font-weight: bold");

// const apiUrl = 'https://www.workforceaustralia.gov.au/api/v1/global/vacancies/';
const applyURL = 'https://www.workforceaustralia.gov.au/individuals/jobs/apply/';
const detailUrl = 'https://www.workforceaustralia.gov.au/individuals/jobs/details/';

//Default args
let jobAge = 14; //--jobAge=14
let location = 71; //--locationCode=71 (defaults to melbourne)
let pagesToSearch = 5; //--pagesToSearch=5
let openInBrowser = true; //--openInBrowser=true
let jobsToOpen = 10; //--jobsToOpen=10

//parse args from command line
const args = Deno.args;
for (let i = 0; i < args.length; i++) {
  const arg = args[i];
  if (arg.startsWith("--jobAge=")) {
    jobAge = parseInt(arg.split("=")[1]);
  }
  else if (arg.startsWith("--locationCode=")) {
    location = parseInt(arg.split("=")[1]);
  }
  else if (arg.startsWith("--pagesToSearch=")) {
    pagesToSearch = parseInt(arg.split("=")[1]);
  }
  else if (arg.startsWith("--openInBrowser=")) {
    openInBrowser = arg.split("=")[1] === "true";
  }
  else if (arg.startsWith("--jobsToOpen=")) {
    jobsToOpen = parseInt(arg.split("=")[1]);
  }
}

const jobs = await GetJobs();
if (!jobs) Deno.exit(1);

//Only get jobs that have an easy online application
const filteredJobs = Object.values(jobs).filter(job => job.isApplyOnlineJob);

console.log("\n");
console.log("🥳 %cFound " + filteredJobs.length + " easy apply jobs!", "font-weight: bold; color: #33b3e3");
console.log("\n");

//Sort by newest first
filteredJobs.sort((a, b) => new Date(b.creationDate).getTime() - new Date(a.creationDate).getTime());

//Write out all jobs to a csv
WriteCSV('output', filteredJobs);

//Yeet shit jobs too
const noneasyJobs = Object.values(jobs).filter(job => !job.isApplyOnlineJob);
noneasyJobs.sort((a, b) => new Date(b.creationDate).getTime() - new Date(a.creationDate).getTime());
WriteCSV('nonEasyApply', noneasyJobs);

//Open first 10 in browser
for (let i = 0; i < jobsToOpen; i++) {
  if(!openInBrowser) break;
  const job = filteredJobs[i];
  if (!job) continue;
  console.log(`Opening job: ${job.title}`)

  //On windows use start, on mac or linux use open
  console.log(detailUrl + job.vacancyId);

  if (Deno.build.os === "windows") {
    Deno.run({ cmd: ["start", detailUrl + job.vacancyId] });
  }
  else if (Deno.build.os === "linux") {
    Deno.run({ cmd: ["xdg-open", detailUrl + job.vacancyId] });
  }
  else if (Deno.build.os === "darwin") {
    Deno.run({ cmd: ["open", detailUrl + job.vacancyId] });
  }
}

//Pause console by waiting for input
console.log("All done! • ⩊ •");
await Deno.stdin.read(new Uint8Array(1));


function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function WriteCSV(name: string, jobs: Job[]) {
  const csv = "title,employer,location,URL,Apply link\n" + jobs.map(job => `${job.title},${job.employerName},${job.location.label},${detailUrl + job.vacancyId},${applyURL + job.vacancyId}`).join('\n');
  await Deno.writeTextFile(name + ".csv", csv);
}

//Filters by melbourne + posted in the last fortnight
function MelbJobURL(title: string, page: number) {
  return `https://www.workforceaustralia.gov.au/api/v1/global/vacancies/?searchText=${title}&locationCodes=${location}&pageNumber=${page}&jobAge=${jobAge}`;
}

async function SearchForJobs(title: string, page: number) {
  try {
    const response = await axiod.get<JobResponse>(MelbJobURL(title, page));

    // Extract rate limit headers
    //@ts-ignore
    const rateLimit = parseInt(response.headers.get('x-rate-limit-limit'), 10);
    //@ts-ignore
    const rateLimitRemaining = parseInt(response.headers.get('x-rate-limit-remaining'), 10);
    //@ts-ignore
    const rateLimitReset = parseInt(response.headers.get('x-rate-limit-reset'), 10); // UNIX epoch time when the rate limit resets

    // Return both the data and the rate limit info
    return { data: response.data, rateLimit, rateLimitRemaining, rateLimitReset };
  } catch (error) {
    console.error(`Failed to fetch details for ID ${title}:`, error.message);
    return null;
  }
}

async function GetJobs() {
  try {
    let jobs: { [id: number]: Job } = {};

    const decoder = new TextDecoder("utf-8");
    let searchList;
    try {
      const file = await Deno.readFileSync("jobs.txt");
      const searches = decoder.decode(file);
      searchList = searches.split('\n').filter(Boolean); // Split by newline and filter out any empty lines
    }
    catch {
      console.error("Missing jobs.txt file. Please create a jobs.txt file with a list of job titles to search for.");
      Deno.exit(1);
    }

    for (const search of searchList) {
      //Get 5 pages of results 
      let page = 1;
      console.log(`Fetching ${search} jobs...`);
      for (let i = 0; i < pagesToSearch; i++) {
        const result = await SearchForJobs(search, page);
        if (!result) {
          console.error("Failed to fetch job details for search term: ", search);
          continue;
        }

        if(result.data.results.length === 0) {
          console.log(`No more ${search} jobs found after page ${page}`);
          break;
        }

        //Add all jobs to the jobs object + auto remove duplicates
        result.data.results.forEach((job) => {
          jobs[job.result.vacancyId] = job.result;
        });

        console.log(`Got ${Object.keys(jobs).length} jobs`)

        // Adjust delay based on rate limit info
        if (result && result.rateLimitRemaining === 0) {
          // Calculate delay until rate limit reset
          const currentTime = Math.floor(Date.now() / 1000); // Convert current time to UNIX epoch seconds
          const delaySeconds = result.rateLimitReset - currentTime;
          if (delaySeconds > 0) {
            console.log(`Rate limit exceeded. Waiting for ${delaySeconds} seconds until reset.`);
            await sleep(delaySeconds * 1000); // Convert seconds to milliseconds
          }
        } else {
          // Apply minimal delay to responsibly manage request frequency
          await sleep(100);
        }
        page++;
      }

    }

    return jobs;
  } catch (error) {
    console.error('Failed to read file or process IDs:', error.message);
  }
}
