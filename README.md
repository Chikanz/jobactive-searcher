# Jobactive Searcher CLI

A lil tool to help the centerlink homies find easy-to-apply job listings to
meet mutual obligations more easily. Because what a dogshit system that [should be abolished](https://greens.org.au/campaigns/abolish-mutual-obligations).

## Usage

Create a `jobs.txt` file in the same file as the program. Each line in the file should
contain a job title to search for. For example:

    barista
    retail
    marketing

You can then click on the program to run it with default settings or run it from the command line to change them.

### Command Line Arguments

- `--jobAge=<days>`: Filter jobs posted within the specified age in days.
  Default is 14.
- `--locationCode=<locationCode>`: Filter jobs by location code. Default is 71
  (Melbourne).

  Other locations (you can find them all in locations.md)
  Sydney: 21
  Brisbane: 41
  Hobart: 61HRBT,
  Canberra: 19AACQ
  Perth: 81

- `--pagesToSearch=<number>`: Number of pages to search for each title. Default is 5.
- `--openInBrowser=<true|false>`: Open the first N job listings in the default
  browser. Default is true.
- `--jobsToOpen=<number>`: Number of job listings to open in the browser.
  Default is 10.

## Outputs

The script generates two CSV files:

- `output.csv`: Contains easily applicable jobs sorted by newest first.
- `nonEasyApply.csv`: Contains other jobs sorted by newest first.
