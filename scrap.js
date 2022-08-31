const puppeteer = require("puppeteer");
const fs = require("fs").promises;
const path = require('path');

const downloadLocation = path.join(__dirname, "public");

const sleep = time => new Promise(resolve => setTimeout(resolve, time));

module.exports.download = (code, date) => new Promise(async (resolve, reject) => {
  code = code.trim();
  date = date.trim();
  if (date.split.length != 2) {
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
    console.log("Entering Code");
    
  } catch (e) {
    await browser.close();
    reject({ loggedIn: false });
  }

  await page.type("#employerConfirmationsForm > div.form-body > ul > li:nth-child(2) > div.form-group.form-date.search-group > input.form-control.dateDay.allFields.cookies-only-disabled.autotab.validateOneRow", date.split("/")[0]);
  await page.type("#employerConfirmationsForm > div.form-body > ul > li:nth-child(2) > div.form-group.form-date.search-group > input.form-control.dateMonth.allFields.cookies-only-disabled.autotab.validateOneRow", date.split("/")[1]);
  await page.type("#employerConfirmationsForm > div.form-body > ul > li:nth-child(2) > div.form-group.form-date.search-group > input.form-control.datefour.allFields.checkYear.checkYearPast.cookies-only-disabled.autotab.validateOneRow", date.split("/")[2]);


  console.log("Entering Date");


  try {
    await page.waitForSelector("#submitForm");
    await page.click("#submitForm");

    console.log("Form Submitted");

  } catch (e) {
    resolve({ invalidDetails: true });
  }


  await page.evaluate((code) => {
    fetch("https://www.nmc.org.uk//registration/employer-confirmations/search/ViewPdf/?encryptedSearchForm=7ZLLDoIwEEX/ZdZdFB8xsCPAwgWGsDAxxkWVUUlKq30kEsK/26bARxiXZ2bOnc0dIL2ZVooD6xAS2IsGP0CgRm250RV7YC2twSPjFjUkwnJOoFLMSV5DVePbbYzbnQeoWuFCaJTRLY0Ll5PLa856N1utA5VSmKe/2QQ+IVMOo3gXw0imhPBldhea3IWD6/Fv/ph5IVB0Ly57VJkU91Z1zNdNT72cpbRpSqkwk1YYSOj4BQ==")
      .then((res) => { return res.blob(); })
      .then((data) => {
        
        var a = document.createElement("a");
        a.href = window.URL.createObjectURL(data);
        a.download = code;
        a.click();
      });
  }, code);
  

  
  await sleep(3000);

  console.log("File Downloaded");

  
  let fileName = code + ".pdf";
  resolve({ invalidDetails: false, fileName : fileName });


  // var nextPage = "https://www.nmc.org.uk/" + await page.$eval('#ajaxForm > div.module.share > ul > li:nth-child(2) > a', anchor => anchor.getAttribute('href'));
  
  await browser.close();
});