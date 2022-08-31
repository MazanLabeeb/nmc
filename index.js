const scrap = require("./scrap");
const express = require("express");
const path = require("path");
const app = new express();
const port = process.env.PORT || 8080;
const fs = require('fs');
const { login } = require('./login.js');

app.use(express.urlencoded({ extended: true }));

app.use((req, res, next) => {
  console.log("> " + req.get('user-agent'));
  next();
})

function loggedIn(req, res, next) {
  if (fs.existsSync('./cookies.json')) {
    next();
  } else {
    res.redirect('login');
  }
};



app.route('/')
  .get(loggedIn, (req, res) => {
    res.sendFile(path.join(__dirname, 'view/search.html'));

  })
  .post((req, res) => {

    scrap.download(req.body.code, req.body.date).then((data) => {
      if (data.invalidDetails) {
        res.send(`<div style="border:1px solid red; margin:0 auto; width:400px;border-left-width:10px; padding:4px 28px 4px 8px;">Please enter the valid details</div>`);
      } else {
        res.download(path.join(__dirname, 'public/' + data.fileName));
        console.log("> " + "File Sent to User");
        console.log("\n");


      }


    }).catch((error) => {
      if (!error.loggedIn) {
        fs.unlink("./cookies.json", () => {
          res.redirect('/');
        });
      }
    });

  });

app.route('/login')
  .get((req, res) => {
    if (fs.existsSync('./cookies.json')) {
      res.redirect('/');
    }
    res.sendFile(path.join(__dirname, './view/login.html'));
  })
  .post((req, res) => {
    login(req.body.code, req.body.pass).then((result) => {
      if (result.loggedIn) {
        res.redirect("/");
      }
    })
      .catch(e => {
        res.send(`<div style="border:1px solid red; margin:0 auto; width:400px;border-left-width:10px; padding:4px 28px 4px 8px;">${e}</div>`);
      })
  })

app.get('/userAgent', (req, res) => {
  res.send(req.get('user-agent'));
});

app.get('/logout', (req, res) => {
  fs.unlink("./cookies.json", () => {
    res.redirect('/');
  });

})

app.use((req, res) => {
  res.status(404).send("Page Not Found!");

})

// scrap.download("03J0150O").then(()=>console.log("ok")).catch(()=>console.log("error"));

app.listen(port, () => console.log("> " + "Listening to port " + port));
