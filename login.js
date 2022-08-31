const puppeteer = require("puppeteer");
const fs = require('fs').promises;
const sleep = (milliseconds) => {
    return new Promise((resolve) => setTimeout(resolve, milliseconds));
};

module.exports.login = (code, pass) => new Promise(async (resolve, reject) => {
    console.log("> "+ "Logging In...");

    code = code.trim();
    pass = pass.trim();
    var flag = false;
    const browser = await puppeteer.launch({ headless: true });
    const page = await browser.newPage();
    await page.goto("https://www.nmc.org.uk/registration/employer-confirmations/", {
        waitUntil: "networkidle2",
    });

    await page.type("#login-code", code);
    await page.type("#login-number", pass);
    await sleep(2000);
    await page.click("#employerConfirmationsLogin > div.form-body.no-help-block > div.form-group.is-last > button");

    try {
        await page.waitForNavigation({
            waitUntil: 'networkidle0',
        });
        await page.type("#employerConfirmationsForm > div.form-body > ul > li:nth-child(2) > div.form-group.form-pin.search-group > input", "test");
    } catch (e) {
        flag = true;
    }

    if (flag) {
        await browser.close();
        console.log("> " + "Logged In Failed");

        return reject("Login Failed!");
    }

    //   save cookies

    const cookies = await page.cookies();
    await fs.writeFile('./cookies.json', JSON.stringify(cookies, null, 2));

    console.log("> " + "Logged In");

    await browser.close();
    resolve({ loggedIn: true });
});