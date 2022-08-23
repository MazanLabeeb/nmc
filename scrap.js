const puppeteer = require("puppeteer");
const fs = require("fs").promises;
const path = require('path');

const downloadLocation = path.join(__dirname, "public");

const sleep = time => new Promise(resolve => setTimeout(resolve, time));

module.exports.download = (code, date) => new Promise(async (resolve, reject) => {
  code = code.trim();
  date = date.trim();
  if(date.split.length != 2){
    return resolve({ invalidDetails: true });
  }
  const browser = await puppeteer.launch({
    headless: true,
  });
  const page = await browser.newPage();



  //load cookies
  const cookiesString = await fs.readFile("./cookies.json");
  const cookies = JSON.parse(cookiesString);
  await page.setCookie(...cookies);

  // change default download location for pupeteer
  const client = await page.target().createCDPSession()
  await client.send('Page.setDownloadBehavior', {
    behavior: 'allow',
    downloadPath: downloadLocation,
  })


  await page.goto("https://www.nmc.org.uk/registration/employer-confirmations/search/");


  try {
    await page.type("#employerConfirmationsForm > div.form-body > ul > li:nth-child(2) > div.form-group.form-pin.search-group > input", code);
  } catch (e) {
    await browser.close();
    reject({ loggedIn: false });
  }

  await page.type("#employerConfirmationsForm > div.form-body > ul > li:nth-child(2) > div.form-group.form-date.search-group > input.form-control.dateDay.allFields.cookies-only-disabled.autotab.validateOneRow", date.split("/")[0]);
  await page.type("#employerConfirmationsForm > div.form-body > ul > li:nth-child(2) > div.form-group.form-date.search-group > input.form-control.dateMonth.allFields.cookies-only-disabled.autotab.validateOneRow", date.split("/")[1]);
  await page.type("#employerConfirmationsForm > div.form-body > ul > li:nth-child(2) > div.form-group.form-date.search-group > input.form-control.datefour.allFields.checkYear.checkYearPast.cookies-only-disabled.autotab.validateOneRow", date.split("/")[2]);

  await sleep(1500);


  try {
    await page.click("#submitForm");
    await sleep(1500);
    await page.click("#ajaxForm > div.module.share > ul > li:nth-child(2) > a");

  } catch (e) {
    resolve({ invalidDetails: true });
  }

  await sleep(3000);
  resolve({ invalidDetails: false });

  // var nextPage = "https://www.nmc.org.uk/" + await page.$eval('#ajaxForm > div.module.share > ul > li:nth-child(2) > a', anchor => anchor.getAttribute('href'));


  // console.log(nextPage);


  await browser.close();
});
// https://www.nmc.org.uk/registration/employer-confirmations/search/ViewPdf/?encryptedSearchForm=1ZDNCoJAFIXf5a5nYQwYuRN10aIQF0FEiylvJYxza34gEd+9GUZ9h5bfPXznwhkhv9uO1FH0CBnsVYtfYNCgcdKaWjyxIWfxJKRDA5lyUjKotfBS0FA3+PGJ9dllhLpTviRJ84SnvPI9Jd1KMYQbj3QgZV+Bt5HPKLTHzS7lMLG5IX5Z3JVmd+XoBvwz88qg6t+SBtQFqUenexHGNPPqi5S37YE0FuSUhSyZfg==

